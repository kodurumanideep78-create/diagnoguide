import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Accessibility, Check, ChevronDown,
  Clock3, HeartPulse, LogIn, LogOut, Maximize2, Menu, Move3d, Printer, ShieldCheck, Sparkles, X,
} from "lucide-react";
import HospitalScene from "@/components/HospitalScene";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import HospitalDirectory from "@/components/HospitalDirectory";
import { diagnosticRoomContent } from "@/lib/roomContent";
import type { DiagnosticRoomContent } from "@/lib/roomContent";

type DetailTab = "overview" | "technical" | "checklist";

function readPreference(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored === null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

type AccessibilityPanelProps = {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  onReducedMotion: (value: boolean) => void;
  onHighContrast: (value: boolean) => void;
  onLargeText: (value: boolean) => void;
  onClose: () => void;
};

function AccessibilityPanel({ reducedMotion, highContrast, largeText, onReducedMotion, onHighContrast, onLargeText, onClose }: AccessibilityPanelProps) {
  return (
    <section className="accessibility-panel" id="accessibility-panel" role="group" aria-label="Accessibility preferences">
      <div className="a11y-panel-heading">
        <div><span>ACCESSIBILITY</span><strong>Choose your viewing comfort</strong></div>
        <button type="button" onClick={onClose} aria-label="Close accessibility settings"><X size={16} /></button>
      </div>
      <label className="a11y-setting"><span><strong>Reduced motion</strong><small>Use direct camera moves and quieter transitions.</small></span><input type="checkbox" checked={reducedMotion} onChange={(event) => onReducedMotion(event.target.checked)} /></label>
      <label className="a11y-setting"><span><strong>High contrast</strong><small>Strengthen text and interface contrast.</small></span><input type="checkbox" checked={highContrast} onChange={(event) => onHighContrast(event.target.checked)} /></label>
      <label className="a11y-setting"><span><strong>Larger text</strong><small>Increase reading text across the experience.</small></span><input type="checkbox" checked={largeText} onChange={(event) => onLargeText(event.target.checked)} /></label>
    </section>
  );
}

const corridorImage = "/manus-storage/diagno-corridor_c6586e4d.jpg";
const careImage = "/manus-storage/diagno-care_62bc2e93.jpg";

function scrollToRoom(index: number, instant = false, reducedMotion = false) {
  const section = document.getElementById("walkthrough");
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY + index * window.innerHeight;
  window.scrollTo({ top, behavior: instant || reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const roomContentQuery = trpc.roomContent.list.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const rooms = useMemo<DiagnosticRoomContent[]>(() => {
    const records = roomContentQuery.data;
    return records && records.length === diagnosticRoomContent.length
      ? records.map((record) => record.content)
      : diagnosticRoomContent;
  }, [roomContentQuery.data]);
  const progressQuery = trpc.userProgress.mine.useQuery(
    { accountId: user?.id ?? 1 },
    { enabled: Boolean(isAuthenticated && user?.id), retry: false, refetchOnWindowFocus: false },
  );
  const savePreferencesMutation = trpc.userProgress.savePreferences.useMutation();
  const saveChecklistMutation = trpc.userProgress.saveChecklist.useMutation();

  const walkthrough = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeRoom, setActiveRoom] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailRoom, setDetailRoom] = useState(0);
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [activeHotspot, setActiveHotspot] = useState(0);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<number, number[]>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [largeText, setLargeText] = useState(() => readPreference("diagnoguide-large-text", false));
  const [reducedMotion, setReducedMotion] = useState(() => readPreference("diagnoguide-reduced-motion", typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
  const [highContrast, setHighContrast] = useState(() => readPreference("diagnoguide-high-contrast", false));
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [accessibilityOrigin, setAccessibilityOrigin] = useState<"header" | "stage">("header");
  const [fullScreen, setFullScreen] = useState(false);
  const [progressReady, setProgressReady] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const modalRef = useRef<HTMLElement>(null);
  const accountOwnerRef = useRef<number | null>(null);
  const hydratedOwnerRef = useRef<number | null>(null);
  const savedPreferencesRef = useRef<string | null>(null);
  const savedChecklistsRef = useRef<Record<string, string>>({});

  const active = rooms[activeRoom] ?? diagnosticRoomContent[0];
  const activeNumber = String(activeRoom + 1).padStart(2, "0");
  const detailActive = rooms[detailRoom] ?? diagnosticRoomContent[0];
  const detailNumber = String(detailRoom + 1).padStart(2, "0");
  const detailData = detailActive;
  const tourProgress = Math.round(((activeRoom + 1) / rooms.length) * 100);

  const openRoomDetails = (roomIndex = activeRoom, tab: DetailTab = "overview", hotspotIndex = 0) => {
    setDetailRoom(roomIndex);
    setDetailTab(tab);
    setActiveHotspot(hotspotIndex);
    setDetailsOpen(true);
  };

  const toggleChecklistItem = (roomIndex: number, itemIndex: number) => {
    setCheckedChecklist((previous) => {
      const current = previous[roomIndex] ?? [];
      const next = current.includes(itemIndex) ? current.filter((value) => value !== itemIndex) : [...current, itemIndex];
      return { ...previous, [roomIndex]: next };
    });
  };

  const handleAccountAction = async () => {
    if (!isAuthenticated) {
      window.location.assign("/login");
      return;
    }
    try {
      await logout();
      setSyncMessage("Signed out. Your saved progress remains in your account.");
    } catch {
      setSyncMessage("Sign out did not complete. Please try again.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) return;
    try {
      window.localStorage.setItem("diagnoguide-large-text", String(largeText));
      window.localStorage.setItem("diagnoguide-reduced-motion", String(reducedMotion));
      window.localStorage.setItem("diagnoguide-high-contrast", String(highContrast));
    } catch { /* Preferences still work for this visit if storage is unavailable. */ }
  }, [largeText, reducedMotion, highContrast, isAuthenticated]);

  useEffect(() => {
    const nextOwner = isAuthenticated && user?.id ? user.id : null;
    if (nextOwner === accountOwnerRef.current) return;
    const previousOwner = accountOwnerRef.current;
    accountOwnerRef.current = nextOwner;
    hydratedOwnerRef.current = null;
    savedPreferencesRef.current = null;
    savedChecklistsRef.current = {};
    setProgressReady(false);

    if (previousOwner !== null) {
      setCheckedChecklist({});
      if (nextOwner === null) {
        setLargeText(readPreference("diagnoguide-large-text", false));
        setReducedMotion(readPreference("diagnoguide-reduced-motion", typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches));
        setHighContrast(readPreference("diagnoguide-high-contrast", false));
      }
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const saved = progressQuery.data;
    if (!isAuthenticated || !user || !saved || saved.accountId !== user.id || hydratedOwnerRef.current === user.id) return;

    if (saved.preferences) {
      setReducedMotion(saved.preferences.reducedMotion);
      setHighContrast(saved.preferences.highContrast);
      setLargeText(saved.preferences.largeText);
      savedPreferencesRef.current = JSON.stringify({
        reducedMotion: saved.preferences.reducedMotion,
        highContrast: saved.preferences.highContrast,
        largeText: saved.preferences.largeText,
      });
    } else {
      savedPreferencesRef.current = null;
    }

    const nextChecklist: Record<number, number[]> = { ...checkedChecklist };
    rooms.forEach((room, roomIndex) => {
      if (!Object.prototype.hasOwnProperty.call(saved.checklists, room.id)) return;
      nextChecklist[roomIndex] = saved.checklists[room.id]
        .map((item) => room.checklist.indexOf(item))
        .filter((itemIndex) => itemIndex >= 0);
    });
    savedChecklistsRef.current = Object.fromEntries(
      Object.entries(saved.checklists).map(([slug, items]) => [slug, JSON.stringify(items)]),
    );
    setCheckedChecklist(nextChecklist);
    hydratedOwnerRef.current = user.id;
    setProgressReady(true);
  }, [checkedChecklist, isAuthenticated, progressQuery.data, rooms, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !progressReady) return;
    const preferences = { reducedMotion, highContrast, largeText };
    const serialized = JSON.stringify(preferences);
    if (savedPreferencesRef.current === serialized) return;
    savedPreferencesRef.current = serialized;
    setSyncMessage("Saving accessibility preferences…");
    savePreferencesMutation.mutate(preferences, {
      onSuccess: () => setSyncMessage("Your accessibility preferences are saved to your account."),
      onError: () => {
        savedPreferencesRef.current = null;
        setSyncMessage("Could not save preferences. Try changing a setting again when you are online.");
      },
    });
  }, [highContrast, isAuthenticated, largeText, progressReady, reducedMotion, savePreferencesMutation, user]);

  useEffect(() => {
    if (!isAuthenticated || !user || !progressReady) return;
    for (const [roomIndexText, selectedIndexes] of Object.entries(checkedChecklist)) {
      const room = rooms[Number(roomIndexText)];
      if (!room) continue;
      const checkedItems = selectedIndexes.map((itemIndex) => room.checklist[itemIndex]).filter((item): item is string => Boolean(item));
      const serialized = JSON.stringify(checkedItems);
      const previous = savedChecklistsRef.current[room.id];
      if (previous === serialized) continue;
      if (previous === undefined && checkedItems.length === 0) {
        savedChecklistsRef.current[room.id] = serialized;
        continue;
      }
      savedChecklistsRef.current[room.id] = serialized;
      setSyncMessage("Saving checklist progress…");
      saveChecklistMutation.mutate({ roomSlug: room.id, checkedItems }, {
        onSuccess: () => setSyncMessage("Your checklist progress is saved to your account."),
        onError: () => {
          delete savedChecklistsRef.current[room.id];
          setSyncMessage("Could not save checklist progress. Try changing a checked item again when you are online.");
        },
      });
    }
  }, [checkedChecklist, isAuthenticated, progressReady, rooms, saveChecklistMutation, user]);

  useEffect(() => {
    if (!detailsOpen) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => modalRef.current?.querySelector<HTMLElement>(".modal-close")?.focus());
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !modalRef.current) return;
      const items = Array.from(modalRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [detailsOpen]);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const section = walkthrough.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, section.offsetHeight - window.innerHeight);
        const ratio = Math.min(1, Math.max(0, -rect.top / travel));
        const continuous = Math.min(8, ratio * 8);
        setProgress(continuous);
        setActiveRoom(Math.min(8, Math.floor(continuous)));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const routeRoom = window.location.pathname.match(/^\/room\/([1-9])$/)?.[1];
    const requestedRoom = Number(new URLSearchParams(window.location.search).get("room") ?? routeRoom);
    if (!Number.isInteger(requestedRoom) || requestedRoom < 1 || requestedRoom > 9) return;
    const timer = window.setTimeout(() => scrollToRoom(requestedRoom - 1, true, reducedMotion), 420);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDetailsOpen(false);
        setMenuOpen(false);
        setAccessibilityOpen(false);
      }
      const stage = stageRef.current;
      if (!stage || !stage.contains(event.target as Node)) return;
      if (event.target instanceof HTMLElement && event.target.closest("button, input, a")) return;
      if (!detailsOpen && (event.key === "ArrowDown" || event.key === "ArrowRight")) {
        event.preventDefault();
        scrollToRoom(Math.min(8, activeRoom + 1), false, reducedMotion);
      }
      if (!detailsOpen && (event.key === "ArrowUp" || event.key === "ArrowLeft")) {
        event.preventDefault();
        scrollToRoom(Math.max(0, activeRoom - 1), false, reducedMotion);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeRoom, detailsOpen, reducedMotion]);

  const toggleFullScreen = async () => {
    const stage = stageRef.current;
    if (!document.fullscreenElement && stage?.requestFullscreen) {
      await stage.requestFullscreen().catch(() => undefined);
      setFullScreen(Boolean(document.fullscreenElement));
    } else if (document.exitFullscreen) {
      await document.exitFullscreen().catch(() => undefined);
      setFullScreen(false);
    }
  };

  useEffect(() => {
    const sync = () => setFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  return (
    <main className={`site${largeText ? " large-type" : ""}${reducedMotion ? " reduced-motion" : ""}${highContrast ? " high-contrast" : ""}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="DiagnoGuide home">
          <span className="brand-mark"><HeartPulse size={19} strokeWidth={2.1} /></span>
          <span className="brand-word">diagno<span>guide</span></span>
        </a>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          <a href="#walkthrough" onClick={() => setMenuOpen(false)}>The walkthrough</a>
          <a href="#rooms" onClick={() => setMenuOpen(false)}>Room directory</a>
          <a href="#care" onClick={() => setMenuOpen(false)}>Care & access</a>
        </nav>
        <div className="header-actions">
          <button className="accessibility-trigger header-accessibility-trigger" type="button" aria-label="Accessibility settings" aria-controls="accessibility-panel" aria-expanded={accessibilityOpen && accessibilityOrigin === "header"} onClick={() => { setAccessibilityOrigin("header"); setAccessibilityOpen((value) => !(value && accessibilityOrigin === "header")); }}><Accessibility size={17} /></button>
          {accessibilityOpen && accessibilityOrigin === "header" && <AccessibilityPanel reducedMotion={reducedMotion} highContrast={highContrast} largeText={largeText} onReducedMotion={setReducedMotion} onHighContrast={setHighContrast} onLargeText={setLargeText} onClose={() => setAccessibilityOpen(false)} />}
          <button className="header-account-control" type="button" onClick={() => void handleAccountAction()} disabled={authLoading} aria-label={isAuthenticated ? "Sign out" : "Sign in to save progress"}>
            {isAuthenticated ? <LogOut size={15} /> : <LogIn size={15} />}
            <span>{authLoading ? "Checking…" : isAuthenticated ? "Sign out" : "Sign in to save"}</span>
          </button>
          <button className="menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          <a className="header-cta" href="#walkthrough">Explore the wing <ArrowUpRight size={15} /></a>
        </div>
      </header>

      <HospitalDirectory />

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-copy" id="main-content">
          <div className="eyebrow"><span className="eyebrow-dot" /> A GUIDED DIAGNOSTIC EXPERIENCE</div>
          <h1 id="hero-title">A clearer view of <em>what comes next.</em></h1>
          <p>Step into a thoughtfully designed diagnostic wing. Explore the machines, understand the visit, and know which questions you can ask your care team.</p>
          <div className="hero-actions">
            <button className="button button-dark" onClick={() => scrollToRoom(0, false, reducedMotion)}>Begin the walkthrough <ArrowRight size={17} /></button>
            <a className="text-link" href="#rooms">Browse all 9 rooms <ArrowDown size={15} /></a>
          </div>
          <div className="hero-footnote"><ShieldCheck size={16} /> Plain-language education. No diagnosis. Your care team comes first.</div>
        </div>
        <div className="hero-visual" style={{ backgroundImage: `url(${corridorImage})` }} role="img" aria-label="Bright modern diagnostic hospital corridor with glass-fronted rooms">
          <div className="hero-visual-shade" />
          <div className="hero-visual-top"><span><span className="live-dot" /> WOMEN’S DIAGNOSTIC WING</span><span>01 — 09</span></div>
          <div className="hero-visual-caption"><span>THE PATIENT JOURNEY</span><strong>Designed around understanding.</strong></div>
          <div className="hero-visual-index"><span>01</span><span className="index-line" /><span>09</span></div>
          <div className="hero-stamp"><Move3d size={15} /><span>SCROLL TO<br />MOVE THROUGH</span></div>
        </div>
        <div className="hero-bottom"><span>AN INTERACTIVE EDUCATION EXPERIENCE</span><span>SCROLL TO EXPLORE <ArrowDown size={13} /></span></div>
      </section>

      <section className="intro-strip" aria-label="Experience highlights">
        <div className="strip-item"><span>01</span><p><strong>Nine real rooms</strong><br />A guided diagnostic sequence</p></div>
        <div className="strip-item"><span>02</span><p><strong>One room at a time</strong><br />Travel at your own pace</p></div>
        <div className="strip-item"><span>03</span><p><strong>Care before complexity</strong><br />Clear, practical explanations</p></div>
        <div className="strip-note"><Sparkles size={17} /> Made for patients, learners & care teams</div>
      </section>

      <section className="journey-intro" aria-labelledby="journey-title">
        <div className="section-kicker">THE IMMERSIVE WALKTHROUGH <span>— 09 ROOMS</span></div>
        <div className="journey-intro-row">
          <h2 id="journey-title">Through the wing,<br /><em>one room at a time.</em></h2>
          <p>A glass-fronted corridor connects nine women’s diagnostic services. Scroll to move forward; use the room rail to jump to any stop.</p>
        </div>
      </section>

      <section className="journey" id="walkthrough" ref={walkthrough} aria-label="Interactive nine-room diagnostic wing">
        <div className="journey-stage" ref={stageRef} tabIndex={0} aria-label="Interactive diagnostic corridor. Use arrow keys to move between rooms.">
          <HospitalScene progress={progress} fallbackImage={corridorImage} reducedMotion={reducedMotion} />
          <figure className="room-scene-card" key={activeRoom} aria-label={`Illustrative clinical scene for room ${activeRoom + 1}`}>
            <img src={active.image} alt={`Illustrative ${active.name} room with diagnostic equipment, a patient, and clinical staff.`} />
            <figcaption><span>ROOM {activeNumber} · CLINICAL SCENE</span><small>ILLUSTRATIVE</small></figcaption>
            {active.components.map((component, index) => (
              <button key={component.name} className="scene-hotspot" type="button" style={{ left: `${component.position.left}%`, top: `${component.position.top}%` }} data-label={component.name} aria-label={`Room ${activeRoom + 1}: learn about ${component.name}`} onClick={() => openRoomDetails(activeRoom, "technical", index)}><span>{String(index + 1).padStart(2, "0")}</span></button>
            ))}
          </figure>
          <div className="stage-glass" />
          <div className="stage-topline">
            <div className="stage-location"><span className="location-dot" /> WOMEN’S DIAGNOSTIC WING <span className="location-slash">/</span> <strong>ROOM {activeNumber}</strong></div>
            <div className="stage-controls">
              <button className="accessibility-trigger" type="button" aria-label="Accessibility settings" aria-controls="accessibility-panel" aria-expanded={accessibilityOpen && accessibilityOrigin === "stage"} onClick={() => { setAccessibilityOrigin("stage"); setAccessibilityOpen((value) => !(value && accessibilityOrigin === "stage")); }}><Accessibility size={16} /></button>
              <button className="fullscreen-button" type="button" onClick={toggleFullScreen} aria-label={fullScreen ? "Exit full screen" : "Enter full screen"}><Maximize2 size={16} /><span>{fullScreen ? "Exit full screen" : "Full screen"}</span></button>
              {accessibilityOpen && accessibilityOrigin === "stage" && <AccessibilityPanel reducedMotion={reducedMotion} highContrast={highContrast} largeText={largeText} onReducedMotion={setReducedMotion} onHighContrast={setHighContrast} onLargeText={setLargeText} onClose={() => setAccessibilityOpen(false)} />}
            </div>
          </div>
          <div className="stage-left">
            <div className="room-counter"><span>{activeNumber}</span><i />09 <small>ROOM {active.wing}</small></div>
            <div className="room-copy" key={activeRoom}>
              <div className="room-kind">{active.kind}</div>
              <h3>{active.name}<span>{active.machine}</span></h3>
              <p>{active.summary}</p>
              <button className="button button-light" onClick={() => openRoomDetails(activeRoom)}>What to expect <ArrowRight size={16} /></button>
            </div>
            <div className="room-meta"><Clock3 size={15} /><span>Typical visit</span><strong>{active.duration.split(",")[0]}</strong></div>
          </div>
          <div className="stage-right">
            <div className="room-rail-label">YOUR ROUTE <span>{activeNumber} / 09</span></div>
            <div className="room-rail" role="navigation" aria-label="Jump to a diagnostic room">
              {rooms.map((room, index) => (
                <button key={room.name} className={index === activeRoom ? "rail-stop is-active" : index < activeRoom ? "rail-stop is-past" : "rail-stop"} onClick={() => scrollToRoom(index, false, reducedMotion)} aria-label={`Go to room ${index + 1}: ${room.name}`} aria-current={index === activeRoom ? "step" : undefined}>
                  <span className="rail-num">{String(index + 1).padStart(2, "0")}</span><span className="rail-name">{room.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="stage-bottomline">
            <div className="stage-progress"><span style={{ width: `${tourProgress}%` }} /></div>
            <div className="stage-help"><span><span className="keycap">↑</span><span className="keycap">↓</span> SCROLL OR USE KEYS</span><span className="stage-machine"><Activity size={14} /> {active.machineType}</span></div>
          </div>
          <div className="stage-disclaimer">EDUCATIONAL VISUALIZATION · ROOM LAYOUT IS CONCEPTUAL</div>
        </div>
        <div className="journey-steps" aria-hidden="true">
          {rooms.map((room) => <div className="journey-step" key={room.name} />)}
        </div>
      </section>

      <section className="after-tour" aria-label="Tour complete">
        <span className="finish-mark"><Check size={16} /></span>
        <span>NINE ROOMS · ONE MORE INFORMED VISIT</span>
          <button onClick={() => scrollToRoom(0, false, reducedMotion)}>Explore again <ArrowUpRight size={14} /></button>
      </section>

      <section className="directory section-pad" id="rooms" aria-labelledby="directory-title">
        <div className="directory-heading">
          <div><div className="section-kicker">ROOM DIRECTORY <span>— 01 TO 09</span></div><h2 id="directory-title">Find your <em>next stop.</em></h2></div>
          <p>Choose a room to travel there. Every guide is general education; your appointment instructions may differ.</p>
        </div>
        <div className="room-grid">
          {rooms.map((room, index) => (
            <button className="room-card" key={room.name} onClick={() => scrollToRoom(index, false, reducedMotion)}>
              <span className="room-card-top"><span>{String(index + 1).padStart(2, "0")}</span><span className="card-wing">{room.wing} WING <ArrowUpRight size={13} /></span></span>
              <span className="room-card-type">{room.kind}</span>
              <strong>{room.name}</strong>
              <span className="room-card-machine">{room.machine}</span>
              <span className="room-card-bottom"><span>{room.machineType}</span><span className="card-arrow"><ArrowRight size={16} /></span></span>
            </button>
          ))}
        </div>
      </section>

      <section className="care-section" id="care">
        <div className="care-image" style={{ backgroundImage: `url(${careImage})` }} role="img" aria-label="A technologist discusses a mammography room with an adult patient">
          <span className="image-caption">CARE BEGINS WITH A CONVERSATION</span>
        </div>
        <div className="care-copy">
          <div className="section-kicker">THE HUMAN SIDE OF DIAGNOSTICS</div>
          <h2>Good care makes room for <em>your questions.</em></h2>
          <p>Each visit is personal. The machine is only part of the experience—privacy, communication, comfort, and support matter too.</p>
          <div className="care-points">
            <div><span><ShieldCheck size={18} /></span><p><strong>Privacy & consent</strong>Ask what to expect before changing, positioning, or any physical contact. Chaperone options vary by facility.</p></div>
            <div><span><Accessibility size={18} /></span><p><strong>Mobility & access</strong>Share transfer, wheelchair, or positioning needs in advance so the team can discuss what support is available.</p></div>
            <div><span><HeartPulse size={18} /></span><p><strong>Clear communication</strong>You can ask for a pause, a simpler explanation, or clarification at any point in the visit.</p></div>
          </div>
          <a href="#questions" className="text-link">Read the common questions <ArrowRight size={15} /></a>
        </div>
      </section>

      <section className="visit-section section-pad" aria-labelledby="visit-title">
        <div className="visit-heading"><div className="section-kicker">A SIMPLE FRAMEWORK</div><h2 id="visit-title">Know the rhythm of <em>a visit.</em></h2><p>Specific steps depend on your test and care team. This is a general guide—not a promise of a particular workflow.</p></div>
        <div className="visit-steps">
          <article><span className="visit-number">01</span><span className="visit-icon"><Activity size={19} /></span><h3>Before</h3><p>Check the instructions from your facility. Ask about preparation, clothing, privacy, and access needs.</p><span className="visit-line" /></article>
          <article><span className="visit-number">02</span><span className="visit-icon"><Move3d size={19} /></span><h3>During</h3><p>Staff explain the setup, position you, collect images or samples, and can respond to questions.</p><span className="visit-line" /></article>
          <article><span className="visit-number">03</span><span className="visit-icon"><Check size={19} /></span><h3>After</h3><p>Follow the instructions you’re given. A qualified professional reviews and reports diagnostic findings.</p><span className="visit-line" /></article>
        </div>
      </section>

      <section className="faq-section section-pad" id="questions">
        <div className="faq-intro"><div className="section-kicker">GOOD TO KNOW</div><h2>Questions, <em>answered.</em></h2><p>These general notes can help you prepare a conversation with your clinic.</p></div>
        <div className="faq-list">
          <details><summary>Is this a real hospital floor plan or booking system?<ChevronDown size={17} /></summary><p>No. This is a conceptual educational walkthrough. The room sequence and visualization do not represent a live facility, appointment, or operational status.</p></details>
          <details><summary>Can I follow these preparation steps for my appointment?<ChevronDown size={17} /></summary><p>Use the instructions from your own facility and healthcare professional. Preparation can vary by patient, examination, equipment, and protocol.</p></details>
          <details><summary>Can I ask for privacy or mobility support?<ChevronDown size={17} /></summary><p>Yes, you can ask what accommodations or support are available. Options vary by facility, room, equipment, and staffing; preferences are not guarantees.</p></details>
          <details><summary>Does this site interpret test results?<ChevronDown size={17} /></summary><p>No. It provides general education about equipment and the experience of a test. It does not diagnose, interpret reports, or replace advice from a qualified healthcare professional.</p></details>
        </div>
      </section>

      <footer className="site-footer">
        <a href="#top" className="brand footer-brand"><span className="brand-mark"><HeartPulse size={18} /></span><span className="brand-word">diagno<span>guide</span></span></a>
        <div className="footer-note"><span className="footer-dot" /> GENERAL EDUCATIONAL INFORMATION · NOT MEDICAL ADVICE</div>
        <a href="#top" className="back-top">Back to top <ArrowUpRight size={14} /></a>
      </footer>
      <div className="medical-note">This website provides general educational information about diagnostic equipment. It is not a substitute for advice from a qualified healthcare professional. Examination requirements, risks, preparation, duration, and procedures can vary depending on the patient, facility, machine, and examination protocol.</div>

      {detailsOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetailsOpen(false); }}>
          <section className="room-modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-room-description">
            <button className="modal-close" onClick={() => setDetailsOpen(false)} aria-label="Close room information"><X size={18} /></button>
            <div className="modal-kicker">ROOM {detailNumber} · {detailActive.kind}</div>
            <h2 id="modal-title">{detailActive.name}<span>{detailActive.machine}</span></h2>
            <p id="modal-room-description" className="modal-subtitle">Technical guide, visit overview, and a checklist you can print or use as questions for your care team.</p>
            <div className="room-tabs" role="tablist" aria-label="Room information sections" onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]"));
              const currentIndex = tabs.indexOf(event.target as HTMLButtonElement);
              if (currentIndex < 0) return;
              event.preventDefault();
              const nextIndex = (currentIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
              tabs[nextIndex].focus();
              tabs[nextIndex].click();
            }}>
              {(["overview", "technical", "checklist"] as DetailTab[]).map((tab) => (
                <button key={tab} id={`room-tab-${tab}`} type="button" role="tab" aria-selected={detailTab === tab} aria-controls="room-panel" tabIndex={detailTab === tab ? 0 : -1} className={detailTab === tab ? "room-tab is-active" : "room-tab"} onClick={() => setDetailTab(tab)}>
                  {tab === "overview" ? "Visit overview" : tab === "technical" ? "Machine hotspots" : "Prep checklist"}
                </button>
              ))}
            </div>
            <div id="room-panel" className="room-tab-panel" role="tabpanel" aria-labelledby={`room-tab-${detailTab}`} tabIndex={0}>
              {detailTab === "overview" && (
                <div className="overview-panel">
                  <p className="modal-overview">{detailActive.overview}</p>
                  <div className="modal-facts"><div><Clock3 size={16} /><span><small>TYPICAL VISIT</small><strong>{detailActive.duration}</strong></span></div><div><ShieldCheck size={16} /><span><small>SAFETY NOTE</small><strong>{detailActive.safety}</strong></span></div></div>
                  <div className="modal-columns"><div><h3>What may happen</h3><ol>{detailActive.process.map((step) => <li key={step}>{step}</li>)}</ol></div><div><h3>Comfort & privacy</h3><p>{detailActive.comfort}</p></div></div>
                </div>
              )}
              {detailTab === "technical" && (
                <div className="technical-panel">
                  <div className="technical-principle"><span>HOW THE SYSTEM WORKS</span><p>{detailData.principle}</p><div>{detailData.technicalDescription}</div></div>
                  <div className="component-selector">
                    <div className="component-selector-heading"><span>SELECT A HOTSPOT</span><small>{detailData.components.length} machine components</small></div>
                    <div className="component-buttons" role="group" aria-label="Machine components">
                      {detailData.components.map((component, index) => <button key={component.name} type="button" className={activeHotspot === index ? "component-button is-active" : "component-button"} aria-pressed={activeHotspot === index} onClick={() => setActiveHotspot(index)}><span>{String(index + 1).padStart(2, "0")}</span>{component.name}</button>)}
                    </div>
                    <article className="component-detail" aria-live="polite"><span>TECHNICAL HOTSPOT {String(activeHotspot + 1).padStart(2, "0")}</span><h3>{detailData.components[activeHotspot]?.name}</h3><p>{detailData.components[activeHotspot]?.role}</p></article>
                  </div>
                  <div className="source-links"><span>FURTHER READING</span>{detailData.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer noopener">{source.title}<ArrowUpRight size={13} /></a>)}</div>
                </div>
              )}
              {detailTab === "checklist" && (
                <div className="checklist-panel">
                  <div className="checklist-toolbar"><div><span>BEFORE YOUR APPOINTMENT</span><h3>Questions worth confirming</h3><p>Mark items you have checked. Your facility's instructions always take priority.</p></div><button className="print-button" type="button" onClick={() => window.print()}><Printer size={15} /> Print checklist</button></div>
                  <ul className="prep-checklist">{detailData.checklist.map((item, index) => {
                    const isChecked = (checkedChecklist[detailRoom] ?? []).includes(index);
                    return <li key={item} className={isChecked ? "is-checked" : ""}><label><input type="checkbox" checked={isChecked} onChange={() => toggleChecklistItem(detailRoom, index)} /><span className="checkmark" aria-hidden="true"><Check size={13} /></span><span>{item}</span></label></li>;
                  })}</ul>
                  <div className="checklist-count" aria-live="polite">{(checkedChecklist[detailRoom] ?? []).length} of {detailData.checklist.length} marked to ask</div>
                  <div className="progress-sync-note" role="status" aria-live="polite">
                    <p>{authLoading
                      ? "Checking your sign-in status…"
                      : !isAuthenticated
                        ? "Checklist selections are not saved until you sign in. You can save these selections and your accessibility settings to your account."
                        : progressQuery.isError
                          ? "Could not load your saved progress. Retry to reconnect before making account-saved changes."
                          : !progressReady
                            ? "Loading your saved account progress…"
                            : syncMessage || "Your checklist selections and accessibility settings save to your account. No appointments or diagnoses are stored."}</p>
                    {!isAuthenticated && !authLoading && <button type="button" onClick={() => window.location.assign("/login")}><LogIn size={13} /> Sign in to save</button>}
                    {isAuthenticated && progressQuery.isError && <button type="button" onClick={() => void progressQuery.refetch()}>Retry</button>}
                  </div>
                  <aside className="patient-safety-note"><ShieldCheck size={17} /><p>{detailData.caution}</p></aside>
                </div>
              )}
            </div>
            <div className="modal-foot">General education only. Facility instructions and professional guidance take priority.</div>
          </section>
        </div>
      )}
    </main>
  );
}
