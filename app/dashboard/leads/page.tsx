"use client";
import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const tenantId = localStorage.getItem("tenant_id") || "";
    fetch(`${BACKEND}/leads/${tenantId}`)
      .then(r => r.json())
      .then(data => { setLeads(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtered = leads.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.name || "").toLowerCase().includes(q) || (l.email || "").toLowerCase().includes(q) || (l.first_message || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">{leads.length} total prospects captured</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..."
          className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none focus:border-blue-500 w-60" />
      </div>
      {loading ? <div className="text-gray-500 text-sm">Loading leads...</div> : (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">First Message</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead: any, i: number) => (
                <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-3 text-sm text-white font-medium">{lead.name || <span className="text-gray-600">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-purple-300">{lead.email || <span className="text-gray-600">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-green-300">{lead.phone || <span className="text-gray-600">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{lead.first_message || "—"}</td>
                  <td className="px-4 py-3">
                    {lead.has_buying_signal
                      ? <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full">🔥 Buying Signal</span>
                      : lead.name
                      ? <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Named</span>
                      : <span className="text-xs bg-white/[0.05] text-gray-500 px-2 py-1 rounded-full">Anonymous</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-600 text-sm">No leads found</div>}
        </div>
      )}
    </div>
  );
}