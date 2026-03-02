"use client";
import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function ConversationsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const tenantId = localStorage.getItem("tenant_id") || "";
    const agentId = localStorage.getItem("agent_id") || "";
    fetch(`${BACKEND}/conversations/${tenantId}/${agentId}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setSessions(list);
        if (list.length > 0) setSelected(list[0]);
        setLoading(false);
      });
  }, []);

  const filtered = sessions.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.session_id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
  });

  function formatTime(ts: string | null) {
    if (!ts) return "";
    try { return new Date(ts).toLocaleString("en-SG", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); } catch { return ""; }
  }

  return (
    <div className="flex h-screen bg-[#0d0d1a]">
      <div className="w-72 shrink-0 border-r border-white/[0.08] flex flex-col">
        <div className="p-4 border-b border-white/[0.08]">
          <h1 className="text-white font-semibold mb-3">Conversations</h1>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none" />
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? <div className="text-center py-8 text-gray-500 text-sm">Loading...</div> :
            filtered.map(s => (
              <button key={s.session_id} onClick={() => setSelected(s)}
                className={`w-full text-left p-4 border-b border-white/[0.05] transition-colors ${selected?.session_id === s.session_id ? "bg-blue-600/20 border-l-2 border-l-blue-500" : "hover:bg-white/[0.03]"}`}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-white truncate">{s.has_buying_signal && "🔥 "}{s.name || "Anonymous"}</span>
                  <span className="text-xs text-gray-600">{s.message_count}</span>
                </div>
                {s.email && <div className="text-xs text-gray-500 truncate mb-1">{s.email}</div>}
                <div className="text-xs text-gray-600 truncate">{s.last_message}</div>
                <div className="flex gap-1 mt-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${s.name ? "bg-blue-500/20 text-blue-400" : "bg-white/[0.05] text-gray-600"}`}>N</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${s.email ? "bg-purple-500/20 text-purple-400" : "bg-white/[0.05] text-gray-600"}`}>E</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${s.phone ? "bg-green-500/20 text-green-400" : "bg-white/[0.05] text-gray-600"}`}>P</span>
                </div>
              </button>
            ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="px-6 py-3 border-b border-white/[0.08] flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-white">{selected.has_buying_signal && "🔥 "}{selected.name || "Anonymous"}</p>
                <p className="text-xs text-gray-500 font-mono">{selected.session_id}</p>
              </div>
              {selected.email && <div className="text-xs bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20">✉ {selected.email}</div>}
              {selected.phone && <div className="text-xs bg-green-500/10 text-green-300 px-3 py-1 rounded-full border border-green-500/20">📱 {selected.phone}</div>}
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selected.messages.map((msg: any, i: number) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <span className="text-xs text-gray-600 px-1">{msg.role === "user" ? (selected.name || "User") : "AI Agent"} · {formatTime(msg.created_at)}</span>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white/[0.08] text-gray-200 rounded-bl-sm border border-white/[0.08]"}`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-600">
            <div className="text-center"><div className="text-4xl mb-3">💬</div><p className="text-sm">Select a conversation</p></div>
          </div>
        )}
      </div>
    </div>
  );
}