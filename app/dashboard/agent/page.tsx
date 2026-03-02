"use client";
import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function AgentPage() {
  const [agent, setAgent] = useState<any>(null);
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const tenantId = localStorage.getItem("tenant_id") || "";
    fetch(`${BACKEND}/agents/${tenantId}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setAgent(list[0]);
          setName(list[0].name || "");
          setPersona(list[0].persona || "");
          setPaymentLink(list[0].payment_link || "");
        }
      });
  }, []);

  async function handleSave() {
    if (!agent) return;
    setSaving(true);
    try {
      await fetch(`${BACKEND}/agents/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, persona, payment_link: paymentLink }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Agent Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Customize how your AI agent behaves</p>
      </div>
      {!agent ? <div className="text-gray-500 text-sm">Loading...</div> : (
        <div className="space-y-5">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <label className="text-sm text-gray-400 mb-2 block">Agent Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <label className="text-sm text-gray-400 mb-2 block">Persona / System Prompt</label>
            <textarea value={persona} onChange={e => setPersona(e.target.value)} rows={12}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm font-mono resize-none" />
            <p className="text-gray-600 text-xs mt-1">{persona.length} characters</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <label className="text-sm text-gray-400 mb-2 block">Payment Link</label>
            <input value={paymentLink} onChange={e => setPaymentLink(e.target.value)}
              placeholder="https://buy.stripe.com/..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors">
            {saved ? "✓ Saved!" : saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}