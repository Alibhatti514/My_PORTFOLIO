import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { profile, projects } from "./data/portfolio";
import { skills, additionalStudy } from "./data/skills";
import { socials } from "./data/socials";
import { clamp, panelPose, portraitPose, waypoints } from "./scene/journey";
import {
  CredentialPreview,
  type Credential,
} from "./components/CredentialPreview";
import featuredCertificates from "./data/featuredCertificates.json";
import inventoryStats from "./data/inventoryStats.json";
const CredentialLibrary = lazy(() => import("./components/CredentialLibrary"));
const JourneyWorld = lazy(() => import("./components/JourneyWorld"));
const featured = featuredCertificates.sort(
  (a, b) =>
    Number(a.issuer === "Duke University") -
    Number(b.issuer === "Duke University"),
);
const categories = [
  "All",
  "Languages",
  "Frontend",
  "Backend",
  "Data",
  "Tools",
  "Completed study",
];
function Socials({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`social-links ${compact ? "compact" : ""}`}>
      {socials
        .filter((s) => !compact || ["github", "linkedin"].includes(s.id))
        .map((s) => (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} profile (opens in a new tab)`}
          >
            <img src={s.icon} alt="" />
            <span>{s.label}</span>
            <b aria-hidden="true">↗</b>
          </a>
        ))}
    </div>
  );
}
export default function App() {
  const [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [reading, setReading] = useState(false),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false),
    [worldEnabled, setWorldEnabled] = useState(false),
    [active, setActive] = useState(0),
    [menu, setMenu] = useState(false),
    [skill, setSkill] = useState(0),
    [category, setCategory] = useState("All"),
    [credential, setCredential] = useState(0),
    [library, setLibrary] = useState(false),
    [preview, setPreview] = useState<Credential | null>(null);
  const progress = useRef(0),
    root = useRef<HTMLDivElement>(null),
    portrait = useRef<HTMLDivElement>(null),
    panels = useRef<(HTMLElement | null)[]>([]),
    surfaces = useRef<(HTMLDivElement | null)[]>([]),
    mode = reduced || reading || failed,
    selected = featured[credential];
  const pick = (n: number) =>
    setCredential((n + featured.length) % featured.length);
  // Decode and paint the real portrait before loading the optional WebGL enhancement.
  useEffect(() => {
    let first = 0,
      second = 0,
      cancelled = false;
    const image = portrait.current?.querySelector("img");
    (image?.decode() || Promise.resolve())
      .catch(() => {})
      .then(() => {
        if (cancelled) return;
        first = requestAnimationFrame(() => {
          second = requestAnimationFrame(() => setWorldEnabled(true));
        });
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)"),
      f = () => setReduced(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  useEffect(() => {
    if (mode) return;
    let frame = 0,
      last = performance.now(),
      current = -1,
      rendered = -1,
      width = 0,
      height = 0;
    const tick = (ms: number) => {
      frame = requestAnimationFrame(tick);
      const target = clamp(scrollY / (innerHeight * 1.2), 0, 7),
        dt = Math.min((ms - last) / 1000, 0.05);
      last = ms;
      progress.current +=
        (target - progress.current) * (1 - Math.exp(-dt * 12));
      if (Math.abs(target - progress.current) < 0.00002)
        progress.current = target;
      const p = progress.current;
      if (p === rendered && width === innerWidth && height === innerHeight)
        return;
      rendered = p;
      width = innerWidth;
      height = innerHeight;
      const next = Math.round(p);
      if (next !== current) {
        current = next;
        setActive(next);
      }
      root.current?.style.setProperty("--progress", String(p / 7));
      root.current?.setAttribute("data-progress", p.toFixed(5));
      panels.current.forEach((el, i) => {
        if (!el) return;
        const q = panelPose(p, i);
        el.style.transform = `translate3d(0,${q.y}vh,${q.z}px) rotateX(${q.rotate}deg)`;
        el.style.setProperty("--local", String(p - i));
      });
      surfaces.current.forEach((el, i) => {
        if (el) el.style.transform = `translateY(${(i - p) * 108}vh)`;
      });
      if (portrait.current) {
        const q = portraitPose(p, innerWidth < 760);
        Object.assign(portrait.current.style, {
          transform: `translate3d(${q.x}vw,${q.y}vh,0) scale(${q.scale})`,
          opacity: String(q.opacity),
          filter: `blur(${q.blur}px)`,
          maskImage: `linear-gradient(to bottom,#000 0%,#000 ${Math.max(0, q.mask - 35)}%,transparent ${Math.max(1, q.mask + 2)}%)`,
        });
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  const go = (id: string) => {
    setMenu(false);
    const i = waypoints.findIndex((w) => w.id === id);
    if (mode)
      document
        .getElementById(`content-${id}`)
        ?.scrollIntoView({ behavior: "instant" });
    else {
      history.replaceState(null, "", `#${id}`);
      window.scrollTo({
        top: Math.max(0, i) * innerHeight * 1.2,
        behavior: reduced ? "instant" : "smooth",
      });
    }
  };
  useEffect(() => {
    const id = location.hash.slice(1);
    if (waypoints.some((w) => w.id === id)) {
      const i = waypoints.findIndex((w) => w.id === id);
      if (!mode)
        window.scrollTo({ top: i * innerHeight * 1.2, behavior: "instant" });
    }
  }, [mode]);
  const attrs = (i: number) => ({
    ref: (el: HTMLElement | null) => {
      panels.current[i] = el;
    },
    className: `scene-panel panel-${i} ${i === 4 || i === 6 ? "wine-scene" : ""}`,
    style: mode
      ? undefined
      : ({
          transform: `translate3d(0,${panelPose(progress.current, i).y}vh,${panelPose(progress.current, i).z}px) rotateX(${panelPose(progress.current, i).rotate}deg)`,
          "--local": progress.current - i,
        } as React.CSSProperties),
    inert: !mode && Math.abs(active - i) > 0,
    "aria-hidden": !mode && Math.abs(active - i) > 0 ? true : undefined,
  });
  return (
    <div
      ref={root}
      className={`portfolio ${mode ? "reading-mode" : "cinematic-mode"} ${ready ? "world-ready" : ""}`}
    >
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter id="identity-ink" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 2 2 2 0 0"
            />
          </filter>
        </defs>
      </svg>
      <a
        className="skip-link"
        href="#content-about"
        onClick={(e) => {
          e.preventDefault();
          go("about");
        }}
      >
        Skip to portfolio content
      </a>
      <header className="site-header">
        <a
          className="wordmark"
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
          aria-label="Ali Bhatti Full Stack Developer, back to beginning"
        >
          <span className="monogram" aria-hidden="true">
            ab.
          </span>
          <span>
            ALI BHATTI<small>FULL STACK DEVELOPER</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          {[
            ["about", "About"],
            ["skills", "Toolkit"],
            ["work", "Work"],
            ["credentials", "Credentials"],
          ].map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                go(id);
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
            Résumé <span>↓</span>
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
              {w.name}
              <span>↗</span>
            </a>
          ))}
        </nav>
      )}
      {!mode && (
        <>
          <div className="world-surfaces" aria-hidden="true">
            {waypoints.map((w, i) => (
              <div
                key={w.id}
                ref={(el) => {
                  surfaces.current[i] = el;
                }}
                className={`scene-surface surface-${i}`}
                style={{ transform: `translateY(${i * 108}vh)` }}
              />
            ))}
          </div>
          {worldEnabled && (
            <Suspense fallback={null}>
              <JourneyWorld
                progress={progress}
                paused={library || !!preview}
                onReady={() => setReady(true)}
                onFail={() => setFailed(true)}
              />
            </Suspense>
          )}
          <div className="shared-portrait" ref={portrait}>
            <picture>
              <source
                media="(max-width:759px)"
                srcSet="/assets/optimized/portrait-mobile.webp"
              />
              <img
                src="/assets/optimized/portrait.webp"
                fetchPriority="high"
                alt="Muhammad Ali Ejaz, known as Ali Bhatti"
              />
            </picture>
            <span className="portrait-caption">
              THE PERSON BEHIND THE PIXELS
            </span>
          </div>
        </>
      )}
      <main className="story-content" id="main">
        <section id="content-home" {...attrs(0)}>
          <div className="hero-topline">
            <span className="eyebrow">INDEPENDENT DEVELOPER · PAKISTAN</span>
            <span className="eyebrow">SELECTED PORTFOLIO / 2026</span>
          </div>
          <h1 className="hero-name">
            Ali <em>Bhatti.</em>
          </h1>
          {mode && (
            <img
              className="reading-portrait"
              src="/assets/optimized/portrait.webp"
              alt="Muhammad Ali Ejaz, known as Ali Bhatti"
            />
          )}
          <div className="hero-left">
            <span className="eyebrow">01 / A HUMAN APPROACH</span>
            <h2>
              Thoughtful code.
              <br />
              <em>Lasting impressions.</em>
            </h2>
            <p>
              I’m Muhammad Ali Ejaz.
              <br />
              Full Stack Web Developer, connecting
              <br />
              ideas, interfaces and the systems beneath.
            </p>
            <Socials compact />
          </div>
          <div className="hero-right">
            <span className="tiny-star" aria-hidden="true">
              ✳
            </span>
            <p>
              Built with curiosity.
              <br />
              Shaped with intention.
            </p>
            <button
              className="circle-button"
              onClick={() => go("work")}
              aria-label="Explore selected work"
            >
              ↗
            </button>
          </div>
          <div className="hero-bottom">
            <span className="eyebrow">INTERFACE / LOGIC / DATA</span>
            <button onClick={() => go("about")}>
              SCROLL TO UNFOLD <span>↓</span>
            </button>
            <a href={`mailto:${profile.email}`}>LET’S TALK ↗</a>
          </div>
        </section>
        <section id="content-about" {...attrs(1)}>
          <div className="about-side">
            <span className="big-index">01</span>
            <span className="eyebrow">A LITTLE ABOUT ME</span>
          </div>
          <div className="scene-copy about-copy">
            <span className="eyebrow">THE HUMAN, BEFORE THE STACK</span>
            <h2>
              Curiosity is
              <br />
              the <em>constant.</em>
            </h2>
            <p className="lead">
              I connect what people see with
              <br />
              the systems that make it work.
            </p>
            <p>
              React and Next.js interfaces. Node.js and NestJS services.
              PostgreSQL databases with Prisma. From a client’s first idea to
              responsive experiences, secure APIs and maintainable code.
            </p>
            <details>
              <summary>
                Experience & education <span>↗</span>
              </summary>
              <div className="about-history">
                <h3>Freelance Full Stack Web Developer</h3>
                <p>
                  Upwork & Fiverr · Lahore · Sep 2025 – Jun 2026
                  <br />
                  REST APIs, JWT authentication, role-based access, third-party
                  services and client collaboration.
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
              Read my story in full ↓
            </a>
          </div>
        </section>
        <section id="content-skills" {...attrs(2)}>
          <div className="skills-heading">
            <span className="eyebrow">02 / THE TOOLS BEHIND THE THOUGHT</span>
            <h2>
              Different tools.
              <br />
              <em>One connected system.</em>
            </h2>
          </div>
          <div className="skill-category" aria-label="Filter technologies">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                  const n = skills.findIndex(
                    (s) => s.icon && (c === "All" || s.category === c),
                  );
                  if (n >= 0) setSkill(n);
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div
            className="technology-field"
            role="group"
            aria-label="Explore technical skills"
          >
            {skills.map(
              (s, i) =>
                s.icon && (
                  <button
                    key={s.name}
                    className={`technology ${skill === i ? "selected" : ""}`}
                    style={
                      {
                        "--depth": `${(i % 3) * -20}px`,
                        "--tilt": `${((i % 3) - 1) * 5}deg`,
                      } as React.CSSProperties
                    }
                    hidden={category !== "All" && s.category !== category}
                    onClick={() => setSkill(i)}
                    onFocus={() => setSkill(i)}
                    aria-pressed={skill === i}
                    aria-label={`${s.name}${s.study ? ", completed study" : ""}`}
                  >
                    <img
                      src={`/assets/brands/${s.icon}.svg`}
                      alt=""
                      loading="lazy"
                    />
                    <span>{s.name}</span>
                    {s.study && <small aria-hidden="true">STUDY</small>}
                  </button>
                ),
            )}
          </div>
          <div className="skill-inspector" aria-live="polite">
            <span className="eyebrow">
              {skills[skill].category} /{" "}
              {skills[skill].study
                ? "COMPLETED COURSEWORK"
                : "RÉSUMÉ EXPERIENCE"}
            </span>
            <h3>{skills[skill].name}</h3>
            <p>{skills[skill].evidence}</p>
            <details>
              <summary>Principles & additional study ↗</summary>
              <p>REST APIs · JWT authentication · Role-based access control</p>
              <p>{additionalStudy.join(" · ")}</p>
            </details>
          </div>
        </section>
        {projects.map((project, i) => (
          <section
            id={`content-${waypoints[i + 3].id}`}
            {...attrs(i + 3)}
            key={project.id}
          >
            <div className="scene-copy project-copy">
              <span className="eyebrow">03 / SELECTED WORK / 0{i + 1}</span>
              <h2>
                {i === 0 ? (
                  <>
                    Ideas, delivered.
                    <br />
                    <em>Connections, made.</em>
                  </>
                ) : i === 1 ? (
                  <>
                    Technology.
                    <br />
                    <em>With purpose.</em>
                  </>
                ) : (
                  <>
                    A little logic.
                    <br />
                    <em>A little play.</em>
                  </>
                )}
              </h2>
              <h3>{project.name}</h3>
              <p className="lead">{project.description}</p>
              <p className="artwork-note">
                Original project identity / abstract visual study
              </p>
              {project.url ? (
                <a
                  className="text-link"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit project ↗
                </a>
              ) : (
                <span className="project-status">
                  Public project link unavailable
                </span>
              )}
              <div className="project-pagination" aria-label="Choose project">
                {projects.map((pr, j) => (
                  <button
                    key={pr.id}
                    onClick={() => go(waypoints[j + 3].id)}
                    aria-label={`Show ${pr.name}`}
                    aria-pressed={i === j}
                  >
                    0{j + 1}
                    <span>{pr.name}</span>
                  </button>
                ))}
              </div>
              <button
                className="text-link"
                onClick={() => go(waypoints[i + 4].id)}
              >
                {i === 2 ? "Continue to the collection" : "Next project"} ↗
              </button>
            </div>
            <div className={`project-art project-art-${i}`}>
              <span className="project-giant" aria-hidden="true">
                {["CONNECT", "PURPOSE", "PLAY"][i]}
              </span>
              <img
                src={
                  [
                    "/assets/optimized/rcs.webp",
                    "/assets/optimized/goldadan.webp",
                    "/assets/optimized/bhabhi.webp",
                  ][i]
                }
                alt={`${project.name} original project artwork`}
                loading="lazy"
              />
              {i === 0 ? (
                <div className="route-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <b>KHANEWAL</b>
                  <b>CONNECTED POSSIBILITIES</b>
                </div>
              ) : i === 1 ? (
                <div className="architecture-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
              ) : (
                <div className="playing-marks" aria-hidden="true">
                  <span>♠</span>
                  <span>♥</span>
                  <span>♣</span>
                </div>
              )}
              <span className="art-caption">
                0{i + 1} —{" "}
                {
                  [
                    "ROUTES / SYSTEMS / MOVEMENT",
                    "SECURITY / SOFTWARE / ENTERPRISE",
                    "RULES / INTERACTION / PLAY",
                  ][i]
                }
              </span>
            </div>
          </section>
        ))}
        <section id="content-credentials" {...attrs(6)}>
          <div className="scene-copy credential-copy">
            <span className="eyebrow">04 / A RECORD OF CURIOSITY</span>
            <h2>
              Always
              <br />
              <em>in pursuit.</em>
            </h2>
            <p>
              Three professional programs. Four specializations.
              <br />
              Two Duke University guided projects.
            </p>
            <div className="active-credential" aria-live="polite">
              <span className="eyebrow">
                {selected.issuer} / {selected.type}
              </span>
              <h3>{selected.title}</h3>
              <time>{selected.date}</time>
            </div>
            <div className="carousel-controls">
              <button
                onClick={() => pick(credential - 1)}
                aria-label="Previous credential"
              >
                ←
              </button>
              <span className="mono">
                {String(credential + 1).padStart(2, "0")} /{" "}
                {String(featured.length).padStart(2, "0")}
              </span>
              <button
                onClick={() => pick(credential + 1)}
                aria-label="Next credential"
              >
                →
              </button>
            </div>
            <div className="credential-actions">
              <button onClick={() => setPreview(selected)}>Inspect ↗</button>
              <a href={selected.downloadPath} download>
                Download ↓
              </a>
              <a href={selected.url} target="_blank" rel="noopener noreferrer">
                Verify ↗
              </a>
            </div>
            <button className="library-link" onClick={() => setLibrary(true)}>
              Explore all {inventoryStats.count} credentials <span>↗</span>
            </button>
          </div>
          <div
            className="certificate-stack"
            onClickCapture={(e) => {
              if (e.detail > 0 && e.currentTarget.dataset.dragged === "true") {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            aria-label="Swipe certificate sheets"
            onPointerDown={(e) => {
              e.currentTarget.dataset.x = String(e.clientX);
              e.currentTarget.dataset.y = String(e.clientY);
              e.currentTarget.dataset.dragged = "false";
              e.currentTarget.dataset.dragging = "true";
              e.currentTarget.dataset.inspect = String(
                (e.target as Element).closest(".sheet-front") !== null,
              );
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.dataset.dragging === "true")
                e.currentTarget.style.setProperty(
                  "--drag",
                  String(
                    clamp(
                      (e.clientX - Number(e.currentTarget.dataset.x)) /
                        e.currentTarget.clientWidth,
                      -1,
                      1,
                    ),
                  ),
                );
            }}
            onPointerCancel={(e) => {
              e.currentTarget.dataset.dragging = "false";
              e.currentTarget.style.setProperty("--drag", "0");
            }}
            onPointerUp={(e) => {
              e.currentTarget.dataset.dragging = "false";
              e.currentTarget.style.setProperty("--drag", "0");
              const dx = e.clientX - Number(e.currentTarget.dataset.x),
                dy = e.clientY - Number(e.currentTarget.dataset.y);
              if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
                e.currentTarget.dataset.dragged = "true";
                pick(credential + (dx < 0 ? 1 : -1));
              } else if (
                Math.hypot(dx, dy) < 12 &&
                e.currentTarget.dataset.inspect === "true"
              )
                setPreview(selected);
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
          >
            <div className="paper-sheet sheet-back" />
            <div className="paper-sheet sheet-mid" />
            <button
              key={selected.id}
              className="paper-sheet sheet-front"
              onClick={() => setPreview(selected)}
              aria-label={`Inspect ${selected.title} certificate`}
            >
              <img
                src={selected.preview}
                alt={`Original ${selected.issuer} certificate: ${selected.title}`}
                loading="lazy"
                draggable="false"
              />
            </button>
            <span className="eyebrow">
              DRAG TO DISCOVER / {selected.issuer.toUpperCase()}
            </span>
          </div>
          <div className="featured-index" aria-label="Featured credentials">
            {featured.map((c, i) => (
              <button
                key={c.id}
                onClick={() => pick(i)}
                aria-pressed={credential === i}
                aria-label={`Show ${c.title}, ${c.issuer}`}
              >
                {c.issuer === "Duke University"
                  ? "DUKE"
                  : String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </section>
        <section id="content-contact" {...attrs(7)}>
          <span className="eyebrow finale-eyebrow">
            05 / EVERY ENDING, A NEW BEGINNING
          </span>
          <h2 className="finale-heading">
            Let’s make
            <br />
            <em>something matter.</em>
          </h2>
          <div className="finale-contact">
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email} <span>↗</span>
            </a>
            <p>
              {profile.location} <span>/</span>{" "}
              <a href={profile.phoneHref}>{profile.phone}</a>
            </p>
            <div className="resume-options">
              <a
                className="button"
                href="/assets/resume/Resume-Premium.pdf"
                download
              >
                Premium résumé ↓
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
          <div className="finale-socials">
            <span className="eyebrow">ELSEWHERE ON THE INTERNET</span>
            <Socials />
          </div>
          <div className="finale-bottom">
            <span>MUHAMMAD ALI EJAZ / ALI BHATTI</span>
            <button onClick={() => go("home")}>Back to the beginning ↑</button>
          </div>
        </section>
      </main>
      {!mode && (
        <div
          className="scroll-track"
          aria-hidden="true"
          style={{ height: "940vh" }}
        >
          {waypoints.map((w, i) => (
            <div
              key={w.id}
              id={w.id}
              style={{ position: "absolute", top: `${i * 120}vh` }}
            />
          ))}
        </div>
      )}
      <footer className="journey-controls">
        <button
          className="mode-button"
          disabled={reduced || failed}
          onClick={() => {
            setReading(!reading);
            progress.current = 0;
            window.scrollTo({ top: 0, behavior: "instant" });
          }}
        >
          {reduced
            ? "Reduced motion"
            : failed
              ? "Reading view"
              : mode
                ? "3D experience ↗"
                : "Reading view ☷"}
        </button>
        <div className="journey-line">
          <i />
        </div>
        <span className="journey-label">
          {String(active + 1).padStart(2, "0")} / {waypoints[active].name}
        </span>
        <button
          className="next-scene"
          onClick={() => go(waypoints[Math.min(7, active + 1)].id)}
          aria-label="Next scene"
        >
          ↓
        </button>
      </footer>
      {library && (
        <Suspense
          fallback={
            <div className="archive-loading" role="status">
              Opening the credential archive…
            </div>
          }
        >
          <CredentialLibrary
            open={library}
            onClose={() => {
              setLibrary(false);
              document
                .querySelector<HTMLButtonElement>(".library-link")
                ?.focus({ preventScroll: true });
            }}
          />
        </Suspense>
      )}
      <CredentialPreview
        credential={preview}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
