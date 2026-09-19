import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface QueueTicketData {
  id: string;
  ticketNumber: string;
  nik: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  bookingDate: string;
  timeSlot: string;
  notes?: string;
  status: 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'SKIPPED';
  counterId?: number | null;
  counterName?: string | null;
  createdAt: string;
  calledAt?: string | null;
  servedAt?: string | null;
  completedAt?: string | null;
}

interface CounterData {
  id: number;
  name: string;
  officerName: string;
  assignedServices: string[];
  status: 'AVAILABLE' | 'CALLING' | 'SERVING' | 'BREAK' | 'CLOSED';
  currentTicketNumber?: string | null;
  currentTicketId?: string | null;
  currentServiceName?: string | null;
  totalServedToday: number;
}

const SERVICE_NAMES: Record<string, string> = {
  KTP: 'Perekaman & Cetak e-KTP',
  KK: 'Penerbitan Kartu Keluarga (KK)',
  AKTA: 'Akta Kelahiran & Catatan Sipil',
  KIA_IKD: 'KIA & Identitas Kependudukan Digital',
  KONSULTASI: 'Konsultasi & Pengaduan Data NIK',
};

const SERVICE_PREFIXES: Record<string, string> = {
  KTP: 'A',
  KK: 'B',
  AKTA: 'C',
  KIA_IKD: 'D',
  KONSULTASI: 'E',
};

