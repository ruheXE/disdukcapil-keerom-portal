/**
 * Audio announcer for Dukcapil queue calling system.
 * Generates an airport-style chime using Web Audio API
 * and speaks the Indonesian queue announcement using Web Speech API.
 */

class AudioAnnouncer {
  private audioCtx: AudioContext | null = null;
  private isSpeaking = false;
  private queue: Array<{ text: string; onComplete?: () => void }> = [];

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays a pleasant 3-tone chime (Dong - Ding - Dang) common in Indonesian public service queues
   */
  public playChime(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const now = ctx.currentTime;
        const notes = [
          { freq: 523.25, time: 0, duration: 0.35 },    // C5
          { freq: 659.25, time: 0.28, duration: 0.35 }, // E5
          { freq: 783.99, time: 0.56, duration: 0.7 },  // G5
        ];

        notes.forEach(({ freq, time, duration }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          // Envelope for smooth bell-like sound
          gain.gain.setValueAtTime(0.001, now + time);
          gain.gain.exponentialRampToValueAtTime(0.28, now + time + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + time + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + duration + 0.05);
        });

        setTimeout(() => {
          resolve();
        }, 1100);
      } catch (e) {
        console.warn('AudioContext chime failed:', e);
        resolve();
      }
    });
  }

  /**
   * Speak queue announcement in Indonesian:
   * e.g. "Nomor Antrian: A, 0, 1, 4. Silakan menuju Loket 1"
   */
  public announceQueue(ticketNumber: string, counterName: string): Promise<void> {
    return new Promise(async (resolve) => {
      await this.playChime();

      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      try {
        window.speechSynthesis.cancel();

        // Convert ticket number like "A-014" to separated spoken characters "A, kosong, satu, empat"
        const prefix = ticketNumber.charAt(0);
        const numbers = ticketNumber.slice(2).split('');
        const spokenDigits = numbers
          .map((d) => {
            switch (d) {
              case '0': return 'kosong';
              case '1': return 'satu';
              case '2': return 'dua';
              case '3': return 'tiga';
              case '4': return 'empat';
              case '5': return 'lima';
              case '6': return 'enam';
              case '7': return 'tujuh';
              case '8': return 'delapan';
              case '9': return 'sembilan';
              default: return d;
            }
          })
          .join(' ');

        const spokenPhrase = `Nomor antrian... ${prefix}... ${spokenDigits}... Silakan menuju... ${counterName}.`;

        const utterance = new SpeechSynthesisUtterance(spokenPhrase);
        utterance.lang = 'id-ID';
        utterance.rate = 0.9; // clear pacing
        utterance.pitch = 1.05;

        // Try to pick an Indonesian voice if available
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.startsWith('id') || v.name.toLowerCase().includes('indonesia'));
        if (idVoice) {
          utterance.voice = idVoice;
        }

        utterance.onend = () => {
          resolve();
        };
        utterance.onerror = () => {
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis failed:', err);
        resolve();
      }
    });
  }

  /**
   * Simple short notification sound for citizen alerts
   */
  public playAlertNotification(): void {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // ignore audio context restrictions before interaction
    }
  }
}

export const announcer = new AudioAnnouncer();
