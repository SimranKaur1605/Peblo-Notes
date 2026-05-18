"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="9" y="1" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="1" y="9" width="5" height="5" rx="1" fill="currentColor" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" />
        </svg>
      ),
    },
    {
      href: "/notes",
      label: "Notes",
      icon: (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path
            d="M3 2h9a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1zm1 3h7M4 7.5h7M4 10h4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav className="h-14 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-50 flex items-center px-6 gap-6">
      <Link href="/dashboard" className="flex items-center gap-2 mr-4 group">
        <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:bg-violet-400 transition-colors">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z"
              fill="white"
              fillOpacity="0.95"
            />
          </svg>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          Peblo Notes
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-violet-500/15 text-white border border-violet-500/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span className={active ? "text-violet-400" : ""}>
                {link.icon}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
