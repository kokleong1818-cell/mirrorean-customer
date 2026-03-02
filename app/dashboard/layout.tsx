"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [agentName, setAgentName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    const tenantId = localStorage.getItem("tenant_id") || "";
    fetch(`${BACKEND}/agents/${tenantId}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length > 0) {
          setAgentName(list[0].name);
          localStorage.setItem("agent_id", list[0].id);
        }
      });
  }, []);

  const nav = [
    { href: "/dashboard", label: "Overview", icon: "◈" },
    { href: "/dashboard/conversations", label: "Conversations", icon: "💬" },
    { href: "/dashboard/leads", label: "Leads", icon: "👥" },
    { href: "/dashboard/agent", label: "Agent", icon: "🤖" },
    { href: "/dashboard/knowledge", label: "Knowledge Base", icon: "📚" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex">
      <div className="w-56 shrink-0 border-r border-white/[0.08] flex flex-col">
        <div className="p-5 border-b border-white/[0.08]">
          <div className="text-white font-bold text-lg">Mirrorean</div>
          <div className="text-gray-500 text-xs mt-0.5 truncate">{agentName || "Loading..."}</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                pathname === item.href ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
              }`}>
              <span>{item.icon}</span>{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.08]">
          <button onClick={() => { localStorage.clear(); router.push("/"); }}
            className="w-full text-left px-3 py-2.5 text-sm text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-xl transition-colors">
            Sign Out
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}