// Initial state generator
function generateInitialState() {
  const todayStr = new Date().toISOString().split('T')[0];

  const initialCounters: CounterData[] = [
    {
      id: 1,
      name: 'Loket 1 - e-KTP & Biometrik',
      officerName: 'Rian Pratama, S.STP',
      assignedServices: ['KTP'],
      status: 'SERVING',
      currentTicketNumber: 'A-003',
      currentTicketId: 'ticket-a-003',
      currentServiceName: 'Perekaman & Cetak e-KTP',
      totalServedToday: 2,
    },
    {
      id: 2,
      name: 'Loket 2 - Kartu Keluarga & Pindah',
      officerName: 'Dewi Lestari, S.Sos',
      assignedServices: ['KK'],
      status: 'SERVING',
      currentTicketNumber: 'B-002',
      currentTicketId: 'ticket-b-002',
      currentServiceName: 'Penerbitan Kartu Keluarga (KK)',
      totalServedToday: 1,
    },
    {
      id: 3,
      name: 'Loket 3 - Akta Catatan Sipil',
      officerName: 'Budi Santoso, S.Kom',
      assignedServices: ['AKTA'],
      status: 'AVAILABLE',
      currentTicketNumber: null,
      currentTicketId: null,
      currentServiceName: null,
      totalServedToday: 2,
    },
    {
      id: 4,
      name: 'Loket 4 - KIA & IKD Digital',
      officerName: 'Siti Rahmawati, A.Md',
      assignedServices: ['KIA_IKD'],
      status: 'AVAILABLE',
      currentTicketNumber: null,
      currentTicketId: null,
      currentServiceName: null,
      totalServedToday: 3,
    },
    {
      id: 5,
      name: 'Loket 5 - Konsultasi & Pengaduan',
      officerName: 'Agus Setiawan, S.H.',
      assignedServices: ['KONSULTASI'],
      status: 'SERVING',
      currentTicketNumber: 'E-001',
      currentTicketId: 'ticket-e-001',
      currentServiceName: 'Konsultasi & Pengaduan Data NIK',
      totalServedToday: 1,
    },
  ];

  const initialTickets: QueueTicketData[] = [
    // Completed
    {
      id: 'ticket-a-001',
      ticketNumber: 'A-001',
      nik: '3273250102900001',
      fullName: 'Ahmad Fauzi',
      phoneNumber: '081234567801',
      serviceId: 'KTP',
      serviceName: 'Perekaman & Cetak e-KTP',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'COMPLETED',
      counterId: 1,
      counterName: 'Loket 1 - e-KTP & Biometrik',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    },
    {
      id: 'ticket-a-002',
      ticketNumber: 'A-002',
      nik: '3273250203920002',
      fullName: 'Nurul Hidayah',
      phoneNumber: '081234567802',
      serviceId: 'KTP',
      serviceName: 'Perekaman & Cetak e-KTP',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'COMPLETED',
      counterId: 1,
      counterName: 'Loket 1 - e-KTP & Biometrik',
      createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 1.1).toISOString(),
    },
    {
      id: 'ticket-b-001',
      ticketNumber: 'B-001',
      nik: '3273250304880003',
      fullName: 'Hendra Gunawan',
      phoneNumber: '081234567803',
      serviceId: 'KK',
      serviceName: 'Penerbitan Kartu Keluarga (KK)',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'COMPLETED',
      counterId: 2,
      counterName: 'Loket 2 - Kartu Keluarga & Pindah',
      createdAt: new Date(Date.now() - 3600000 * 2.2).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 1.6).toISOString(),
    },
    {
      id: 'ticket-c-001',
      ticketNumber: 'C-001',
      nik: '3273250405950004',
      fullName: 'Fitri Handayani',
      phoneNumber: '081234567804',
      serviceId: 'AKTA',
      serviceName: 'Akta Kelahiran & Catatan Sipil',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'COMPLETED',
      counterId: 3,
      counterName: 'Loket 3 - Akta Catatan Sipil',
      createdAt: new Date(Date.now() - 3600000 * 2.1).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 1.4).toISOString(),
    },
    // Currently Serving
    {
      id: 'ticket-a-003',
      ticketNumber: 'A-003',
      nik: '3273250506970005',
      fullName: 'Dimas Prasetyo',
      phoneNumber: '081234567805',
      serviceId: 'KTP',
      serviceName: 'Perekaman & Cetak e-KTP',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'SERVING',
      counterId: 1,
      counterName: 'Loket 1 - e-KTP & Biometrik',
      createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      servedAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'ticket-b-002',
      ticketNumber: 'B-002',
      nik: '3273250607910006',
      fullName: 'Ratna Sari Dewi',
      phoneNumber: '081234567806',
      serviceId: 'KK',
      serviceName: 'Penerbitan Kartu Keluarga (KK)',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'SERVING',
      counterId: 2,
      counterName: 'Loket 2 - Kartu Keluarga & Pindah',
      createdAt: new Date(Date.now() - 3600000 * 1.1).toISOString(),
      servedAt: new Date(Date.now() - 400000).toISOString(),
    },
    {
      id: 'ticket-e-001',
      ticketNumber: 'E-001',
      nik: '3273250708890007',
      fullName: 'Bambang Irawan',
      phoneNumber: '081234567807',
      serviceId: 'KONSULTASI',
      serviceName: 'Konsultasi & Pengaduan Data NIK',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'SERVING',
      counterId: 5,
      counterName: 'Loket 5 - Konsultasi & Pengaduan',
      createdAt: new Date(Date.now() - 3600000 * 0.9).toISOString(),
      servedAt: new Date(Date.now() - 300000).toISOString(),
    },
    // Waiting
    {
      id: 'ticket-a-004',
      ticketNumber: 'A-004',
      nik: '3273250809930008',
      fullName: 'Siti Marlina',
      phoneNumber: '081234567808',
      serviceId: 'KTP',
      serviceName: 'Perekaman & Cetak e-KTP',
      bookingDate: todayStr,
      timeSlot: 'Sesi 1: 08:00 - 10:00 WIB',
      status: 'WAITING',
      createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    },
    {
      id: 'ticket-a-005',
      ticketNumber: 'A-005',
      nik: '3273250910940009',
      fullName: 'Reza Kurniawan',
      phoneNumber: '081234567809',
      serviceId: 'KTP',
      serviceName: 'Perekaman & Cetak e-KTP',
      bookingDate: todayStr,
      timeSlot: 'Sesi 2: 10:00 - 12:00 WIB',
      status: 'WAITING',
      createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    },
    {
      id: 'ticket-b-003',
      ticketNumber: 'B-003',
      nik: '3273251011960010',
      fullName: 'Tri Wahyuni',
      phoneNumber: '081234567810',
      serviceId: 'KK',
      serviceName: 'Penerbitan Kartu Keluarga (KK)',
      bookingDate: todayStr,
      timeSlot: 'Sesi 2: 10:00 - 12:00 WIB',
      status: 'WAITING',
      createdAt: new Date(Date.now() - 3600000 * 0.4).toISOString(),
    },
    {
      id: 'ticket-c-002',
      ticketNumber: 'C-002',
      nik: '3273251112980011',
      fullName: 'Fajar Maulana',
      phoneNumber: '081234567811',
      serviceId: 'AKTA',
      serviceName: 'Akta Kelahiran & Catatan Sipil',
      bookingDate: todayStr,
      timeSlot: 'Sesi 2: 10:00 - 12:00 WIB',
      status: 'WAITING',
      createdAt: new Date(Date.now() - 3600000 * 0.3).toISOString(),
    },
    {
      id: 'ticket-d-001',
      ticketNumber: 'D-001',
      nik: '3273251201990012',
      fullName: 'Maya Anggraini',
      phoneNumber: '081234567812',
      serviceId: 'KIA_IKD',
      serviceName: 'KIA & Identitas Kependudukan Digital',
      bookingDate: todayStr,
      timeSlot: 'Sesi 2: 10:00 - 12:00 WIB',
      status: 'WAITING',
      createdAt: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    },
  ];

  return { initialCounters, initialTickets };
}

