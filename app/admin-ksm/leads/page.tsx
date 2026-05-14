'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Download, Users, Mail } from 'lucide-react';

interface Contact {
  email: string;
  createdAt: string;
  modifiedAt: string;
}

export default function AdminLeadsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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

  const handleExport = async () => {
    setExporting(true);
    try {
      // Fetch all leads (up to 1000)
      const res = await fetch(`/api/admin/leads?export=true`);
      const data = await res.json();
      const allLeads: Contact[] = data.contacts || [];

      if (allLeads.length === 0) return;

      const headers = ['Email', 'Date d\'inscription'];
      const csvRows = [
        headers.join(','),
        ...allLeads.map(c => `${c.email},${formatDate(c.createdAt)}`)
      ];
      
      const csvContent = csvRows.join('\n');
      // Added BOM for Excel UTF-8 support
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads_ksm_${new Date().toISOString().split('T')[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
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

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase tracking-tighter">
            Leads Newsletter
          </h1>
          <p className="text-white/40 text-xs mt-1">Contacts inscrits via Brevo</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting || contacts.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gold/30 bg-gold/5 text-[10px] font-bold uppercase tracking-widest text-gold hover:bg-gold hover:text-black transition-all disabled:opacity-30"
          >
            {exporting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Exporter CSV
          </button>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-gold hover:border-gold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="border border-white/10 bg-zinc-950 p-6 flex items-center gap-6">
        <div className="w-12 h-12 bg-gold/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-gold" />
        </div>
        <div>
          <div className="font-display text-3xl tracking-tight">{total}</div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            Contacts enregistrés
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-white/10 bg-zinc-950 overflow-hidden">
        {loading && contacts.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-gold animate-spin" />
          </div>
        ) : contacts.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-12">Aucun contact trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">#</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Email</th>
                  <th className="text-[9px] uppercase tracking-widest text-white/30 font-bold p-4">Date d'inscription</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, idx) => (
                  <tr key={`${contact.email}-${idx}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-[10px] text-white/30 font-mono">
                      {offset + idx + 1}
                    </td>
                    <td className="p-4 text-sm text-white/80 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-white/20" />
                      {contact.email}
                    </td>
                    <td className="p-4 text-xs text-white/50">
                      {formatDate(contact.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-between items-center p-4 border-t border-white/10">
            <button
              onClick={() => setOffset(o => Math.max(0, o - limit))}
              disabled={offset === 0}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30"
            >
              ← Précédent
            </button>
            <span className="text-[10px] text-white/30 font-mono">
              {offset + 1}–{Math.min(offset + limit, total)} sur {total}
            </span>
            <button
              onClick={() => setOffset(o => o + limit)}
              disabled={offset + limit >= total}
              className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
