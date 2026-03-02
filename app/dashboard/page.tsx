"use client";
import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function OverviewPage() {
  const [stats, setStats] = useState({ total: 0, named: 0, email: 0, phone: 0, buying: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenant_id") || "";
    const agentId = localStorage.getItem("agent_id") || "";
    if (!tenantId || !agentId) return;
    fetch(`${BACKEND}/conversations/${tenantId}/${agentId}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setStats({
          total: list.length,
          named: list.filter((s: any) => s.name).length,
          email: list.filter((s: any) => s.email).length,
          phone: list.filter((s: any) => s.phone).length,
          buying: list.filter((s: any) => s.has_buying_signal).length,
        });
        setLoading(false);
      });
  }, []);

  const cards = [
    { label: "Total Conversations", value: stats.total, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Names Captured", value: stats.named, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Emails Captured", value: stats.email, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "Phones Captured", value: stats.phone, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Buying Signals 🔥", value: stats.buying, color: "text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Your AI agent performance at a glance</p>
      </div>
      {loading ? <div className="text-gray-500 text-sm">Loading stats...</div> : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.label} className={`${card.bg} border border-white/[0.08] rounded-2xl p-6`}>
              <div className={`text-3xl font-bold ${card.color} mb-1`}>{card.value}</div>
              <div className="text-gray-400 text-sm">{card.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}