"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedTag) params.set("tag", selectedTag);
      const res = await fetch(`/api/notes?${params}`);
      if (!res.ok) {
        setNotes([]);
        return;
      }
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
      const tags = [
        ...new Set(
          (data || []).flatMap((n) => n.tags?.map((t) => t.tag?.name) || []),
        ),
      ];
      setAllTags(tags);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search, selectedTag]);

  const createNote = async () => {
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Note", content: "", tags: [] }),
    });
    if (!res.ok) return;
    const note = await res.json();
    router.push(`/notes/${note.id}`);
  };

  const archiveNote = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    fetchNotes();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">My Notes</h1>
            <p className="text-white/30 text-sm mt-1">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span>+</span> New Note
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9.5 9.5L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/40 transition-all"
            />
          </div>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-white/5 border border-white/8 rounded-lg px-3 py-2.5 text-white/50 text-sm focus:outline-none focus:border-violet-500/40 transition-all"
          >
            <option value="">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white/3 border border-white/5 rounded-xl p-5 animate-pulse"
              >
                <div className="h-4 bg-white/8 rounded w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded w-full mb-2" />
                <div className="h-3 bg-white/5 rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-4xl mb-4">◈</p>
            <p className="text-white/40 text-sm">No notes found</p>
            <button
              onClick={createNote}
              className="mt-4 text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              Create your first note →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="bg-white/3 border border-white/5 rounded-xl p-5 hover:bg-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-medium text-white/80 group-hover:text-white transition-colors text-sm truncate pr-2">
                    {note.title}
                  </h2>
                  <button
                    onClick={(e) => archiveNote(note.id, e)}
                    className="text-white/15 hover:text-white/40 transition-colors shrink-0 text-xs"
                    title="Archive"
                  >
                    ▣
                  </button>
                </div>
                <p className="text-white/25 text-xs leading-relaxed line-clamp-2 mb-3">
                  {note.content || "No content yet"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">
                    {note.tags?.slice(0, 3).map((t) => (
                      <span
                        key={t.tag?.name}
                        className="bg-violet-500/10 text-violet-400/70 text-xs px-2 py-0.5 rounded-full"
                      >
                        #{t.tag?.name}
                      </span>
                    ))}
                  </div>
                  <span className="text-white/20 text-xs shrink-0">
                    {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
