import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Search, 
  Eye, 
  Plus, 
  UserCheck, 
  MapPin, 
  Check, 
  Copy, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Resident } from '../types/population';
import { calculateAge } from '../data/mockResidents';

interface FamilyViewProps {
  residents: Resident[];
  onViewResident: (resident: Resident) => void;
  onAddMemberToKk: (noKk: string, address: string, kelurahan: string, kecamatan: string) => void;
  filterNoKk?: string;
}

export const FamilyView: React.FC<FamilyViewProps> = ({
  residents,
  onViewResident,
  onAddMemberToKk,
  filterNoKk,
}) => {
  const [searchTerm, setSearchTerm] = useState(filterNoKk || '');
  const [copiedKk, setCopiedKk] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKk(text);
    setTimeout(() => setCopiedKk(null), 2000);
  };

  // Group residents by No. KK
  const families = React.useMemo(() => {
    const map = new Map<string, Resident[]>();
    residents.forEach((r) => {
      const existing = map.get(r.noKk) || [];
      existing.push(r);
      map.set(r.noKk, existing);
    });

    const list: {
      noKk: string;
      headOfFamily: Resident | undefined;
      members: Resident[];
    }[] = [];

    map.forEach((members, noKk) => {
      // Sort so Kepala Keluarga is first, then Istri, then Anak
      const sorted = [...members].sort((a, b) => {
        const order: { [k: string]: number } = {
          'Kepala Keluarga': 1,
          'Istri': 2,
          'Anak': 3,
          'Orang Tua': 4,
          'Famili Lain': 5,
        };
        return (order[a.familyRole] || 9) - (order[b.familyRole] || 9);
      });

      const head = sorted.find((m) => m.familyRole === 'Kepala Keluarga') || sorted[0];
      list.push({
        noKk,
        headOfFamily: head,
        members: sorted,
      });
    });

    return list;
  }, [residents]);

  const filteredFamilies = families.filter((f) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      f.noKk.toLowerCase().includes(query) ||
      (f.headOfFamily && f.headOfFamily.fullName.toLowerCase().includes(query)) ||
      (f.headOfFamily && f.headOfFamily.kelurahan.toLowerCase().includes(query)) ||
      f.members.some((m) => m.fullName.toLowerCase().includes(query) || m.nik.includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Daftar Kartu Keluarga Terdaftar
          </h3>
          <p className="text-xs text-slate-500">
            Pengelompokan data penduduk berdasarkan nomor Kartu Keluarga (KK) dan susunan anggota
          </p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No. KK (16 digit) atau Nama Kepala..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Families Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredFamilies.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
            Tidak ada Kartu Keluarga yang cocok dengan pencarian
          </div>
        ) : (
          filteredFamilies.map((family) => {
            const head = family.headOfFamily;
            return (
              <div
                key={family.noKk}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          NOMOR KK
                        </span>
                        <button
                          onClick={() => copyToClipboard(family.noKk)}
                          title="Salin No KK"
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {copiedKk === family.noKk ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-base font-black font-mono text-slate-900 mt-1">
                        {family.noKk}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-mono font-bold text-xs">
                        {family.members.length} Anggota
                      </span>
                    </div>
                  </div>

                  {/* Kepala Keluarga Info */}
                  {head && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        KEPALA KELUARGA
                      </span>
                      <div className="font-extrabold text-slate-900 text-sm">{head.fullName}</div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {head.address}, RT {head.rt}/RW {head.rw}, Kel. {head.kelurahan}, Kec. {head.kecamatan}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Family Members List */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-slate-700 block">
                      Susunan Anggota Keluarga:
                    </span>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                      {family.members.map((member) => {
                        const age = calculateAge(member.birthDate);
                        return (
                          <div
                            key={member.id}
                            className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{member.fullName}</span>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                    member.familyRole === 'Kepala Keluarga'
                                      ? 'bg-blue-100 text-blue-800'
                                      : member.familyRole === 'Istri'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {member.familyRole}
                                </span>
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                NIK: {member.nik} • {age} thn ({member.gender})
                              </p>
                            </div>

                            <button
                              onClick={() => onViewResident(member)}
                              title="Lihat Profil"
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action: Tambah Anggota ke KK ini */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  {head && (
                    <button
                      onClick={() =>
                        onAddMemberToKk(family.noKk, head.address, head.kelurahan, head.kecamatan)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Tambah Anggota ke KK Ini</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
