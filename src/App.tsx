import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { profile, projects } from "./data/portfolio";
import { socials } from "./data/socials";
import { skills, additionalStudy } from "./data/skills";
import certificates from "./data/certificates.json";
import { waypoints, clamp, smooth } from "./scene/journey";
import CredentialLibrary, {
  CredentialPreview,
} from "./components/CredentialLibrary";
import type { Credential } from "./components/CredentialLibrary";
const JourneyWorld = lazy(() => import("./components/JourneyWorld"));
const programs = certificates.filter((c) => c.featured);
const sectionNames = [
  "Origin",
  "The human",
  "Skills universe",
  "Selected work",
  "Selected work",
  "Selected work",
  "Credentials",
  "Connect",
];
export default function App() {
  const [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [reading, setReading] = useState(false),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [p, setP] = useState(0),
    [skill, setSkill] = useState(3),
    [credential, setCredential] = useState(0),
    [library, setLibrary] = useState(false),
    [preview, setPreview] = useState<Credential | null>(null),
    [menu, setMenu] = useState(false);
  const progress = useRef(0),
    mode = reading || reduced || failed,
    active = Math.round(p),
    lastMode = useRef(mode),
    lastCredentialBucket = useRef(0);
  const pickCredential = useCallback(
    (n: number) => setCredential((n + programs.length) % programs.length),
    [],
  );
  useEffect(() => {
    const bucket = clamp(Math.floor((p - 6.08) * 16), 0, 6);
    if (p > 6.08 && p < 6.5 && bucket !== lastCredentialBucket.current) {
      lastCredentialBucket.current = bucket;
      setCredential(bucket);
    }
    if (p <= 6.08) lastCredentialBucket.current = 0;
  }, [p]);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setReduced(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  useEffect(() => {
    let frame = 0,
      last = 0,
      lastState = 0;
    const tick = (ms: number) => {
      const target = clamp(scrollY / (innerHeight * 1.1), 0, 7);
      const dt = Math.min((ms - last) / 1000, 0.05);
      last = ms;
      if (!mode) {
        progress.current +=
          (target - progress.current) * (1 - Math.exp(-dt * 9));
        if (Math.abs(target - progress.current) < 0.0001)
          progress.current = target;
        if (ms - lastState > 32) {
          setP(progress.current);
          lastState = ms;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode]);
  useEffect(() => {
    if (lastMode.current !== mode) {
      lastMode.current = mode;
      window.scrollTo({ top: 0, behavior: "instant" });
      progress.current = 0;
      setP(0);
    }
  }, [mode]);
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  useEffect(() => {
    const aliases: Record<string, string> = {
      human: "home",
      code: "about",
      languages: "skills",
      frontend: "skills",
      backend: "skills",
      data: "skills",
      workflow: "skills",
      connect: "contact",
      experience: "about",
      education: "about",
      "rcs-cargo": "work",
      archive: "credentials",
    };
    const id = aliases[location.hash.slice(1)];
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);
  const show = (i: number) =>
    mode
      ? {}
      : {
          opacity:
            active === i ? 1 - smooth((Math.abs(p - i) - 0.08) / 0.42) : 0,
          transform: `translateY(${(i - p) * 24}px)`,
          visibility: active === i ? ("visible" as const) : ("hidden" as const),
        };
  const attrs = (i: number) => ({
    className: `scene-panel panel-${i} ${active === i ? "active" : ""}`,
    style: show(i),
    "aria-hidden": mode ? undefined : active !== i,
    inert: !mode && active !== i,
  });
  const go = (id: string) => {
    setMenu(false);
    document
      .getElementById(mode ? `content-${id}` : id)
      ?.scrollIntoView({ behavior: mode ? "instant" : "smooth" });
  };
  const next = () => go(waypoints[Math.min(7, active + 1)].id);
  return (
    <div
      className={`portfolio ${mode ? "reading-mode" : "cinematic-mode"} ${ready ? "world-ready" : ""}`}
    >
      <a className="skip-link" href={mode ? "#content-about" : "#about"}>
        Skip to portfolio content
      </a>
      <header className="site-header">
        <a
          href="#home"
          className="wordmark"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
          aria-label="Ali Bhatti Full Stack Developer, back to beginning"
        >
          <span className="brand-orbit" aria-hidden="true">
            a<span>b</span>
          </span>
          <span>
            ALI BHATTI<small>FULL STACK DEVELOPER</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          {[
            ["about", "About", 1],
            ["skills", "Skills", 2],
            ["work", "Work", 3],
            ["credentials", "Credentials", 6],
          ].map(([id, label, n]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active == n ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go(String(id));
              }}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a
            className="resume-link"
            href="/assets/resume/Resume-Premium.pdf"
            download
          >
            Résumé <span>↗</span>
          </a>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-expanded={menu}
            aria-controls="mobile-menu"
          >
            {menu ? "Close" : "Menu"} <span>☰</span>
          </button>
        </div>
      </header>
      {menu && (
        <nav id="mobile-menu" aria-label="Mobile navigation">
          {waypoints.map((w) => (
            <a
              key={w.id}
              href={`#${w.id}`}
              onClick={(e) => {
                e.preventDefault();
                go(w.id);
              }}
            >
              {w.name} <span>↗</span>
            </a>
          ))}
        </nav>
      )}
      <div className="atmosphere" aria-hidden="true" />
      {!mode && (
        <>
          <div
            className="hero-title"
            style={{ opacity: 1 - smooth(p / 0.65) }}
            aria-hidden="true"
          >
            ALI <span>BHATTI</span>
          </div>
          <Suspense fallback={null}>
            <JourneyWorld
              progress={progress}
              skill={skill}
              credential={credential}
              paused={mode || library || !!preview}
              onSkill={setSkill}
              onCredential={pickCredential}
              onInspect={() => setPreview(programs[credential])}
              onReady={() => setReady(true)}
              onFail={() => setFailed(true)}
            />
          </Suspense>
        </>
      )}
      {!mode && !ready && (
        <img
          fetchPriority="high"
          className="loading-portrait"
          src="/assets/optimized/portrait.webp"
          alt=""
        />
      )}
      <main id="main" className="story-content">
        <section id="content-home" {...attrs(0)}>
          <h1 className="sr-only">Ali Bhatti — Full Stack Web Developer</h1>
          {mode && (
            <>
              <h2 className="reading-name">
                ALI <em>BHATTI</em>
              </h2>
              <img
                className="reading-portrait"
                src="/assets/optimized/portrait.webp"
                alt="Muhammad Ali Ejaz, known as Ali Bhatti"
              />
            </>
          )}
          <div className="hero-kicker">
            <span className="eyebrow">
              <i className="signal" /> THE PERSON BEHIND THE PIXELS
            </span>
            <span className="mono">KHANEWAL, PAKISTAN / 2026</span>
          </div>
          <div className="hero-left">
            <span className="coordinate">01 — THE ORIGIN</span>
            <h2>
              Human first.
              <br /> <em>Developer by craft.</em>
            </h2>
            <p>
              I’m Muhammad Ali Ejaz.
              <br />
              You can call me Ali Bhatti.
            </p>
          </div>
          <div className="hero-right">
            <span className="orbital-mark" aria-hidden="true">
              ✧
            </span>
            <h2>
              Full stack.
              <br />
              From the inside out.
            </h2>
            <p>
              Thoughtful interfaces.
              <br />
              Connected systems.
              <br />A curiosity that keeps moving.
            </p>
            <button
              className="round-link"
              onClick={() => go("about")}
              aria-label="Begin the journey"
            >
              ↘
            </button>
          </div>
          <div className="hero-bottom">
            <span className="mono">INTERFACE ↔ LOGIC ↔ DATA</span>
            <button onClick={() => go("about")} className="scroll-invitation">
              <span className="scroll-line" /> SCROLL TO ENTER MY WORLD
            </button>
            <a href={`mailto:${profile.email}`}>LET’S BUILD SOMETHING ↗</a>
          </div>
        </section>
        <section id="content-about" {...attrs(1)}>
          <div className="scene-copy about-copy">
            <span className="eyebrow">02 / THE HUMAN BEHIND THE SYSTEM</span>
            <h2>
              Curiosity is
              <br /> the <em>constant.</em>
            </h2>
            <p className="lead">
              I connect what people see with the systems that make it work.
            </p>
            <p>
              Full Stack Web Developer building React and Next.js interfaces,
              Node.js and NestJS services, and PostgreSQL databases with Prisma.
              From a client’s first idea to responsive interfaces, secure APIs,
              and maintainable code.
            </p>
            <details>
              <summary>
                Experience & education <span>↗</span>
              </summary>
              <div className="about-history">
                <h3>Freelance Full Stack Web Developer</h3>
                <p>
                  Upwork & Fiverr · Lahore
                  <br />
                  Sep 2025 – Jun 2026, on both platforms
                </p>
                <p>
                  REST APIs, JWT authentication, role-based access, third-party
                  services, and client collaboration.
                </p>
                <h3>Bachelor in Computer Science</h3>
                <p>Punjab University · Lahore · 2021–2025</p>
                <h3>Intermediate in Computer Science (ICS)</h3>
                <p>Hawk College · Khanewal · 2018–2020</p>
              </div>
            </details>
            <a
              className="text-link"
              href="/assets/resume/Resume-ATS.pdf"
              download
            >
              Read the full résumé ↓
            </a>
          </div>
          <span className="scene-annotation">
            THE HUMAN REMAINS AT THE CENTER.
          </span>
        </section>
        <section id="content-skills" {...attrs(2)}>
          <div className="scene-copy skills-copy">
            <span className="eyebrow">03 / A CONNECTED CONSTELLATION</span>
            <h2>
              Different tools.
              <br /> <em>One system.</em>
            </h2>
            <p>Select a technology in the orbit or explore the index.</p>
            <div className="skill-inspector" aria-live="polite">
              <span className="eyebrow">
                {skills[skill].category}
                {skills[skill].study
                  ? " / COMPLETED STUDY"
                  : " / RÉSUMÉ EXPERIENCE"}
              </span>
              <h3>{skills[skill].name}</h3>
              <p>{skills[skill].evidence}</p>
            </div>
            <div
              className="skill-index"
              role="group"
              aria-label="Explore technical skills"
            >
              {skills.map((s, i) => (
                <button
                  key={s.name}
                  aria-pressed={skill === i}
                  onClick={() => setSkill(i)}
                  onFocus={() => setSkill(i)}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <details className="study-details">
              <summary>More completed study ↗</summary>
              <p>{additionalStudy.join(" · ")}</p>
              <p>
                Course-backed learning; no proficiency scores or mastery claims.
              </p>
            </details>
          </div>
          <span className="scene-annotation">
            HOVER TO DISCOVER · SELECT TO EXPLORE
          </span>
        </section>
        {projects.map((project, i) => (
          <section
            id={`content-${waypoints[i + 3].id}`}
            {...attrs(i + 3)}
            key={project.id}
          >
            <div className="scene-copy project-copy">
              <span className="eyebrow">04 / SELECTED WORK / 0{i + 1}</span>
              <span className="project-number" aria-hidden="true">
                0{i + 1}
              </span>
              <h2>
                {project.name === "BHABHI THULLA" ? (
                  <>
                    A little logic.
                    <br /> <em>A little play.</em>
                  </>
                ) : project.name === "GOLDADAN" ? (
                  <>
                    Technology,
                    <br /> <em>with purpose.</em>
                  </>
                ) : (
                  <>
                    Everything,
                    <br /> <em>in motion.</em>
                  </>
                )}
              </h2>
              <h3>{project.name}</h3>
              <p className="lead">{project.description}</p>
              {mode && (
                <img
                  className="reading-project"
                  src={project.logo}
                  alt={`${project.name} original project artwork`}
                />
              )}
              <p className="project-detail">
                {i === 0
                  ? "A web application for a connected logistics world, presented with its original brand identity."
                  : i === 1
                    ? "A digital presence shaped around security, software, hardware, and enterprise technology services."
                    : "A card-game project with an authentic visual identity, inspired by a familiar game."}
              </p>
              <span className="artwork-note">ORIGINAL PROJECT ARTWORK</span>
              <div className="project-pagination" aria-label="Choose project">
                {projects.map((pr, j) => (
                  <button
                    key={pr.id}
                    onClick={() => go(waypoints[j + 3].id)}
                    aria-label={`Show ${pr.name}`}
                    aria-pressed={i === j}
                  >
                    0{j + 1}
                  </button>
                ))}
              </div>
              <button
                className="text-link"
                onClick={() => go(waypoints[i + 4].id)}
              >
                {i === 2 ? "Continue to credentials" : "Next project"}{" "}
                <span>↗</span>
              </button>
            </div>
          </section>
        ))}
        <section id="content-credentials" {...attrs(6)}>
          <div className="scene-copy credential-copy">
            <span className="eyebrow">05 / THE CREDENTIAL ORBIT</span>
            <h2>
              Always
              <br /> <em>in pursuit.</em>
            </h2>
            <p>
              Seven completed programs.
              <br />A commitment to keep learning.
            </p>
            <div className="active-credential" aria-live="polite">
              <span className="eyebrow">
                {programs[credential].issuer} / {programs[credential].type}
              </span>
              <h3>{programs[credential].title}</h3>
              <time>{programs[credential].date}</time>
            </div>
            {mode && (
              <img
                className="reading-certificate"
                src={programs[credential].preview}
                alt={programs[credential].title}
              />
            )}
            <div
              className="carousel-controls"
              onTouchStart={(e) => {
                e.currentTarget.dataset.x = String(e.touches[0].clientX);
              }}
              onTouchEnd={(e) => {
                const dx =
                  e.changedTouches[0].clientX -
                  Number(e.currentTarget.dataset.x);
                if (Math.abs(dx) > 40)
                  pickCredential(credential + (dx < 0 ? 1 : -1));
              }}
            >
              <button
                aria-label="Previous credential"
                onClick={() => pickCredential(credential - 1)}
              >
                ←
              </button>
              <span className="mono">
                0{credential + 1} <span>/ 07</span>
              </span>
              <button
                aria-label="Next credential"
                onClick={() => pickCredential(credential + 1)}
              >
                →
              </button>
            </div>
            <div className="credential-actions">
              <button onClick={() => setPreview(programs[credential])}>
                Inspect certificate ↗
              </button>
              <a href={programs[credential].downloadPath} download>
                Download ↓
              </a>
              <a
                href={programs[credential].url}
                target="_blank"
                rel="noreferrer"
              >
                Verify ↗
              </a>
            </div>
            <button className="library-link" onClick={() => setLibrary(true)}>
              Open all 40 credentials <span>↗</span>
            </button>
          </div>
          <span className="scene-annotation">
            DRAG OR SWIPE THE ORBIT · USE ARROWS TO ROTATE
          </span>
        </section>
        <section id="content-contact" {...attrs(7)}>
          <div className="finale-heading">
            <span className="eyebrow">06 / THE NEXT CHAPTER</span>
            <h2>
              Good things start
              <br />
              with <em>a conversation.</em>
            </h2>
          </div>
          <div className="finale-left">
            <span className="eyebrow">MUHAMMAD ALI EJAZ / ALI BHATTI</span>
            <a className="email-link" href={`mailto:${profile.email}`}>
              Let’s build
              <br />
              something <span>↗</span>
            </a>
            <p>{profile.location}</p>
            <a href={profile.phoneHref}>{profile.phone}</a>
          </div>
          <div className="finale-right">
            <div className="social-links">
              {socials.map((s) => (
                <a key={s.id} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                  <span>↗</span>
                </a>
              ))}
            </div>
            <div className="resume-options">
              <a
                className="button"
                href="/assets/resume/Resume-Premium.pdf"
                download
              >
                Visual résumé ↓
              </a>
              <a
                className="text-link"
                href="/assets/resume/Resume-ATS.pdf"
                download
              >
                ATS résumé ↓
              </a>
            </div>
          </div>
          <div className="finale-bottom">
            <span className="mono">CURIOSITY. CODE. CONTINUOUS MOTION.</span>
            <button onClick={() => go("home")}>Return to the origin ↑</button>
            <span className="mono">© 2026 ALI BHATTI</span>
          </div>
        </section>
      </main>
      {!mode && (
        <div className="scroll-track" aria-hidden="true">
          {waypoints.map((w, i) => (
            <div
              className="waypoint"
              id={w.id}
              key={w.id}
              style={i === 7 ? { height: "100vh" } : undefined}
            />
          ))}
        </div>
      )}
      <footer className="journey-controls">
        <button
          className="mode-button"
          onClick={() => {
            setReading(!reading);
            if (reduced) setReduced(false);
          }}
        >
          {mode ? "Enter 3D journey" : "Reading view"}{" "}
          <span aria-hidden="true">{mode ? "◈" : "☷"}</span>
        </button>
        {!mode && (
          <>
            <nav className="waypoint-nav" aria-label="Journey waypoints">
              {waypoints.map((w, i) => (
                <button
                  key={w.id}
                  aria-label={w.name}
                  aria-current={active === i ? "step" : undefined}
                  onClick={() => go(w.id)}
                >
                  <span />
                </button>
              ))}
            </nav>
            <span className="journey-label mono">
              0{active < 3 ? active + 1 : active < 6 ? 4 : active - 1} /{" "}
              {sectionNames[active]}
            </span>
            <button
              className="next-scene"
              onClick={active === 7 ? () => go("home") : next}
              aria-label={active === 7 ? "Return to beginning" : "Next scene"}
            >
              {active === 7 ? "↑" : "↓"}
            </button>
          </>
        )}
      </footer>
      <CredentialLibrary open={library} onClose={() => setLibrary(false)} />
      <CredentialPreview
        credential={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
