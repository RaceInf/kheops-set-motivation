'use client';

import { useEffect, useState } from 'react';
import { 
  Mail, MessageCircle, AlertCircle, CheckCircle2, 
  TrendingUp, Clock, RefreshCw, ChevronRight,
  MousePointer2, Zap, BarChart3, ChevronDown, User, Hash, Calendar, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedNumber from '@/components/admin/AnimatedNumber';
import { Skeleton, CardSkeleton } from '@/components/admin/AdminSkeletons';

interface MarketingEvent {
  id: string;
  date: string;
  eventType: string;
  status: string;
  payload: {
    orderId?: string;
    email?: string;
    sentAt?: string;
    error?: string;
    reminderType?: string;
    manual?: boolean;
    customerName?: string;
    whatsappNumber?: string;
    productName?: string;
    [key: string]: any;
  };
}

interface MarketingStats {
  totalAbandoned: number;
  totalRecovered: number;
  recoveryRate: number;
  emailsSent: number;
  whatsappClicks: number;
  pendingSequence: number;
}

const ITEMS_PER_PAGE = 20;

export default function AdminMarketingPage() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/marketing/stats');
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      const data = await res.json();
      setEvents(data.events || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Failed to fetch marketing data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getEventIcon = (type: string, status: string) => {
    if (status === 'FAILED') return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (type === 'brevo_opened') return <MousePointer2 className="w-4 h-4 text-amber-400" />;
    if (type === 'brevo_click') return <Zap className="w-4 h-4 text-gold" />;
    if (type.includes('whatsapp')) return <MessageCircle className="w-4 h-4 text-emerald-400" />;
    return <Mail className="w-4 h-4 text-gold" />;
  };

  const getEventLabel = (type: string) => {
    if (type.startsWith('brevo_')) {
      const event = type.replace('brevo_', '');
      switch (event) {
        case 'opened': return 'Email Ouvert par le client';
        case 'click': return 'Lien cliqué dans l\'email';
        case 'delivered': return 'Email délivré avec succès';
        case 'hard_bounce': return 'Email Inexistant (Hard Bounce)';
        case 'soft_bounce': return 'Boîte pleine (Soft Bounce)';
        default: return `Suivi Email: ${event}`;
      }
    }
    switch (type) {
      case 'reminder_h1': return 'Email Relance H+1';
      case 'reminder_h24': return 'Email Relance H+24';
      case 'reminder_h72': return 'Email Relance H+72';
      case 'whatsapp_relance': return 'Relance WhatsApp (Manuelle)';
      default: return type;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE);
  const currentEvents = events.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Marketing & Relances
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Performance de la séquence de récupération de paniers
          </p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-gold hover:border-gold transition-all group"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-gold' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {!stats ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Valeur Abandonnée" value={stats.totalAbandoned} isCurrency icon={Clock} color="text-white/40" />
            <StatCard label="Valeur Récupérée" value={stats.totalRecovered} isCurrency icon={TrendingUp} color="text-emerald-400" accent />
            <StatCard label="Taux de Récupération" value={stats.recoveryRate} suffix="%" icon={Zap} color="text-gold" />
            <StatCard label="En cours de séquence" value={stats.pendingSequence} icon={BarChart3} color="text-blue-400" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Journal d'activités marketing ({events.length})
            </h3>
          </div>

          <div className="border border-white/10 bg-zinc-950 divide-y divide-white/5 overflow-hidden">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="p-6 h-20 animate-pulse bg-white/5 m-1" />)
            ) : currentEvents.length === 0 ? (
              <div className="p-20 text-center text-white/20 text-[11px] font-bold uppercase tracking-widest">Aucune activité.</div>
            ) : (
              currentEvents.map((event, idx) => (
                <div key={event.id} className="flex flex-col border-b border-white/5 last:border-0">
                  <button 
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 border border-white/5 flex items-center justify-center bg-black">
                        {getEventIcon(event.eventType, event.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-black uppercase tracking-tight text-white/80">{getEventLabel(event.eventType)}</span>
                          {event.status === 'FAILED' && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 font-bold uppercase">Échec</span>}
                        </div>
                        <div className="text-[10px] text-white/30 font-mono mt-1">{event.payload.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-white/40 font-mono">{formatDate(event.date)}</div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${expandedId === event.id ? 'rotate-180 text-gold' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedId === event.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-white/[0.01]"
                      >
                        <div className="p-6 pt-0 flex flex-col gap-4 border-l-2 border-gold/20 mb-4 ml-14">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
                            <DetailItem icon={User} label="Nom Client" value={event.payload.customerName || 'N/A'} />
                            <DetailItem icon={Mail} label="Email" value={event.payload.email} />
                            <DetailItem icon={MessageCircle} label="WhatsApp" value={event.payload.whatsappNumber || 'N/A'} />
                            <DetailItem icon={Package} label="Produit" value={event.payload.productName || 'N/A'} />
                            <DetailItem icon={Hash} label="Commande ID" value={event.payload.orderId} />
                            <DetailItem icon={Calendar} label="Date Précise" value={formatDate(event.date)} />
                          </div>
                          {event.payload.error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20">
                              <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" /> Diagnostic de l'erreur
                              </p>
                              <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                                {translateError(event.payload.error)}
                              </p>
                              <p className="text-[8px] text-white/20 font-mono mt-3 uppercase tracking-tighter">
                                Code technique : {event.payload.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-4">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-gold hover:text-gold transition-all"
              >
                Précédent
              </button>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Page {currentPage} sur {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-gold hover:text-gold transition-all"
              >
                Suivant
              </button>
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="flex flex-col gap-6">
          <div className="border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-6">Canaux de conversion</h3>
            <div className="space-y-6">
              <ChannelMetric label="Email Automatique" count={stats?.emailsSent || 0} color="bg-gold" />
              <ChannelMetric label="WhatsApp Manuel" count={stats?.whatsappClicks || 0} color="bg-emerald-500" />
            </div>
          </div>
          
          <div className="border border-white/10 bg-white/[0.02] p-6">
             <div className="flex items-center gap-3 text-gold mb-4">
               <Zap className="w-5 h-5" />
               <span className="text-xs font-black uppercase tracking-widest">Optimisation</span>
             </div>
             <p className="text-[11px] text-white/60 leading-relaxed uppercase tracking-widest font-bold">
               Le système de relance automatique maximise votre ROI en récupérant les indécis sans effort manuel.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-1.5">
        <Icon className="w-2.5 h-2.5" /> {label}
      </span>
      <span className="text-[10px] font-mono text-white/70 break-all">{value}</span>
    </div>
  );
}

function StatCard({ label, value, isCurrency = false, suffix = '', icon: Icon, color, accent = false }: any) {
  return (
    <div className={`border border-white/10 bg-zinc-950 p-6 flex flex-col gap-4 hover:border-white/20 transition-all group ${accent ? 'ring-1 ring-emerald-500/20' : ''}`}>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
        <Icon className={`w-4 h-4 ${color} opacity-40 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div className={`font-display text-3xl tracking-tight text-white ${accent ? 'text-emerald-400' : 'group-hover:text-gold'} transition-colors`}>
        <AnimatedNumber value={value || 0} suffix={isCurrency ? ' FCFA' : suffix} />
      </div>
    </div>
  );
}

function ChannelMetric({ label, count, color }: any) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
        <span className="text-white/40">{label}</span>
        <span className="text-white">{count} envois</span>
      </div>
      <div className="h-1 bg-white/5 w-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: count > 0 ? '100%' : '0%' }}
          className={`h-full ${color}`}
        />
      </div>
    </div>
  );
}

function translateError(error: string) {
  const err = error.toLowerCase();
  if (err.includes('invalid_parameter') || err.includes('valid email')) {
    return "L'adresse email saisie par le client est invalide ou mal orthographiée (ex: oubli du @).";
  }
  if (err.includes('hard_bounce') || err.includes('not exist')) {
    return "L'adresse email n'existe pas ou le serveur du client a rejeté définitivement le message.";
  }
  if (err.includes('soft_bounce') || err.includes('full')) {
    return "La boîte de réception du client est pleine ou temporairement indisponible.";
  }
  if (err.includes('quota')) {
    return "Votre quota d'envois Brevo est épuisé. Vérifiez votre abonnement.";
  }
  if (err.includes('unauthorized') || err.includes('api_key')) {
    return "Erreur d'authentification avec Brevo. Vérifiez votre clé API dans .env.local.";
  }
  if (err.includes('resend') || err.includes('too many')) {
    return "Trop de tentatives d'envoi en peu de temps. Le système a été temporairement freiné.";
  }
  return "Une erreur technique inconnue est survenue lors de la communication avec Brevo.";
}
