import Link from "next/link";

export default async function SharedNotePage({ params }) {
  const { shareId } = await params;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/shared/${shareId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-gray-700">Note nahi mila</h1>
          <p className="text-gray-500 mt-2">
            Ya toh private hai ya delete ho gaya
          </p>
          <Link
            href="/login"
            className="text-purple-600 mt-4 block hover:underline"
          >
            Login karo
          </Link>
        </div>
      </div>
    );
  }

  const note = await res.json();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center gap-2 mb-6 text-sm text-gray-400">
            <span>📝 Peblo Notes</span>
            <span>·</span>
            <span>{note.user?.name} ne share kiya</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {note.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            {note.tags?.map((t) => (
              <span
                key={t.tag.name}
                className="bg-purple-100 text-purple-600 text-sm px-3 py-1 rounded-full"
              >
                #{t.tag.name}
              </span>
            ))}
          </div>

          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-8 p-4 bg-gray-50 rounded-lg">
            {note.content}
          </div>

          {note.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h3 className="font-semibold text-blue-800 mb-2">
                🤖 AI Summary
              </h3>
              <p className="text-gray-700 text-sm mb-3">{note.summary}</p>
              {note.actionItems?.length > 0 && (
                <>
                  <p className="text-xs text-blue-600 font-medium mb-2">
                    Action Items:
                  </p>
                  <ul className="space-y-1">
                    {note.actionItems.map((item, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6">
            Last updated: {new Date(note.updatedAt).toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </div>
  );
}
