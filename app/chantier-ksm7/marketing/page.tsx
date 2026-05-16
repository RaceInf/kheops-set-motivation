'use client';

import { useEffect, useState } from 'react';
import { 
  Mail, MessageCircle, AlertCircle, CheckCircle2, 
  TrendingUp, Clock, RefreshCw, ChevronRight,
  MousePointer2, Zap, BarChart3, ChevronDown, User, Hash, Calendar, Package,
  Send, Eye, MousePointerClick, Ban, ShieldAlert, Link2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedNumber from '@/components/admin/AnimatedNumber';
import { Skeleton, CardSkeleton } from '@/components/admin/AdminSkeletons';

interface MarketingEvent {
  id: string;
  date: string;
  eventType: string;
  source: 'brevo' | 'system';
  status: string;
  payload: {
    orderId?: string;
    email?: string;
    sentAt?: string;
    error?: string;
    reason?: string;
    linkUrl?: string;
    subject?: string;
    messageId?: string;
    reminderType?: string;
    manual?: boolean;
    customerName?: string;
    whatsappNumber?: string;
    productName?: string;
    campaignTag?: string;
    [key: string]: any;
  };
}

interface MarketingStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalErrors: number;
  openRate: number;
  clickRate: number;
  pendingSequence: number;
  totalAbandoned: number;
  totalRecovered: number;
  emailsSent: number;
  whatsappClicks: number;
}

const ITEMS_PER_PAGE = 25;

