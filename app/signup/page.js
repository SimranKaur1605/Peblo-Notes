"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const emailRe =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

const PASSWORD_RULES = [
  { key: "minLength", label: "At least 12 characters", regex: /.{12,}/ },
  { key: "hasUpper", label: "One uppercase letter (A-Z)", regex: /[A-Z]/ },
  { key: "hasLower", label: "One lowercase letter (a-z)", regex: /[a-z]/ },
  { key: "hasDigit", label: "One number (0-9)", regex: /[0-9]/ },
  {
    key: "hasSpecial",
    label: "One special character (!@#...)",
    regex: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>/?`~]/,
  },
  { key: "noSpaces", label: "No spaces allowed", regex: /^\S+$/ },
  {
    key: "noRepeating",
    label: "No character repeated 3+ times in a row",
    regex: /^(?!.*(.)\1{2,}).*$/,
  },
];

function validateEmail(value) {
  if (!value.trim()) return "Email is required.";
  if (value.includes("..")) return "Email cannot contain consecutive dots.";
  if (value.includes(" ")) return "Email cannot contain spaces.";
  if (!emailRe.test(value.trim()))
    return "Enter a valid email (e.g. you@example.com).";
  return null;
}

function getRuleResults(value) {
  return PASSWORD_RULES.reduce((acc, rule) => {
    acc[rule.key] = rule.regex.test(value);
    return acc;
  }, {});
}

function validatePassword(value) {
  if (!value) return "Password is required.";
  const failed = PASSWORD_RULES.filter((rule) => !rule.regex.test(value));
  return failed.length ? "Password does not meet all requirements." : null;
}

function getStrength(value) {
  if (!value) return { score: 0, label: "", color: "" };

  const passed = PASSWORD_RULES.filter((rule) => rule.regex.test(value)).length;
  const pct = passed / PASSWORD_RULES.length;

  if (pct <= 2 / 7) return { score: 1, label: "Very weak", color: "#ef4444" };
  if (pct <= 4 / 7) return { score: 2, label: "Weak", color: "#f97316" };
  if (pct <= 5 / 7) return { score: 3, label: "Fair", color: "#eab308" };
  if (pct <= 6 / 7) return { score: 4, label: "Strong", color: "#22c55e" };

  return { score: 5, label: "Very strong", color: "#a78bfa" };
}

const CheckCircle = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M5 8l2.5 2.5L11 5.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmptyCircle = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const WarnCircle = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0"
  >
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M8 4.5v4M8 11h.01"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const EyeOpen = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOff = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showRules, setShowRules] = useState(false);

  const router = useRouter();

  const ruleResults = getRuleResults(password);
  const strength = getStrength(password);

  const handleEmailChange = useCallback(
    (e) => {
      const val = e.target.value;
      setEmail(val);
      if (touched.email) setEmailError(validateEmail(val) || "");
    },
    [touched.email],
  );

  const handleEmailBlur = useCallback(() => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email) || "");
  }, [email]);

  const handlePasswordChange = useCallback(
    (e) => {
      const val = e.target.value;
      setPassword(val);
      if (touched.password) setPasswordError(validatePassword(val) || "");
    },
    [touched.password],
  );

  const handlePasswordBlur = useCallback(() => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordError(validatePassword(password) || "");
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr || "");
    setPasswordError(pErr || "");
    setTouched({ email: true, password: true });
    setShowRules(true);

    if (eErr || pErr) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email: email.trim(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
    } else {
      router.push("/login");
    }
  };

  const emailBorderClass =
    touched.email && emailError
      ? "border-red-500/60 focus:border-red-500/80"
      : touched.email && !emailError
        ? "border-emerald-500/50 focus:border-emerald-500/70"
        : "border-white/10 focus:border-violet-500/50 focus:bg-white/8";

  const pwBorderClass =
    touched.password && passwordError
      ? "border-red-500/60 focus:border-red-500/80"
      : touched.password && !passwordError
        ? "border-emerald-500/50 focus:border-emerald-500/70"
        : "border-white/10 focus:border-violet-500/50 focus:bg-white/8";

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      <div className="hidden lg:flex w-1/2 bg-[#111111] border-r border-white/5 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H3zM9 9h4v4H9z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
          </div>
          <span className="text-white font-semibold tracking-tight text-lg">
            Peblo Notes
          </span>
        </div>

        <div className="space-y-4">
          {[
            {
              icon: "✦",
              title: "AI-Powered Summaries",
              desc: "Instantly summarize any note with one click.",
            },
            {
              icon: "◈",
              title: "Smart Organization",
              desc: "Tags, filters, and search that actually work.",
            },
            {
              icon: "◉",
              title: "Share Anywhere",
              desc: "Generate public links for any note instantly.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-4 bg-white/3 border border-white/5 rounded-xl p-4"
            >
              <span className="text-violet-400 text-lg mt-0.5">{f.icon}</span>
              <div>
                <p className="text-white/80 text-sm font-medium">{f.title}</p>
                <p className="text-white/30 text-xs mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/20 text-xs">
          © 2026 Peblo Notes. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 3h4v4H3zM9 3h4v4H9zM3 9h4v4H9z"
                  fill="white"
                  fillOpacity="0.9"
                />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">
              Peblo Notes
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-white mb-1">
            Create your account
          </h1>
          <p className="text-white/40 text-sm mb-8">
            Start organizing your thoughts with AI
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="you@example.com"
                className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none transition-all ${emailBorderClass}`}
              />

              {touched.email && (
                <div
                  className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                    emailError ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {emailError ? <WarnCircle /> : <CheckCircle />}
                  <span>{emailError || "Looks good!"}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  onFocus={() => setShowRules(true)}
                  placeholder="Min. 12 characters"
                  className={`w-full bg-white/5 border rounded-lg px-4 py-3 pr-11 text-white placeholder-white/20 text-sm focus:outline-none transition-all ${pwBorderClass}`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((seg) => (
                      <div
                        key={seg}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor:
                            seg <= strength.score
                              ? strength.color
                              : "rgba(255,255,255,0.08)",
                        }}
                      />
                    ))}
                  </div>

                  {strength.label && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </p>
                  )}
                </div>
              )}

              {(showRules || (touched.password && passwordError)) && (
                <div className="mt-3 bg-white/4 border border-white/8 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                    Password requirements
                  </p>

                  {PASSWORD_RULES.map((rule) => {
                    const passed = password ? ruleResults[rule.key] : false;

                    return (
                      <div
                        key={rule.key}
                        className={`flex items-center gap-2 text-xs transition-colors ${
                          passed ? "text-emerald-400" : "text-white/35"
                        }`}
                      >
                        {passed ? <CheckCircle /> : <EmptyCircle />}
                        <span>{rule.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {touched.password && (
                <div
                  className={`flex items-center gap-1.5 mt-1.5 text-xs ${
                    passwordError ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {passwordError ? <WarnCircle /> : <CheckCircle />}
                  <span>
                    {passwordError || "Password meets all requirements"}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-lg text-sm transition-colors mt-2"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
