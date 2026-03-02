"use client";
import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vefcgkgnpx.us-east-1.awsapprunner.com";

export default function KnowledgePage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState("");

  const tenantId = typeof window !== "undefined" ? localStorage.getItem("tenant_id") || "" : "";
  const agentId = typeof window !== "undefined" ? localStorage.getItem("agent_id") || "" : "";

  async function loadDocs() {
    const res = await fetch(`${BACKEND}/knowledge-base/documents/${tenantId}/${agentId}`);
    const data = await res.json();
    setDocs(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { if (tenantId && agentId) loadDocs(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("agent_id", agentId);
      formData.append("tenant_id", tenantId);
      await fetch(`${BACKEND}/knowledge-base/upload`, { method: "POST", body: formData });
    }
    setUploading(false);
    loadDocs();
  }

  async function handleCrawl() {
    if (!crawlUrl) return;
    setCrawling(true); setCrawlStatus("Starting crawl...");
    const formData = new FormData();
    formData.append("url", crawlUrl);
    formData.append("agent_id", agentId);
    formData.append("tenant_id", tenantId);
    formData.append("max_pages", "20");
    const res = await fetch(`${BACKEND}/knowledge-base/crawl`, { method: "POST", body: formData });
    const data = await res.json();
    const jobId = data.job_id;
    const poll = setInterval(async () => {
      const s = await fetch(`${BACKEND}/knowledge-base/crawl/status/${jobId}`).then(r => r.json());
      setCrawlStatus(`${s.status} — ${s.pages_crawled || 0} pages, ${s.chunks_ingested || 0} chunks`);
      if (s.status === "completed" || s.status === "failed") {
        clearInterval(poll); setCrawling(false); loadDocs();
      }
    }, 2000);
  }

  async function handleDelete(docId: string) {
    await fetch(`${BACKEND}/knowledge-base/documents/${docId}`, { method: "DELETE" });
    loadDocs();
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-gray-400 text-sm mt-1">Train your agent with documents and websites</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Upload Files</h3>
          <p className="text-xs text-gray-500 mb-3">Accepts .txt, .pdf, .docx</p>
          <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors">
            {uploading ? "Uploading..." : "📄 Choose Files"}
            <input type="file" multiple accept=".txt,.pdf,.docx" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white mb-1">Crawl Website</h3>
          <input value={crawlUrl} onChange={e => setCrawlUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 mb-2" />
          {crawlStatus && <p className="text-xs text-blue-300 mb-2">{crawlStatus}</p>}
          <button onClick={handleCrawl} disabled={crawling || !crawlUrl}
            className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
            {crawling ? "Crawling..." : "🌐 Start Crawl"}
          </button>
        </div>
      </div>
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.08]">
          <span className="text-sm font-medium text-white">{docs.length} Documents</span>
        </div>
        {loading ? <div className="text-center py-8 text-gray-500 text-sm">Loading...</div> :
          docs.length === 0 ? <div className="text-center py-12 text-gray-600 text-sm">No documents yet</div> :
          docs.map(doc => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.03]">
              <div>
                <p className="text-sm text-white">{doc.filename.replace("web:", "🌐 ").replace("correction:", "✏️ ")}</p>
                <p className="text-xs text-gray-500">{doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
              <button onClick={() => handleDelete(doc.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
            </div>
          ))}
      </div>
    </div>
  );
}