const EVENT_CONFIG: Record<string, { label: string; icon: any; badgeColor: string; badgeBg: string }> = {
  sent:         { label: 'Email envoyé',            icon: Send,              badgeColor: 'text-zinc-300',    badgeBg: 'bg-zinc-500/10 border-zinc-500/20' },
  delivered:    { label: 'Email délivré',            icon: CheckCircle2,      badgeColor: 'text-blue-400',    badgeBg: 'bg-blue-500/10 border-blue-500/20' },
  opened:       { label: 'Email ouvert',             icon: Eye,               badgeColor: 'text-amber-400',   badgeBg: 'bg-amber-500/10 border-amber-500/20' },
  clicked:      { label: 'Lien cliqué',              icon: MousePointerClick,  badgeColor: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' },
  hard_bounce:  { label: 'Adresse inexistante',      icon: Ban,               badgeColor: 'text-red-400',     badgeBg: 'bg-red-500/10 border-red-500/20' },
  soft_bounce:  { label: 'Boîte pleine',             icon: AlertCircle,       badgeColor: 'text-orange-400',  badgeBg: 'bg-orange-500/10 border-orange-500/20' },
  blocked:      { label: 'Bloqué par le serveur',    icon: Ban,               badgeColor: 'text-red-400',     badgeBg: 'bg-red-500/10 border-red-500/20' },
  spam:         { label: 'Signalé comme spam',       icon: ShieldAlert,       badgeColor: 'text-red-500',     badgeBg: 'bg-red-500/10 border-red-500/20' },
  unsubscribed: { label: 'Désinscription',           icon: Mail,              badgeColor: 'text-zinc-400',    badgeBg: 'bg-zinc-500/10 border-zinc-500/20' },
  error:        { label: 'Erreur d\'envoi',          icon: AlertCircle,       badgeColor: 'text-red-400',     badgeBg: 'bg-red-500/10 border-red-500/20' },
  deferred:     { label: 'Envoi différé',            icon: Clock,             badgeColor: 'text-yellow-400',  badgeBg: 'bg-yellow-500/10 border-yellow-500/20' },
  invalid:      { label: 'Adresse invalide',         icon: Ban,               badgeColor: 'text-red-400',     badgeBg: 'bg-red-500/10 border-red-500/20' },
  reminder_h1:  { label: 'Relance H+1',             icon: Mail,              badgeColor: 'text-gold',        badgeBg: 'bg-gold/10 border-gold/20' },
  reminder_h24: { label: 'Relance H+24',            icon: Mail,              badgeColor: 'text-gold',        badgeBg: 'bg-gold/10 border-gold/20' },
  reminder_h72: { label: 'Relance H+72',            icon: Mail,              badgeColor: 'text-gold',        badgeBg: 'bg-gold/10 border-gold/20' },
  whatsapp_relance: { label: 'Relance WhatsApp',    icon: MessageCircle,     badgeColor: 'text-emerald-400', badgeBg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export default function AdminMarketingPage() {
  const [events, setEvents] = useState<MarketingEvent[]>([]);
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/marketing/stats');
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filtering
  const filteredEvents = events.filter(event => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      event.payload.email?.toLowerCase().includes(q) ||
      event.payload.orderId?.toLowerCase().includes(q) ||
      event.payload.customerName?.toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' ||
      (typeFilter === 'SENT' && event.eventType === 'sent') ||
      (typeFilter === 'DELIVERED' && event.eventType === 'delivered') ||
      (typeFilter === 'OPENED' && event.eventType === 'opened') ||
      (typeFilter === 'CLICKED' && event.eventType === 'clicked') ||
      (typeFilter === 'ERRORS' && ['hard_bounce', 'soft_bounce', 'blocked', 'spam', 'error', 'invalid', 'deferred'].includes(event.eventType)) ||
      (typeFilter === 'REMINDERS' && event.eventType.includes('reminder')) ||
      (typeFilter === 'WHATSAPP' && event.eventType.includes('whatsapp'));

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const currentEvents = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getConfig = (type: string) => EVENT_CONFIG[type] || { label: type, icon: Mail, badgeColor: 'text-white/40', badgeBg: 'bg-white/5 border-white/10' };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Tracking Email
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Suivi temps réel des campagnes marketing
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-gold hover:border-gold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-gold' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Stats Grid — 6 Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {!stats ? (
          Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Envoyés" value={stats.totalSent} icon={Send} color="text-zinc-300" />
            <StatCard label="Délivrés" value={stats.totalDelivered} icon={CheckCircle2} color="text-blue-400" />
            <StatCard label="Ouverts" value={stats.totalOpened} icon={Eye} color="text-amber-400" suffix={stats.openRate > 0 ? ` (${stats.openRate}%)` : ''} />
            <StatCard label="Cliqués" value={stats.totalClicked} icon={MousePointerClick} color="text-emerald-400" suffix={stats.clickRate > 0 ? ` (${stats.clickRate}%)` : ''} />
            <StatCard label="Bounces" value={stats.totalBounced} icon={Ban} color="text-red-400" />
            <StatCard label="En séquence" value={stats.pendingSequence} icon={BarChart3} color="text-blue-300" />
          </>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-3 bg-zinc-900/30 border border-white/5 p-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="RECHERCHER PAR EMAIL OU COMMANDE..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-black border border-white/10 px-10 py-3 text-[11px] font-bold uppercase tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-gold transition-colors"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="bg-black border border-white/10 px-4 py-3 text-[11px] font-bold uppercase text-white focus:outline-none focus:border-gold appearance-none cursor-pointer min-w-[160px]"
        >
          <option value="ALL">TOUS LES ÉVÉNEMENTS</option>
          <option value="SENT">📤 ENVOYÉS</option>
          <option value="DELIVERED">📬 DÉLIVRÉS</option>
          <option value="OPENED">👁️ OUVERTS</option>
          <option value="CLICKED">🖱️ CLIQUÉS</option>
          <option value="ERRORS">❌ ERREURS / BOUNCES</option>
          <option value="REMINDERS">📧 RELANCES</option>
          <option value="WHATSAPP">💬 WHATSAPP</option>
        </select>
      </div>

      {/* Events Feed */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
          <Clock className="w-3 h-3" /> Journal d&apos;activités ({filteredEvents.length})
        </h3>

        <div className="border border-white/10 bg-zinc-950 divide-y divide-white/5 overflow-hidden">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="p-5 h-16 animate-pulse bg-white/5 m-1" />)
          ) : currentEvents.length === 0 ? (
            <div className="p-20 text-center text-white/20 text-[11px] font-bold uppercase tracking-widest">Aucune activité.</div>
          ) : (
            currentEvents.map((event) => {
              const config = getConfig(event.eventType);
              const Icon = config.icon;
              return (
                <div key={event.id} className="flex flex-col border-b border-white/5 last:border-0">
                  <button
                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                    className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 border flex items-center justify-center bg-black ${config.badgeBg}`}>
                        <Icon className={`w-3.5 h-3.5 ${config.badgeColor}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-tight px-2 py-0.5 border ${config.badgeBg} ${config.badgeColor}`}>
                            {config.label}
                          </span>
                          {event.status === 'FAILED' && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 font-bold uppercase border border-red-500/20">Échec</span>}
                        </div>
                        <div className="text-[10px] text-white/30 font-mono mt-0.5">{event.payload.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
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
                        <div className="p-5 pt-0 flex flex-col gap-4 border-l-2 border-gold/20 ml-14 mb-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-2">
                            <DetailItem icon={Mail} label="Email" value={event.payload.email} />
                            <DetailItem icon={Hash} label="Commande" value={event.payload.orderId || 'N/A'} />
                            <DetailItem icon={Calendar} label="Date" value={formatDate(event.date)} />
                            {event.payload.subject && <DetailItem icon={Mail} label="Sujet" value={event.payload.subject} />}
                            {event.payload.linkUrl && <DetailItem icon={Link2} label="Lien cliqué" value={event.payload.linkUrl} />}
                            {event.payload.campaignTag && <DetailItem icon={Package} label="Campagne" value={event.payload.campaignTag} />}
                            {event.payload.customerName && <DetailItem icon={User} label="Client" value={event.payload.customerName} />}
                            {event.payload.productName && <DetailItem icon={Package} label="Produit" value={event.payload.productName} />}
                            {event.payload.whatsappNumber && <DetailItem icon={MessageCircle} label="WhatsApp" value={event.payload.whatsappNumber} />}
                          </div>
                          {(event.payload.reason || event.payload.error) && ['hard_bounce', 'soft_bounce', 'blocked', 'spam', 'error', 'invalid', 'deferred'].includes(event.eventType) && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20">
                              <p className="text-[9px] text-red-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" /> Diagnostic
                              </p>
                              <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                                {translateError(event.payload.reason || event.payload.error || '')}
                              </p>
                              <p className="text-[8px] text-white/20 font-mono mt-2 uppercase tracking-tighter break-all">
                                {event.payload.reason || event.payload.error}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 hover:border-gold hover:text-gold transition-all"
            >
              Précédent
            </button>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {currentPage} / {totalPages}
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

function StatCard({ label, value, icon: Icon, color, suffix = '' }: any) {
  return (
    <div className="border border-white/10 bg-zinc-950 p-5 flex flex-col gap-3 hover:border-white/20 transition-all group">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{label}</span>
        <Icon className={`w-4 h-4 ${color} opacity-40 group-hover:opacity-100 transition-opacity`} />
      </div>
      <div className="font-display text-2xl tracking-tight text-white group-hover:text-gold transition-colors">
        <AnimatedNumber value={value || 0} />{suffix && <span className="text-xs text-white/30 ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function translateError(error: string) {
  const err = error.toLowerCase();
  if (err.includes('sender') || err.includes('validate your sender')) return "L'adresse d'expédition n'est pas validée dans Brevo. Vérifiez les Expéditeurs & IP.";
  if (err.includes('invalid_parameter') || err.includes('valid email')) return "L'adresse email du client est invalide ou mal orthographiée.";
  if (err.includes('hard_bounce') || err.includes('not exist')) return "L'adresse email n'existe pas ou a été supprimée.";
  if (err.includes('soft_bounce') || err.includes('full')) return "La boîte de réception du client est pleine ou temporairement indisponible.";
  if (err.includes('blocked')) return "L'envoi a été bloqué par le serveur du destinataire.";
  if (err.includes('spam')) return "L'email a été signalé comme spam par le destinataire.";
  if (err.includes('quota')) return "Votre quota d'envois Brevo est épuisé.";
  if (err.includes('unauthorized') || err.includes('api_key')) return "Erreur d'authentification avec Brevo. Vérifiez votre clé API.";
  if (err.includes('deferred')) return "L'envoi a été temporairement reporté par le serveur destinataire.";
  return "Erreur technique lors de la communication avec le serveur email.";
}
