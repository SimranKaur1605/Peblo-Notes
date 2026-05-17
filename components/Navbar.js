"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();

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
    <nav className="h-14 border-b border-white/5 bg-[#0f0f0f] flex items-center px-6 gap-6">
      <Link href="/dashboard" className="flex items-center gap-2 mr-4">
        <div className="w-6 h-6 bg-violet-500 rounded-md flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>
        <span className="text-white font-semibold text-sm">Peblo Notes</span>
      </Link>

      <div className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
              pathname === link.href
                ? "bg-white/8 text-white"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            <span className={pathname === link.href ? "text-violet-400" : ""}>
              {link.icon}
            </span>
            {link.label}
          </Link>
        ))}
      </div>

      <div className="ml-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
