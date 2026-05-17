"use client";
import { useEffect, useState, useCallback, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

function MermaidDiagram({ chart, title }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!chart) return;
    let cancelled = false;
    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });
        const id = "mermaid-" + Math.random().toString(36).substr(2, 9);
        const { svg: rendered } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(rendered);
      } catch {
        if (!cancelled) setError(true);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error || !svg) return null;

  return (
    <div className="mt-4 border border-white/8 rounded-xl overflow-hidden">
      {title && (
        <div className="bg-white/3 border-b border-white/5 px-4 py-2">
          <p className="text-white/40 text-xs font-medium">◈ {title}</p>
        </div>
      )}
      <div
        className="p-4 flex justify-center overflow-x-auto bg-[#111]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

export default function NoteEditor({ params }) {
  const { id } = use(params);
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const router = useRouter();
  const skipAutoSave = useRef(false);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setNote(data);
        setTitle(data.title || "");
        setContent(data.content || "");
        setTags(data.tags?.map((t) => t.tag.name) || []);
        if (data.isPublic && data.shareId)
          setShareUrl(`${window.location.origin}/shared/${data.shareId}`);
        if (data.summary)
          setAiResult({
            analysis: data.summary,
            actionItems: data.actionItems || [],
            mermaid_diagram: "",
            diagram_title: "",
          });
      });
  }, [id]);

  const autoSave = useCallback(
    async (t, c, tgs) => {
      setSaving(true);
      await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, content: c, tags: tgs }),
      });
      setSaving(false);
      setSaved(true);
    },
    [id],
  );

  useEffect(() => {
    if (!note) return;
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }
    setSaved(false);
    const timer = setTimeout(() => autoSave(title, content, tags), 2000);
    return () => clearTimeout(timer);
  }, [title, content, tags]);

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const generateSummary = async () => {
    if (!content || content.trim().length < 1) {
      alert("Add some content first!");
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`/api/notes/${id}/generate-summary`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      setAiResult(data);
      if (data.suggested_title && title === "Untitled Note") {
        skipAutoSave.current = true;
        setTitle(data.suggested_title);
      }
    } catch {
      alert("Something went wrong. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const generateShare = async () => {
    const res = await fetch(`/api/notes/${id}/share`, { method: "POST" });
    const data = await res.json();
    setShareUrl(data.shareUrl);
  };

  const removeShare = async () => {
    await fetch(`/api/notes/${id}/share`, { method: "DELETE" });
    setShareUrl("");
  };

  const deleteNote = async () => {
    if (!confirm("Delete this note permanently?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.push("/notes");
  };

  if (!note)
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-white/20 text-sm">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push("/notes")}
            className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            ← Back
          </button>
          <div className="flex items-center gap-4">
            <span className="text-white/20 text-xs">
              {saving ? "Saving..." : saved ? "Saved" : ""}
            </span>
            <button
              onClick={deleteNote}
              className="text-white/20 hover:text-red-400 text-xs transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-semibold bg-transparent border-none outline-none text-white placeholder-white/15 mb-5"
          placeholder="Untitled"
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 bg-violet-500/10 text-violet-400/80 text-xs px-2.5 py-1 rounded-full"
            >
              #{tag}
              <button
                onClick={() => setTags(tags.filter((t) => t !== tag))}
                className="hover:text-red-400 ml-0.5 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="Add tag..."
            className="bg-transparent text-white/40 text-xs placeholder-white/15 outline-none border border-white/8 rounded-full px-3 py-1 focus:border-violet-500/30 transition-all w-28"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-5" />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full min-h-64 bg-transparent text-white/70 text-sm leading-relaxed outline-none resize-none placeholder-white/15"
          placeholder="Start writing..."
        />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-white/5">
          <button
            onClick={generateSummary}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span>✦</span>
            {aiLoading ? "Analyzing..." : "Generate AI Summary"}
          </button>

          {!shareUrl ? (
            <button
              onClick={generateShare}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/8 text-white/60 hover:text-white text-xs font-medium px-4 py-2 rounded-lg transition-all"
            >
              <span>◉</span> Share Note
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/8 border border-emerald-500/15 px-3 py-2 rounded-lg">
              <span className="text-emerald-400 text-xs truncate max-w-48">
                {shareUrl}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  alert("Copied!");
                }}
                className="text-emerald-400/60 hover:text-emerald-400 text-xs transition-colors"
              >
                Copy
              </button>
              <button
                onClick={removeShare}
                className="text-white/20 hover:text-red-400 text-xs transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {aiLoading && (
          <div className="mt-5 bg-white/3 border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="animate-spin text-violet-400">✦</div>
              <p className="text-white/40 text-sm">
                AI is analyzing your note...
              </p>
            </div>
          </div>
        )}

        {/* AI Result */}
        {aiResult && !aiLoading && (
          <div className="mt-5 bg-white/3 border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
              <span className="text-violet-400 text-sm">✦</span>
              <span className="text-white/60 text-sm font-medium">
                AI Analysis
              </span>
            </div>
            <div className="p-5">
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">
                {aiResult.analysis}
              </p>

              {aiResult.mermaid_diagram && (
                <MermaidDiagram
                  chart={aiResult.mermaid_diagram}
                  title={aiResult.diagram_title}
                />
              )}

              {aiResult.actionItems?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <p className="text-white/25 text-xs uppercase tracking-widest mb-3">
                    Action Items
                  </p>
                  <ul className="space-y-2">
                    {aiResult.actionItems.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-white/40"
                      >
                        <span className="text-violet-400/60 mt-0.5 text-xs">
                          ✓
                        </span>{" "}
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
