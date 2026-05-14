'use client';

import { useEffect, useState } from 'react';
import { tools } from '@/lib/data';
import { 
  RefreshCw, Send, CheckCircle2, XCircle, Clock, 
  Loader2, Filter, ChevronLeft, ChevronRight, User, Phone, Download
} from 'lucide-react';

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
  PENDING: { label: 'En attente', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Clock },
  FAILED: { label: 'Échoué', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [resending, setResending] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
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

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      params.set('export', 'true');

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      const exportData: Order[] = data.orders || [];

      // Create CSV
      const headers = ['Date', 'ID', 'Client', 'Email', 'WhatsApp', 'Produit', 'Montant', 'Statut'];
      const csvRows = [
        headers.join(','),
        ...exportData.map(o => [
          new Date(o.date).toLocaleDateString('fr-FR'),
          o.id,
          `"${o.customerName || ''}"`,
          o.email,
          `"${o.whatsappNumber || ''}"`,
          `"${getProductName(o.productId)}"`,
          o.amount,
          o.status
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders_${filter || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
      
      // Append to document to make it work in all browsers
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Commandes
          </h1>
          <p className="text-white/40 text-xs mt-1">{total} commande{total > 1 ? 's' : ''} au total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting || orders.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gold/30 bg-gold/5 text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all disabled:opacity-30"
          >
            {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Exporter (CSV)
          </button>

          {/* Filter */}
          <div className="flex items-center gap-2 border border-white/10 px-3 py-2">
            <Filter className="w-3 h-3 text-white/30" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-white/60 focus:outline-none cursor-pointer"
            >
              <option value="">Tous</option>
              <option value="PAID">Payé</option>
              <option value="PENDING">En attente</option>
              <option value="FAILED">Échoué</option>
            </select>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/10 bg-zinc-950 overflow-hidden">
        {loading && orders.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-12">Aucune commande trouvée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Date</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Identité Client</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Coordonnées</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Produit</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Montant</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Statut</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const StatusIcon = statusConf.icon;
                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-xs text-white/60 whitespace-nowrap">
                        {formatDate(order.date)}
                        <div className="text-[8px] text-white/20 font-mono mt-1 uppercase">ID: {order.id.substring(0, 8)}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-bold">{order.customerName || '—'}</span>
                          <span className="text-[10px] text-white/40">{order.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {order.whatsappNumber ? (
                          <a 
                            href={`https://wa.me/${order.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-[10px] text-emerald-400 hover:underline"
                          >
                            <Phone className="w-3 h-3" /> {order.whatsappNumber}
                          </a>
                        ) : (
                          <span className="text-[10px] text-white/20">—</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-gold font-bold truncate max-w-[150px]">
                        {getProductName(order.productId)}
                      </td>
                      <td className="p-4 text-xs text-white font-bold whitespace-nowrap">
                        {formatCFA(order.amount)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${statusConf.color} ${statusConf.bg}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {order.status === 'PAID' && (
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => handleResend(order.id)}
                              disabled={resending === order.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-gold border border-gold/30 hover:bg-gold hover:text-black transition-all disabled:opacity-50"
                            >
                              {resending === order.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Renvoyer
                            </button>
                            {resendMessage?.id === order.id && (
                              <span className={`text-[9px] ${resendMessage.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                {resendMessage.msg}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-white/10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-3 h-3" /> Précédent
            </button>
            <span className="text-[10px] text-white/30 font-mono">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Suivant <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
