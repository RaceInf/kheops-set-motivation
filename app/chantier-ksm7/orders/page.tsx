'use client';

import { useEffect, useState } from 'react';
import { tools } from '@/lib/data';
import { 
  RefreshCw, Send, CheckCircle2, XCircle, Clock, 
  Loader2, Filter, ChevronLeft, ChevronRight, User, Phone, ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DateRangePicker from '@/components/admin/DateRangePicker';
import { TableSkeleton } from '@/components/admin/AdminSkeletons';
import AnimatedNumber from '@/components/admin/AnimatedNumber';

interface Order {
  id: string;
  date: string;
  amount: number;
  status: string;
  email: string;
  productId: string;
  customerName?: string;
  whatsappNumber?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PAID: { label: 'Payé', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  PENDING: { label: 'Attente', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
  FAILED: { label: 'Échoué', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [resending, setResending] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const [customDates, setCustomDates] = useState<{ from: Date; to: Date } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      if (customDates) {
        params.set('from', customDates.from.toISOString());
        params.set('to', customDates.to.toISOString());
      }
      params.set('page', page.toString());

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter, page, customDates]);

  const handleResend = async (orderId: string) => {
    setResending(orderId);
    setResendMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/resend`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResendMessage({ id: orderId, msg: data.message, ok: true });
      } else {
        setResendMessage({ id: orderId, msg: data.error || 'Erreur', ok: false });
      }
    } catch {
      setResendMessage({ id: orderId, msg: 'Erreur réseau', ok: false });
    } finally {
      setResending(null);
    }
  };

  const formatCFA = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getProductName = (productId: string) => {
    return tools.find(t => t.id === productId)?.title || productId;
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
            Commandes
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gold font-mono font-bold text-xs">
              <AnimatedNumber value={total} />
            </span>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">commande{total > 1 ? 's' : ''} au total</span>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* Calendar Filter */}
          <DateRangePicker 
            onRangeChange={(newRange) => {
              setCustomDates(newRange);
              setPage(1);
            }}
          />

          {/* Status Filter */}
          <div className="flex items-center gap-2 border border-white/10 px-4 bg-zinc-950 h-[42px] focus-within:border-gold/50 transition-colors">
            <Filter className="w-3 h-3 text-white/30" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-white/60 focus:outline-none cursor-pointer h-full"
            >
              <option value="">Tous les statuts</option>
              <option value="PAID">Payé</option>
              <option value="PENDING">Attente</option>
              <option value="FAILED">Échoué</option>
            </select>
          </div>

          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center justify-center h-[42px] w-[42px] border border-white/10 text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50 group"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-gold' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </motion.div>
      </div>

      {/* Table Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl"
      >
        {loading && orders.length === 0 ? (
          <TableSkeleton rows={8} columns={7} />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 bg-white/5 flex items-center justify-center rounded-full">
              <ShoppingBag className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-[11px] font-bold uppercase tracking-widest">Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Date / ID</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Client</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Contact</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Produit</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5 text-right">Montant</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5">Statut</th>
                  <th className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {orders.map((order, idx) => {
                    const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    const StatusIcon = statusConf.icon;
                    return (
                      <motion.tr 
                        key={order.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="p-5 whitespace-nowrap">
                          <div className="text-[11px] text-white/70 font-mono font-bold">{formatDate(order.date)}</div>
                          <div className="text-[8px] text-white/20 font-mono mt-1.5 uppercase tracking-tighter">ID: {order.id.substring(0, 12)}...</div>
                        </td>
                        <td className="p-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[11px] text-white font-black uppercase tracking-tight">{order.customerName || 'Client Anonyme'}</span>
                            <span className="text-[10px] text-white/40 font-medium">{order.email}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          {order.whatsappNumber ? (
                            <a 
                              href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-2 py-1 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all"
                            >
                              <Phone className="w-2.5 h-2.5" /> {order.whatsappNumber}
                            </a>
                          ) : (
                            <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Non renseigné</span>
                          )}
                        </td>
                        <td className="p-5">
                          <span className="text-[10px] text-gold font-black uppercase tracking-widest truncate max-w-[140px] block">
                            {getProductName(order.productId)}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <span className="text-[11px] text-white font-mono font-bold group-hover:text-gold transition-colors">
                            {formatCFA(order.amount)}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${statusConf.color} ${statusConf.bg} rounded-full`}>
                            <StatusIcon className="w-2.5 h-2.5" />
                            {statusConf.label}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          {order.status === 'PAID' ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <button
                                onClick={() => handleResend(order.id)}
                                disabled={resending === order.id}
                                className="flex items-center gap-2 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-gold border border-gold/20 hover:border-gold hover:bg-gold hover:text-black transition-all disabled:opacity-50"
                              >
                                {resending === order.id ? (
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                ) : (
                                  <Send className="w-2.5 h-2.5" />
                                )}
                                Renvoyer
                              </button>
                              {resendMessage?.id === order.id && (
                                <motion.span 
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`text-[8px] font-bold uppercase ${resendMessage.ok ? 'text-emerald-400' : 'text-red-400'}`}
                                >
                                  {resendMessage.msg}
                                </motion.span>
                              )}
                            </div>
                          ) : order.status === 'PENDING' && order.whatsappNumber ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <a
                                href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Bonjour ${order.customerName || 'Bâtisseur'},\n\nC'est l'équipe Kheops Set Motivation. 🏛️\n\nNous avons remarqué que vous avez initié l'acquisition du protocole *${getProductName(order.productId)}* mais que la procédure n'a pas été finalisée.\n\nAvez-vous rencontré un problème technique ou avez-vous une question sur le contenu ?\n\nNous sommes là pour vous aider à bâtir votre empire.\n\nLien pour finaliser : https://kheops-set-motivation.vercel.app/arsenal/${order.productId}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={async (e) => {
                                  // Log manual WhatsApp relance
                                  try {
                                    const res = await fetch('/api/admin/marketing/log', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        orderId: order.id,
                                        email: order.email,
                                        customerName: order.customerName,
                                        whatsappNumber: order.whatsappNumber,
                                        productName: getProductName(order.productId),
                                        eventType: 'whatsapp_relance'
                                      })
                                    });
                                    if (!res.ok) console.error('Log API failed');
                                  } catch (err) {
                                    console.error('Log error:', err);
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                Relance WhatsApp
                              </a>
                            </div>
                          ) : (
                            <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest">Aucune action</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-5 border-t border-white/10 bg-white/[0.01]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3 h-3" /> Précédent
            </button>
            <div className="flex items-center gap-4">
              <span className="h-4 w-px bg-white/10" />
              <span className="text-[10px] text-white/40 font-mono font-bold tracking-widest uppercase">
                Page <span className="text-gold">{page}</span> / {totalPages}
              </span>
              <span className="h-4 w-px bg-white/10" />
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              Suivant <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
