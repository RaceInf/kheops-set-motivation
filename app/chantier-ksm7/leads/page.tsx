'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Users, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TableSkeleton, Skeleton } from '@/components/admin/AdminSkeletons';
import AnimatedNumber from '@/components/admin/AnimatedNumber';

interface Contact {
  email: string;
  createdAt: string;
  modifiedAt: string;
}

export default function AdminLeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads?limit=${limit}&offset=${offset}`);
      const data = await res.json();
      setContacts(data.contacts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, [offset]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Leads Newsletter
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Contacts synchronisés via Brevo</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50 group"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            Actualiser
          </button>
        </motion.div>
      </div>

      {/* Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-white/10 bg-zinc-950 p-8 flex items-center gap-8 group hover:border-white/20 transition-all relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-gold/50" />
        <div className="w-16 h-16 bg-gold/10 flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform duration-500">
          <Users className="w-8 h-8 text-gold" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="font-display text-5xl tracking-tight text-white group-hover:text-gold transition-colors">
            {!loading || total > 0 ? <AnimatedNumber value={total} /> : <Skeleton className="h-10 w-20" />}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            Contacts enregistrés
          </div>
        </div>
      </motion.div>

      {/* Table Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl"
      >
        {loading && contacts.length === 0 ? (
          <TableSkeleton rows={10} columns={3} />
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-full">
              <Mail className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/20 text-[11px] font-black uppercase tracking-widest text-center">Aucun contact trouvé dans votre base.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5 w-20">#</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Email Adresse</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Date d'inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {contacts.map((contact, idx) => (
                    <motion.tr 
                      key={`${contact.email}-${idx}`} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="p-5 text-[11px] text-white/20 font-mono font-bold">
                        {(offset + idx + 1).toString().padStart(3, '0')}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/5 flex items-center justify-center rounded-full group-hover:bg-gold/10 transition-colors">
                            <Mail className="w-3.5 h-3.5 text-white/20 group-hover:text-gold/60 transition-colors" />
                          </div>
                          <span className="text-[13px] text-white/80 font-medium group-hover:text-white transition-colors">{contact.email}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[11px] text-white/40 font-mono font-bold">
                          {formatDate(contact.createdAt)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-between items-center px-8 py-6 border-t border-white/10 bg-white/[0.01]">
            <button
              onClick={() => setOffset(o => Math.max(0, o - limit))}
              disabled={offset === 0}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            
            <div className="text-[10px] text-white/20 font-mono font-bold uppercase tracking-widest">
              Affichage <span className="text-gold">{offset + 1}</span> – <span className="text-gold">{Math.min(offset + limit, total)}</span> <span className="mx-2 opacity-30">/</span> {total} contacts
            </div>

            <button
              onClick={() => setOffset(o => o + limit)}
              disabled={offset + limit >= total}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              Suivant <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
