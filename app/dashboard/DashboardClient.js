"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DashboardClient({ session }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((data) => {
        setInsights(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = insights?.dailyActivity
    ? Math.max(...insights.dailyActivity.map((d) => d.count), 1)
    : 1;

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Good {getGreeting()}, {firstName}
            </h1>
            <p className="text-white/30 text-sm mt-1">
              Here's your workspace overview
            </p>
          </div>
          <Link
            href="/notes"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <span>+</span> New Note
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            {
              label: "Total Notes",
              value: insights?.totalNotes ?? "—",
              icon: "◈",
              color: "text-violet-400",
            },
            {
              label: "AI Summaries",
              value: insights?.aiUsageCount ?? "—",
              icon: "✦",
              color: "text-emerald-400",
            },
            {
              label: "Archived",
              value: insights?.archivedNotes ?? "—",
              icon: "◻",
              color: "text-amber-400",
            },
            {
              label: "Tags Used",
              value: insights?.topTags?.length ?? "—",
              icon: "◉",
              color: "text-sky-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/3 border border-white/5 rounded-xl p-5 hover:bg-white/5 transition-colors"
            >
              <span className={`text-xl ${s.color}`}>{s.icon}</span>
              <p className="text-2xl font-semibold text-white mt-3">
                {loading ? "—" : s.value}
              </p>
              <p className="text-white/30 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Weekly Activity */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-6">
            <h2 className="text-white/70 text-sm font-medium mb-6">
              Weekly Activity
            </h2>
            {loading ? (
              <div className="h-24 flex items-center justify-center text-white/20 text-sm">
                Loading...
              </div>
            ) : (
              <div className="flex items-end gap-2 h-24">
                {insights?.dailyActivity?.map((day) => (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full flex flex-col justify-end"
                      style={{ height: "72px" }}
                    >
                      <div
                        className="w-full bg-violet-500 rounded-sm transition-all"
                        style={{
                          height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 2)}%`,
                          opacity: day.count > 0 ? 1 : 0.15,
                        }}
                      />
                    </div>
                    <span className="text-white/30 text-xs">{day.day}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Tags */}
          <div className="bg-white/3 border border-white/5 rounded-xl p-6">
            <h2 className="text-white/70 text-sm font-medium mb-4">Top Tags</h2>
            {loading ? (
              <div className="text-white/20 text-sm">Loading...</div>
            ) : !insights?.topTags?.length ? (
              <p className="text-white/20 text-sm">No tags yet</p>
            ) : (
              <div className="space-y-3">
                {insights.topTags.slice(0, 5).map((tag) => (
                  <div key={tag.name} className="flex items-center gap-3">
                    <span className="text-white/40 text-xs w-20 truncate">
                      #{tag.name}
                    </span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                      <div
                        className="bg-violet-500 h-1.5 rounded-full"
                        style={{
                          width: `${(tag.count / insights.topTags[0].count) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-white/30 text-xs w-4 text-right">
                      {tag.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white/3 border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white/70 text-sm font-medium">Recent Notes</h2>
            <Link
              href="/notes"
              className="text-violet-400 hover:text-violet-300 text-xs transition-colors"
            >
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="text-white/20 text-sm">Loading...</div>
          ) : !insights?.recentNotes?.length ? (
            <p className="text-white/20 text-sm">
              No notes yet. Create your first one!
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {insights.recentNotes.map((note) => (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="flex items-center justify-between py-3 hover:text-violet-300 transition-colors group"
                >
                  <span className="text-white/70 text-sm group-hover:text-white transition-colors truncate">
                    {note.title}
                  </span>
                  <span className="text-white/20 text-xs ml-4 shrink-0">
                    {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
