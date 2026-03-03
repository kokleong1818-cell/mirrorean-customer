"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

function Card({ title, value, sub, color }: any) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
      <div className="text-gray-400 text-xs mb-2">{title}</div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      {sub && <div className="text-gray-600 text-xs">{sub}</div>}
    </div>
  );
}

const TT = {
  backgroundColor: "#1a1a2e",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#e5e7eb",
  fontSize: "12px",
};

export default function OverviewPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenant_id") || "";
    const agentId = localStorage.getItem("agent_id") || "";
    if (!tenantId || !agentId) { setLoading(false); return; }
    fetch(`${BACKEND}/conversations/${tenantId}/${agentId}`)
      .then(r => r.json())
      .then(data => { setSessions(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const total = sessions.length;
  const named = sessions.filter(s => s.name).length;
  const withEmail = sessions.filter(s => s.email).length;
  const withPhone = sessions.filter(s => s.phone).length;
  const buying = sessions.filter(s => s.has_buying_signal).length;
  const totalMessages = sessions.reduce((acc, s) => acc + (s.message_count || 0), 0);

  const makeDayMap = () => {
    const map: Record<string, any> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-SG", { day: "2-digit", month: "short" });
      map[key] = { date: key, conversations: 0, messages: 0, signals: 0 };
    }
    sessions.forEach(s => {
      if (!s.created_at) return;
      const key = new Date(s.created_at).toLocaleDateString("en-SG", { day: "2-digit", month: "short" });
      if (map[key]) {
        map[key].conversations++;
        map[key].messages += s.message_count || 0;
        if (s.has_buying_signal) map[key].signals++;
      }
    });
    return Object.values(map);
  };

  const chartData = makeDayMap();

  const captureData = [
    { name: "Phone ✅", value: withPhone, color: "#10b981" },
    { name: "Email only", value: Math.max(0, withEmail - withPhone), color: "#a78bfa" },
    { name: "Name only", value: Math.max(0, named - withEmail), color: "#60a5fa" },
    { name: "Anonymous", value: Math.max(0, total - named), color: "#374151" },
  ].filter(d => d.value > 0);

  if (loading) return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Overview</h1><p className="text-gray-400 text-sm mt-1">Loading analytics...</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 animate-pulse h-24" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Your AI agent performance at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Total Conversations" value={total} color="text-blue-400" sub="All time" />
        <Card title="Total Messages" value={totalMessages} color="text-indigo-400" sub="All sessions" />
        <Card title="Names Captured" value={named} color="text-purple-400" sub={total ? `${Math.round(named/total*100)}% rate` : "—"} />
        <Card title="Emails Captured" value={withEmail} color="text-pink-400" sub={total ? `${Math.round(withEmail/total*100)}% rate` : "—"} />
        <Card title="Phones Captured" value={withPhone} color="text-green-400" sub={total ? `${Math.round(withPhone/total*100)}% rate` : "—"} />
        <Card title="Buying Signals 🔥" value={buying} color="text-orange-400" sub={total ? `${Math.round(buying/total*100)}% conversion` : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Conversations — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={25} allowDecimals={false} />
              <Tooltip contentStyle={TT} />
              <Line type="monotone" dataKey="conversations" stroke="#60a5fa" strokeWidth={2} dot={false} name="Conversations" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Message Volume — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={25} allowDecimals={false} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="messages" fill="#818cf8" radius={[4,4,0,0]} name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Buying Signals — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickLine={false} axisLine={false} width={25} allowDecimals={false} />
              <Tooltip contentStyle={TT} />
              <Bar dataKey="signals" fill="#f97316" radius={[4,4,0,0]} name="Buying Signals" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-4">Lead Capture Breakdown</h3>
          {total === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={captureData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {captureData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TT} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{color:"#9ca3af",fontSize:"11px"}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}