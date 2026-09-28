import { trpc } from "@/lib/trpc";
import { ArrowLeft, ArrowRight, Eye, EyeOff, HeartPulse, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";

type AuthMode = "login" | "signup" | "migrate";

function safeNextPath(): string {
  if (typeof window === "undefined") return "/";
  const requested = new URLSearchParams(window.location.search).get("next");
  if (!requested || !requested.startsWith("/") || requested.startsWith("//")) return "/";
  if (["/login", "/signup", "/migrate-password"].some((path) => requested.startsWith(path))) return "/";
  return requested;
}

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const legacyQuery = trpc.auth.legacyMe.useQuery(undefined, {
    enabled: mode !== "signup",
    retry: false,
    refetchOnWindowFocus: false,
  });
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const conversionMutation = trpc.auth.convertLegacy.useMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [recoveryInfoOpen, setRecoveryInfoOpen] = useState(false);

  useEffect(() => {
    if (meQuery.data) setLocation(safeNextPath());
  }, [meQuery.data, setLocation]);

  useEffect(() => {
    if (mode === "migrate" && legacyQuery.data?.email) setEmail(legacyQuery.data.email);
  }, [mode, legacyQuery.data?.email]);

  const busy = loginMutation.isPending || registerMutation.isPending || conversionMutation.isPending;
  const mutationError = loginMutation.error ?? registerMutation.error ?? conversionMutation.error;
  const errorText = message || mutationError?.message || "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if ((mode === "signup" || mode === "migrate") && password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }
    if ((mode === "signup" || mode === "migrate") && password.length < 12) {
      setMessage("Choose a password with at least 12 characters.");
      return;
    }

    try {
      const user = mode === "login"
        ? await loginMutation.mutateAsync({ email, password, rememberMe })
        : mode === "signup"
          ? await registerMutation.mutateAsync({ name: name.trim() || undefined, email, password, rememberMe })
          : await conversionMutation.mutateAsync({ password, rememberMe });
      try { sessionStorage.removeItem("manus-cookie"); } catch { /* Storage may be unavailable. */ }
      utils.auth.me.setData(undefined, user);
      utils.auth.legacyMe.setData(undefined, null);
      await utils.auth.me.invalidate();
      setLocation(safeNextPath());
    } catch {
      // The mutation carries a generic server message; never display credentials or raw server errors.
      setMessage("");
    }
  }

  const title = mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Keep your saved progress";
  const subtitle = mode === "login"
    ? "Sign in to continue your DiagnoGuide journey."
    : mode === "signup"
      ? "Create an account to save your room checklists and accessibility preferences."
      : "Set a password for the existing signed-in account. Your saved preferences and progress stay with it.";
  const submitLabel = mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Set password and continue";

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" aria-hidden="true" />
      <div className="auth-orb auth-orb-two" aria-hidden="true" />
      <Link href="/" className="auth-back"><ArrowLeft size={15} /> Back to DiagnoGuide</Link>

      <div className="auth-layout">
        <section className="auth-story" aria-label="About DiagnoGuide">
          <Link href="/" className="auth-brand"><span className="auth-brand-mark"><HeartPulse size={20} /></span><span>Diagno<span>Guide</span></span></Link>
          <p className="auth-kicker"><span /> A CLEARER WAY THROUGH DIAGNOSTICS</p>
          <h1>Care begins<br />with <em>clarity.</em></h1>
          <p className="auth-story-copy">A calm, patient-first guide to diagnostic rooms, the equipment inside them, and the questions you may want to ask.</p>
          <div className="auth-assurance"><ShieldCheck size={18} /><span>Your checklist and accessibility choices are saved to your account—not used as a medical record.</span></div>
        </section>

        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-card-top"><div className="auth-card-icon"><LockKeyhole size={18} /></div><span>PRIVATE ACCOUNT ACCESS</span></div>
          <h2 id="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>

          {mode === "login" && legacyQuery.data && (
            <aside className="auth-legacy-notice" role="status">
              <KeyRound size={17} />
              <span>We found an existing signed-in account for <strong>{legacyQuery.data.email}</strong>. Set a password first to keep its saved progress.</span>
              <Link href="/migrate-password" className="auth-inline-link">Set password <ArrowRight size={13} /></Link>
            </aside>
          )}

          {mode === "migrate" && !legacyQuery.isLoading && !legacyQuery.data && (
            <aside className="auth-legacy-notice auth-legacy-warning" role="status">
              <KeyRound size={17} />
              <span>A valid existing sign-in in this browser is required to convert an account safely. If you are new, create an account instead.</span>
              <Link href="/signup" className="auth-inline-link">Create account <ArrowRight size={13} /></Link>
            </aside>
          )}

          <form className="auth-form" onSubmit={onSubmit}>
            {mode === "signup" && (
              <label className="auth-field">
                <span>Name <small>optional</small></span>
                <div className="auth-input-wrap"><UserRound size={16} /><input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} placeholder="How should we address you?" /></div>
              </label>
            )}
            {mode !== "migrate" && (
              <label className="auth-field">
                <span>Email address</span>
                <div className="auth-input-wrap"><Mail size={16} /><input type="email" inputMode="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={320} required placeholder="you@example.com" /></div>
              </label>
            )}
            {mode === "migrate" && legacyQuery.data?.email && (
              <div className="auth-identity"><Mail size={16} /><span>Account email</span><strong>{legacyQuery.data.email}</strong></div>
            )}
            <label className="auth-field">
              <span>{mode === "login" ? "Password" : "Create password"}</span>
              <div className="auth-input-wrap"><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === "login" ? 1 : 12} maxLength={128} required placeholder={mode === "login" ? "Enter your password" : "At least 12 characters"} /><button type="button" className="auth-reveal" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            </label>
            {(mode === "signup" || mode === "migrate") && (
              <label className="auth-field">
                <span>Confirm password</span>
                <div className="auth-input-wrap"><LockKeyhole size={16} /><input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={12} maxLength={128} required placeholder="Enter it again" /></div>
                <small className="auth-field-hint">Use 12 or more characters. Your password is stored as a salted hash, never readable text.</small>
              </label>
            )}

            <div className="auth-options">
              <label className="auth-remember"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Keep me signed in</span></label>
              {mode === "login" && <button type="button" className="auth-link-button" onClick={() => setRecoveryInfoOpen((open) => !open)}>Forgot password?</button>}
            </div>
            {recoveryInfoOpen && <p className="auth-recovery-note" role="status">Password-reset email is not configured yet. Please contact the DiagnoGuide site administrator; don’t share your password.</p>}
            {errorText && <p className="auth-error" role="alert">{errorText}</p>}
            <button type="submit" className="auth-submit" disabled={busy || (mode === "migrate" && !legacyQuery.data)}>{busy ? "Please wait…" : submitLabel}<ArrowRight size={16} /></button>
          </form>

          {mode === "login" ? (
            <p className="auth-switch">New to DiagnoGuide? <Link href="/signup">Create an account</Link></p>
          ) : mode === "signup" ? (
            <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
          ) : (
            <p className="auth-switch">Not the account you expected? <Link href="/login">Return to sign in</Link></p>
          )}
          <div className="auth-card-foot"><ShieldCheck size={14} /><span>Passwords are protected with salted, one-way scrypt hashing.</span></div>
        </section>
      </div>
      <p className="auth-footer">DIAGNOGUIDE · PATIENT EDUCATION, WITH CARE</p>
    </main>
  );
}