let { initialCounters: counters, initialTickets: tickets } = generateInitialState();

// Track SSE connections
const sseClients = new Set<Response>();

function broadcastSSE(eventType: string, data: unknown) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

function calculateStats() {
  const totalRegistered = tickets.length;
  const totalWaiting = tickets.filter((t) => t.status === 'WAITING').length;
  const totalServing = tickets.filter((t) => t.status === 'SERVING' || t.status === 'CALLED').length;
  const totalCompleted = tickets.filter((t) => t.status === 'COMPLETED').length;
  const totalSkipped = tickets.filter((t) => t.status === 'SKIPPED').length;

  return {
    totalRegistered,
    totalWaiting,
    totalServing,
    totalCompleted,
    totalSkipped,
    averageWaitMinutes: 14,
    averageServiceMinutes: 11,
  };
}

function getFullQueuePayload() {
  return {
    tickets,
    counters,
    stats: calculateStats(),
    lastUpdated: new Date().toISOString(),
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // SSE stream endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    res.write(`event: INITIAL_STATE\ndata: ${JSON.stringify(getFullQueuePayload())}\n\n`);
    sseClients.add(res);

    // Heartbeat every 15s to keep connection alive
    const heartbeatInterval = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
      sseClients.delete(res);
    });
  });

  // GET queue data
  app.get('/api/queue', (_req: Request, res: Response) => {
    res.json(getFullQueuePayload());
  });

  // POST create online registration ticket
  app.post('/api/tickets', (req: Request, res: Response) => {
    try {
      const { nik, fullName, phoneNumber, email, serviceId, bookingDate, timeSlot, notes } = req.body;

      if (!nik || !fullName || !phoneNumber || !serviceId) {
        res.status(400).json({ error: 'NIK, Nama Lengkap, Nomor HP, dan Jenis Layanan wajib diisi.' });
        return;
      }

      const prefix = SERVICE_PREFIXES[serviceId] || 'A';
      const serviceName = SERVICE_NAMES[serviceId] || 'Layanan Dukcapil';

      // Find highest sequence number for this prefix
      const prefixTickets = tickets.filter((t) => t.ticketNumber.startsWith(prefix));
      const nextSequence = prefixTickets.length + 1;
      const formattedSeq = nextSequence.toString().padStart(3, '0');
      const ticketNumber = `${prefix}-${formattedSeq}`;

      const newTicket: QueueTicketData = {
        id: `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ticketNumber,
        nik: String(nik).trim(),
        fullName: String(fullName).trim(),
        phoneNumber: String(phoneNumber).trim(),
        email: email ? String(email).trim() : undefined,
        serviceId,
        serviceName,
        bookingDate: bookingDate || new Date().toISOString().split('T')[0],
        timeSlot: timeSlot || 'Sesi 1: 08:00 - 10:00 WIB',
        notes: notes ? String(notes).trim() : undefined,
        status: 'WAITING',
        createdAt: new Date().toISOString(),
      };

      tickets.push(newTicket);

      // Broadcast update & notification event
      broadcastSSE('TICKET_REGISTERED', {
        ticket: newTicket,
        fullState: getFullQueuePayload(),
      });

      res.status(201).json({
        success: true,
        ticket: newTicket,
        message: `Pendaftaran berhasil. Nomor antrian Anda adalah ${ticketNumber}`,
      });
    } catch (err) {
      console.error('Error creating ticket:', err);
      res.status(500).json({ error: 'Terjadi kesalahan sistem saat mendaftar antrean.' });
    }
  });

  // POST call ticket
  app.post('/api/counters/call', (req: Request, res: Response) => {
    try {
      const { counterId, ticketId } = req.body;
      const counter = counters.find((c) => c.id === Number(counterId));
      if (!counter) {
        res.status(404).json({ error: 'Loket tidak ditemukan.' });
        return;
      }

      let ticketToCall: QueueTicketData | undefined;

      if (ticketId) {
        ticketToCall = tickets.find((t) => t.id === ticketId);
      } else {
        // Find next waiting ticket for the services assigned to this counter
        ticketToCall = tickets.find(
          (t) => t.status === 'WAITING' && counter.assignedServices.includes(t.serviceId)
        );
      }

      if (!ticketToCall) {
        res.status(400).json({ error: 'Tidak ada antrean yang sedang menunggu untuk loket ini.' });
        return;
      }

      // If counter was previously serving another ticket, complete it or keep track
      ticketToCall.status = 'CALLED';
      ticketToCall.counterId = counter.id;
      ticketToCall.counterName = counter.name;
      ticketToCall.calledAt = new Date().toISOString();

      counter.status = 'CALLING';
      counter.currentTicketId = ticketToCall.id;
      counter.currentTicketNumber = ticketToCall.ticketNumber;
      counter.currentServiceName = ticketToCall.serviceName;

      const announcementPayload = {
        id: `ann-${Date.now()}`,
        ticketNumber: ticketToCall.ticketNumber,
        counterId: counter.id,
        counterName: counter.name,
        serviceName: ticketToCall.serviceName,
        citizenName: ticketToCall.fullName,
        spokenText: `Nomor antrian ${ticketToCall.ticketNumber}, silakan menuju ${counter.name}`,
        timestamp: new Date().toISOString(),
      };

      broadcastSSE('CALL_ANNOUNCEMENT', announcementPayload);
      broadcastSSE('QUEUE_UPDATE', getFullQueuePayload());

      res.json({
        success: true,
        counter,
        ticket: ticketToCall,
        announcement: announcementPayload,
      });
    } catch (err) {
      console.error('Error calling ticket:', err);
      res.status(500).json({ error: 'Gagal memanggil antrean.' });
    }
  });

  // POST recall ticket (repeat announcement)
  app.post('/api/counters/recall', (req: Request, res: Response) => {
    try {
      const { counterId } = req.body;
      const counter = counters.find((c) => c.id === Number(counterId));
      if (!counter || !counter.currentTicketId) {
        res.status(400).json({ error: 'Tidak ada antrean aktif pada loket ini untuk dipanggil ulang.' });
        return;
      }

      const ticket = tickets.find((t) => t.id === counter.currentTicketId);
      if (!ticket) {
        res.status(404).json({ error: 'Tiket tidak ditemukan.' });
        return;
      }

      const announcementPayload = {
        id: `ann-${Date.now()}`,
        ticketNumber: ticket.ticketNumber,
        counterId: counter.id,
        counterName: counter.name,
        serviceName: ticket.serviceName,
        citizenName: ticket.fullName,
        spokenText: `Panggilan ulang. Nomor antrian ${ticket.ticketNumber}, silakan segera menuju ${counter.name}`,
        timestamp: new Date().toISOString(),
      };

      broadcastSSE('CALL_ANNOUNCEMENT', announcementPayload);
      res.json({ success: true, announcement: announcementPayload });
    } catch (err) {
      console.error('Error recalling ticket:', err);
      res.status(500).json({ error: 'Gagal memanggil ulang antrean.' });
    }
  });

  // POST start serving
  app.post('/api/counters/serve', (req: Request, res: Response) => {
    try {
      const { counterId } = req.body;
      const counter = counters.find((c) => c.id === Number(counterId));
      if (!counter || !counter.currentTicketId) {
        res.status(400).json({ error: 'Tidak ada antrean yang dapat dilayani.' });
        return;
      }

      const ticket = tickets.find((t) => t.id === counter.currentTicketId);
      if (ticket) {
        ticket.status = 'SERVING';
        ticket.servedAt = new Date().toISOString();
      }

      counter.status = 'SERVING';

      broadcastSSE('QUEUE_UPDATE', getFullQueuePayload());
      res.json({ success: true, counter, ticket });
    } catch (err) {
      console.error('Error starting service:', err);
      res.status(500).json({ error: 'Gagal memulai pelayanan.' });
    }
  });

  // POST complete ticket
  app.post('/api/counters/complete', (req: Request, res: Response) => {
    try {
      const { counterId } = req.body;
      const counter = counters.find((c) => c.id === Number(counterId));
      if (!counter) {
        res.status(404).json({ error: 'Loket tidak ditemukan.' });
        return;
      }

      if (counter.currentTicketId) {
        const ticket = tickets.find((t) => t.id === counter.currentTicketId);
        if (ticket) {
          ticket.status = 'COMPLETED';
          ticket.completedAt = new Date().toISOString();
        }
        counter.totalServedToday += 1;
      }

      counter.status = 'AVAILABLE';
      counter.currentTicketId = null;
      counter.currentTicketNumber = null;
      counter.currentServiceName = null;

      broadcastSSE('QUEUE_UPDATE', getFullQueuePayload());
      res.json({ success: true, counter });
    } catch (err) {
      console.error('Error completing ticket:', err);
      res.status(500).json({ error: 'Gagal menyelesaikan pelayanan.' });
    }
  });

  // POST skip ticket (warga tidak hadir)
  app.post('/api/counters/skip', (req: Request, res: Response) => {
    try {
      const { counterId } = req.body;
      const counter = counters.find((c) => c.id === Number(counterId));
      if (!counter) {
        res.status(404).json({ error: 'Loket tidak ditemukan.' });
        return;
      }

      if (counter.currentTicketId) {
        const ticket = tickets.find((t) => t.id === counter.currentTicketId);
        if (ticket) {
          ticket.status = 'SKIPPED';
        }
      }

      counter.status = 'AVAILABLE';
      counter.currentTicketId = null;
      counter.currentTicketNumber = null;
      counter.currentServiceName = null;

      broadcastSSE('QUEUE_UPDATE', getFullQueuePayload());
      res.json({ success: true, counter });
    } catch (err) {
      console.error('Error skipping ticket:', err);
      res.status(500).json({ error: 'Gagal melewati antrean.' });
    }
  });

  // POST toggle counter status (break, open, close)
  app.post('/api/counters/status', (req: Request, res: Response) => {
    try {
      const { counterId, status } = req.body;
      const counter = counters.find((c) => c.id === Number(counterId));
      if (!counter) {
        res.status(404).json({ error: 'Loket tidak ditemukan.' });
        return;
      }

      counter.status = status;
      broadcastSSE('QUEUE_UPDATE', getFullQueuePayload());
      res.json({ success: true, counter });
    } catch (err) {
      console.error('Error updating counter status:', err);
      res.status(500).json({ error: 'Gagal mengubah status loket.' });
    }
  });

  // POST reset demo
  app.post('/api/reset-demo', (_req: Request, res: Response) => {
    const fresh = generateInitialState();
    counters = fresh.initialCounters;
    tickets = fresh.initialTickets;
    broadcastSSE('QUEUE_UPDATE', getFullQueuePayload());
    res.json({ success: true, message: 'Data antrean demo berhasil diatur ulang.' });
  });

  // Vite middleware setup for SPA
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dukcapil Queue Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
