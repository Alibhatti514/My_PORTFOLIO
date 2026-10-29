import { CertificateSheets } from "./components/CertificateSheets";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { profile, projects } from "./data/portfolio";
import { skills, additionalStudy } from "./data/skills";
import { socials } from "./data/socials";
import { clamp, portraitPose, waypoints } from "./scene/journey";
import { projectPose } from "./scene/atrium";
import { spatialPose, credentialNumber } from "./scene/spatial";
import {
  CredentialPreview,
  type Credential,
} from "./components/CredentialPreview";
import featuredCertificates from "./data/featuredCertificates.json";
import inventoryStats from "./data/inventoryStats.json";
const CredentialLibrary = lazy(() => import("./components/CredentialLibrary"));
const JourneyWorld = lazy(() => import("./components/JourneyWorld"));
const issuerOrder = ["University of London", "Microsoft", "Duke University", "Packt"];
const featured = [...featuredCertificates].sort((a,b) => issuerOrder.indexOf(a.issuer) - issuerOrder.indexOf(b.issuer));
const categories = ["All", "Languages", "Frontend", "Backend", "Data", "Tools"];
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
    projectStage = useRef<HTMLElement>(null),
    projectCards = useRef<(HTMLDivElement | null)[]>([]),
    heroType = useRef<HTMLDivElement>(null),
    toolkitField = useRef<HTMLDivElement>(null),
    worldFrame = useRef<((p: number) => void) | null>(null),
    mode = reduced || reading || failed,
    selected = featured[credential];
  const pick = (n: number) =>
    setCredential((n + featured.length) % featured.length);
  useEffect(() => {
    const field = toolkitField.current;
    if (!field) return;
    const observer = new ResizeObserver(([entry]) => {
      root.current?.style.setProperty('--toolkit-height', `${entry.borderBoxSize[0].blockSize}px`);
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, []);
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
      const spatial = spatialPose(p, innerWidth < 760);
      root.current?.style.setProperty('--page-perspective', `${spatial.perspective}px`);
      worldFrame.current?.(p);
      panels.current.forEach((el, i) => {
        if (!el) return;
        const distance = clamp(i - p, -1, 1);
        // Vertical travel is supplied by the document, depth by the shared material.
        el.style.transform = `perspective(${spatial.perspective}px) translateZ(${-Math.abs(distance) * 130}px) rotateX(${distance * 5}deg) rotateY(${distance * spatial.lean * 6}deg)`;
        el.style.setProperty("--local", String(p - i));
      });
      if (heroType.current) heroType.current.style.transform = `translate3d(0,${-p * 120}vh,${-p * 220}px) rotateX(${p * 3}deg)`;
      if (projectStage.current) {
        projectStage.current.style.setProperty("--travel", String((p - 3) / 2));
      }
      projectCards.current.forEach((el, i) => {
        if (!el) return;
        const q = projectPose(p, i, innerWidth < 760);
        el.style.transform = `translate3d(${q.x}%,${q.y}%,${q.z}px) rotateY(${q.rotateY}deg) rotateX(${q.rotateX}deg)`;
        el.style.opacity = String(q.opacity);
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
    const resize = () => {
      if (height > 0) window.scrollTo({ top: scrollY / height * innerHeight, behavior: 'instant' });
    };
    window.addEventListener('resize', resize);
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
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
    if (mode) {
      setActive(Math.max(0,i));
      const element = i >= 3 && i <= 5 ? projectCards.current[i-3] : document.getElementById(`content-${id}`);
      element?.scrollIntoView({ behavior: "instant" });
    }
    else {
      history.pushState(null, "", `#${id}`);
      window.scrollTo({
        top: Math.max(0, i) * innerHeight * 1.2,
        behavior: reduced ? "instant" : "smooth",
      });
    }
  };
  useEffect(() => {
    const restore = () => {
      const i = waypoints.findIndex(w => w.id === location.hash.slice(1));
      if (i >= 0 && !mode) window.scrollTo({ top: i * innerHeight * 1.2, behavior: "instant" });
    };
    restore();
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, [mode]);
  const attrs = (i: number) => ({
    ref: (el: HTMLElement | null) => {
      panels.current[i] = el;
    },
    className: `scene-panel panel-${i}`,
    style: mode ? undefined : ({ "--scene-index": i } as React.CSSProperties),
    inert: !mode && Math.abs(active - i) > 1,
    "aria-hidden": !mode && Math.abs(active - i) > 1 ? true : undefined,
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
            <div className="page-material" />
          </div>
          {worldEnabled && (
            <Suspense fallback={null}>
              <JourneyWorld
                progress={progress}
                renderFrame={worldFrame}
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
      {!mode && <div className="hero-profession" ref={heroType} aria-label="I’m a Full Stack Developer"><span><small>I’M A</small>FULL<br/><em>STACK</em></span><span><small>WEB /</small>DEVELOPER.</span></div>}
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
            <h2>
              Building Digital Experiences.
              <br />
              <em>Engineering Reliable Solutions.</em>
            </h2>
            <p>
              Full-Stack Web Developer specializing in modern frontend applications, backend services, RESTful APIs, and database-driven solutions.
            </p>
            <Socials compact />
          </div>
          <div className="hero-right">
            <span className="tiny-star" aria-hidden="true">
              ✳
            </span>
            <p>
              Frontend precision.
              <br />
              Backend reliability.
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
          <div className="scene-copy about-copy">
            <h2>
              Full-Stack Development.
              <br />
              <em>From Concept to Deployment.</em>
            </h2>
            <p className="lead">
              I develop responsive web applications by combining modern frontend technologies with reliable backend architecture.
            </p>
            <p>
              My technical experience includes React, Next.js, Node.js, NestJS, PostgreSQL, and Prisma, alongside continued development in C#, ASP.NET Core, and Blazor.
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
            <h2>
              Technologies &
              <br />
              <em>Technical Expertise.</em>
            </h2>
            <p>A comprehensive technical toolkit covering programming languages, frontend frameworks, backend development, databases, and development tools.</p>
          </div>
          <div className="skill-category" aria-label="Filter technologies">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => {
                  setCategory(c);
                  const n = skills.findIndex(
                    (s) => (c === "All" || s.category === c),
                  );
                  if (n >= 0) setSkill(n);
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <motion.div
            ref={toolkitField}
            className="technology-field"
            role="group"
            aria-label="Explore technical skills"
          >
            <AnimatePresence mode="popLayout">{skills.map(
              (s, i) =>
                (category === "All" || s.category === category) && (
                  <motion.button layout="position" initial={{opacity:0, z:-130, scale:.7}} animate={{opacity:1,z:0,scale:1}} exit={{opacity:0,scale:.6,z:-100}} transition={{duration:mode?0:.35}}
                    key={s.name}
                    className={`technology ${skill === i ? "selected" : ""}`}
                    style={
                      {
                        "--depth": `${(i % 3) * -20}px`,
                        "--tilt": `${((i % 3) - 1) * 5}deg`,
                      } as React.CSSProperties
                    }
                    onClick={() => setSkill(i)}
                    onFocus={() => setSkill(i)}
                    aria-pressed={skill === i}
                    aria-label={s.name}
                  >
                    {s.icon ? <img src={`/assets/brands/${s.icon}.svg`} alt="" loading="lazy" /> : <b className="concept-mark" aria-hidden="true">{s.name === "REST APIs" ? "{ }" : "JWT"}</b>}
                    <span>{s.name}</span>
                  </motion.button>
                ),
            )}</AnimatePresence>
          </motion.div>
          <div className="skill-inspector" style={{"--skill-rows": Math.ceil(skills.filter(s => category === "All" || s.category === category).length / 6)} as React.CSSProperties} aria-live="polite">
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
        <div className="project-runway"><section id="content-work" ref={projectStage} className="scene-panel project-stage" inert={!mode && (active < 3 || active > 5)} aria-hidden={!mode && (active < 3 || active > 5) ? true : undefined}>
          <div className="project-stage-heading"><span className="eyebrow">SELECTED PROJECTS</span></div>
          <div className="project-space">
            {projects.map((project,i) => <div key={project.id} ref={el => {projectCards.current[i] = el;}} className={`project-composition composition-${i}`} inert={!mode && active !== i+3} aria-hidden={!mode && active !== i+3 ? true : undefined} style={mode ? undefined : {opacity:i===0?1:0, transform:`translate3d(${i*68}%,0,${-i*420}px)`}}>
              <div className="project-identity"><span className="eyebrow">{["LOGISTICS / CONNECTION","ENTERPRISE / TECHNOLOGY","INTERACTION / PLAY"][i]}</span><h2>{project.name}</h2><p>{project.description}</p><p className="project-evidence">Original project identity</p>{project.url ? <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer">Visit project ↗</a> : <span className="project-status">Public project link unavailable</span>}</div>
              <div className="project-object"><img src={["/assets/optimized/rcs.webp","/assets/optimized/goldadan.webp","/assets/optimized/bhabhi.webp"][i]} alt={`${project.name} original project artwork`} loading="lazy"/></div>
            </div>)}
          </div>
          <nav className="project-navigation" aria-label="Choose project">{projects.map((project,i) => <button key={project.id} onClick={() => go(waypoints[i+3].id)} aria-label={`Show ${project.name}`} aria-pressed={Math.min(2,Math.max(0,active-3))===i}>{project.name}<b aria-hidden="true">↗</b></button>)}</nav>
        </section>
        </div>
        <section id="content-credentials" {...attrs(6)}>
          <div className="certificate-section-stage">
          <div className="scene-copy credential-copy">
            <h2>
              Professional Certifications
              <br />
              <em>& Specializations.</em>
            </h2>
            <p>
              Verified professional certificates, specializations, and guided projects from recognized institutions, including Microsoft, Duke University, the University of London, and Packt.
            </p>
            <motion.div key={selected.id} initial={{opacity:mode?1:0,y:mode?0:8}} animate={{opacity:1,y:0}} transition={{duration:mode?0:.35}} className="active-credential" aria-live="polite">
              <span className="eyebrow">
                {selected.issuer} / {selected.type}
              </span>
              <h3>{selected.title}</h3>
              <time>{selected.date}</time>
            </motion.div>
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
          <div className="certificate-wheel-rail">
          <div className="certificate-wheel-stage">
          <div
            className="certificate-stack"
            tabIndex={0}
            role="group"
            onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") {e.preventDefault(); pick(credential + (e.key === "ArrowRight" ? 1 : -1));}}}
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
              e.currentTarget.dataset.certificateIndex = (e.target as Element).closest<HTMLElement>("[data-certificate-index]")?.dataset.certificateIndex ?? "";
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
              else if (Math.hypot(dx, dy) < 12 && e.currentTarget.dataset.certificateIndex !== "")
                pick(Number(e.currentTarget.dataset.certificateIndex));
              if (e.currentTarget.hasPointerCapture(e.pointerId))
                e.currentTarget.releasePointerCapture(e.pointerId);
            }}
          >
            <CertificateSheets certificates={featured} active={credential} reduced={mode} inspect={setPreview} select={pick} />
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
                {credentialNumber(i)}
              </button>
            ))}
          </div>
          </div>
          </div>
          </div>
        </section>
        <section id="content-contact" {...attrs(7)}>
          <h2 className="finale-heading">
            Your next idea.
            <br />
            <em>Built to work.</em>
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
