'use client';

import { useEffect, useState } from 'react';
import { 
  RefreshCw, CheckCircle2, XCircle, Clock, 
  ChevronDown, ChevronUp, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '@/components/admin/AdminSkeletons';
import AnimatedNumber from '@/components/admin/AnimatedNumber';

interface WebhookEvent {
  id: string;
  date: string;
  provider: string;
  eventType: string;
  status: string;
  processedAt: string | null;
  errorMessage: string | null;
  payload: any;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PROCESSED: { label: 'Traité', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  PENDING: { label: 'Attente', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
  FAILED: { label: 'Échoué', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

export default function AdminWebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/webhooks');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to fetch webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWebhooks(); }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const stats = {
    total: events.length,
    processed: events.filter(e => e.status === 'PROCESSED').length,
    failed: events.filter(e => e.status === 'FAILED').length,
    pending: events.filter(e => e.status === 'PENDING').length,
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
            Webhooks
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Journal temps réel des événements Tara Money
          </p>
        </motion.div>
        
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={fetchWebhooks}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50 group"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-gold' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          Actualiser
        </motion.button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Succès', value: stats.processed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Attente', value: stats.pending, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Échecs', value: stats.failed, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="border border-white/10 bg-zinc-950 p-6 flex flex-col items-center justify-center gap-2 relative overflow-hidden group"
          >
            <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className={`font-display text-4xl ${stat.color} relative z-10`}>
              {!loading ? <AnimatedNumber value={stat.value} /> : <Skeleton className="h-8 w-12 mx-auto" />}
            </div>
            <div className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 relative z-10">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Events List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl"
      >
        {loading && events.length === 0 ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white/5 flex items-center justify-center rounded-full">
              <Activity className="w-8 h-8 text-white/10" />
            </div>
            <p className="text-white/20 text-[11px] font-black uppercase tracking-widest">Aucun événement webhook enregistré.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {events.map((event, idx) => {
                const statusConf = STATUS_MAP[event.status] || STATUS_MAP.PENDING;
                const StatusIcon = statusConf.icon;
                const isExpanded = expandedId === event.id;

                return (
                  <motion.div 
                    key={event.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-white/[0.02] transition-all group"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : event.id)}
                      className="w-full flex items-center gap-6 p-6 text-left cursor-pointer outline-none"
                    >
                      <div className={`w-10 h-10 ${statusConf.bg} flex items-center justify-center rounded-sm shrink-0 transition-transform group-hover:scale-110`}>
                        <StatusIcon className={`w-5 h-5 ${statusConf.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 flex-wrap mb-1.5">
                          <span className="text-[13px] text-white font-black uppercase tracking-tight group-hover:text-gold transition-colors">{event.eventType}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${statusConf.bg} ${statusConf.color} rounded-full`}>
                            {statusConf.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                          <span className="font-mono">{formatDate(event.date)}</span>
                          <span className="h-3 w-px bg-white/10" />
                          <span className="font-mono text-[9px]">ID: {event.id}</span>
                          {event.errorMessage && (
                            <>
                              <span className="h-3 w-px bg-white/10" />
                              <span className="text-red-400 normal-case">• {event.errorMessage}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-4">
                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20 px-3 py-1 border border-white/5 group-hover:border-white/10">
                          Payload
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/20 transition-colors group-hover:text-white" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/20 transition-colors group-hover:text-white" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="bg-black border border-white/10 p-5 rounded-sm relative group/code">
                              <div className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest text-white/20 group-hover/code:text-white/40 transition-colors">JSON PAYLOAD</div>
                              <pre className="text-[12px] text-emerald-400/80 font-mono overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(event.payload, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
