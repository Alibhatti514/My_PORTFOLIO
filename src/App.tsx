import { useEffect, useRef, useState } from "react";
import { profile, projects } from "./data/portfolio";
import { socials } from "./data/socials";
import { chapters } from "./data/chapters";
import SystemScene from "./components/SystemScene";
import Credentials from "./components/Credentials";
const nav = [
  ["work", "Work"],
  ["about", "About"],
  ["credentials", "Credentials"],
  ["contact", "Contact"],
];
const stack = [
  {
    name: "The interface",
    number: "01",
    text: "Responsive, considered experiences. From semantic structure to the final interaction.",
    items: [
      "HTML5",
      "CSS3",
      "JavaScript (ES6+)",
      "TypeScript",
      "React.js",
      "Next.js",
    ],
    icons: ["html5", "css3", "javascript", "typescript", "react", "nextdotjs"],
  },
  {
    name: "The system",
    number: "02",
    text: "Business logic, secure endpoints, and the connections that make an application work.",
    items: ["Node.js", "NestJS", "REST APIs", "JWT Authentication"],
    icons: ["nodedotjs", "nestjs"],
  },
  {
    name: "The foundation",
    number: "03",
    text: "Structured data and a deliberate workflow. Built to be understood and maintained.",
    items: ["PostgreSQL", "Prisma ORM", "Python", "Git", "GitHub", "Postman"],
    icons: ["postgresql", "prisma", "python", "git", "github", "postman"],
  },
];
export default function App() {
  const [menu, setMenu] = useState(false),
    [active, setActive] = useState("work"),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [project, setProject] = useState<number | null>(null);
  const menuDialog = useRef<HTMLDialogElement>(null),
    projectDialog = useRef<HTMLDialogElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setReduced(m.matches);
    m.addEventListener("change", f);
    return () => m.removeEventListener("change", f);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reduced);
    return () => document.documentElement.classList.remove("reduce-motion");
  }, [reduced]);
  useEffect(() => {
    if (menu) menuDialog.current?.showModal();
    else menuDialog.current?.close();
  }, [menu]);
  useEffect(() => {
    if (project !== null) projectDialog.current?.showModal();
    else projectDialog.current?.close();
  }, [project]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        }),
      { rootMargin: "-20% 0px -55% 0px" },
    );
    nav.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const aliases: Record<string, string> = {
      human: "home",
      code: "skills",
      languages: "skills",
      frontend: "skills",
      backend: "skills",
      data: "skills",
      workflow: "skills",
      connect: "contact",
      education: "experience",
      "rcs-cargo": "work",
      goldadan: "work",
      "bhabhi-thulla": "work",
    };
    const target = aliases[location.hash.slice(1)];
    if (target) document.getElementById(target)?.scrollIntoView();
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to portfolio content
      </a>
      <header className="site-header">
        <a href="#home" className="wordmark" aria-label="Ali Bhatti home">
          <span className="brand-symbol">
            a<span>b</span>
          </span>
          <span>
            ALI BHATTI<span className="wordmark-sub">DEVELOPER / PAKISTAN</span>
          </span>
        </a>
        <nav aria-label="Main navigation">
          {nav.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === id ? "location" : undefined}
            >
              {label}
              <span className="nav-dot" />
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a
            className="header-resume"
            href="/assets/resume/Resume-Premium.pdf"
            download
          >
            Résumé <span aria-hidden="true">↓</span>
          </a>
          <button
            ref={menuButton}
            className="menu-button"
            aria-label="Open navigation"
            aria-expanded={menu}
            aria-controls="mobile-menu"
            onClick={() => setMenu(true)}
          >
            Menu <span aria-hidden="true">☰</span>
          </button>
        </div>
      </header>
      <main id="main">
        <section className="hero section" id="home">
          <div className="hero-top">
            <span className="eyebrow">
              <i className="status-dot" /> FULL STACK WEB DEVELOPER
            </span>
            <span className="mono">
              BASED IN KHANEWAL, PAKISTAN <span className="accent">↗</span>
            </span>
          </div>
          <div className="hero-composition">
            <div className="hero-copy">
              <span className="intro-note">
                A little curiosity. A lot of code.
              </span>
              <h1>
                Ideas into
                <br />
                interfaces.
                <br />
                <span>And beyond</span>
                <b>.</b>
              </h1>
              <p>
                I’m Ali Bhatti. I connect thoughtful frontends
                <br className="desktop-break" /> with the systems that bring
                them to life.
              </p>
              <div className="hero-actions">
                <a className="button" href="#work">
                  Explore my work <span aria-hidden="true">↘</span>
                </a>
                <a className="hero-contact" href={`mailto:${profile.email}`}>
                  Let’s talk <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <SystemScene reduced={reduced} />
          </div>
          <div className="hero-foot">
            <span className="mono">INTERFACE → LOGIC → DATA</span>
            <a className="scroll-cue" href="#work">
              SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
            </a>
            <span className="mono">CRAFTED WITH INTENTION / 2026</span>
          </div>
        </section>
        <div className="identity-strip" aria-hidden="true">
          <span>ALI BHATTI</span>
          <span className="asterisk">✳</span>
          <span>FULL STACK</span>
          <span className="asterisk">✳</span>
        </div>
        <section id="work" className="section work-section">
          <div className="section-top">
            <span className="eyebrow">01 / SELECTED WORK</span>
            <span className="mono">
              THREE PROJECTS. DIFFERENT POSSIBILITIES.
            </span>
          </div>
          <div className="section-heading">
            <h2>
              From a first line.
              <br />
              <em>To something real.</em>
            </h2>
            <p>
              Logistics, enterprise technology, and a little play. A selection
              from my development journey.
            </p>
          </div>
          <div className="project-list">
            {projects.map((p, i) => (
              <article className={`project project-${i}`} key={p.id}>
                <button
                  className="project-art"
                  onClick={() => setProject(i)}
                  aria-label={`Explore ${p.name}: ${["Connected routes / logistics", "Digital presence / technology", "Logic meets play / card game"][i]}. Original project identity`}
                >
                  <span className="art-caption mono">
                    {
                      [
                        "CONNECTED ROUTES / LOGISTICS",
                        "DIGITAL PRESENCE / TECHNOLOGY",
                        "LOGIC MEETS PLAY / CARD GAME",
                      ][i]
                    }
                  </span>
                  {i === 0 ? (
                    <div className="route-art">
                      <div className="route-orbit orbit-one" />
                      <div className="route-orbit orbit-two" />
                      <div className="route-orbit orbit-three" />
                      <span className="route-point point-one" />
                      <span className="route-point point-two" />
                      <span className="route-point point-three" />
                      <div className="project-logo">
                        <img
                          src={
                            [
                              `/assets/optimized/rcs.webp`,
                              `/assets/optimized/goldadan.webp`,
                              `/assets/optimized/bhabhi.webp`,
                            ][i]
                          }
                          alt="RCS Cargo original logo"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ) : i === 1 ? (
                    <div className="enterprise-art">
                      <i />
                      <i />
                      <i />
                      <div className="project-logo">
                        <img
                          src={
                            [
                              `/assets/optimized/rcs.webp`,
                              `/assets/optimized/goldadan.webp`,
                              `/assets/optimized/bhabhi.webp`,
                            ][i]
                          }
                          alt="Goldadan original logo"
                          loading="lazy"
                        />
                      </div>
                      <span className="enterprise-cross">+</span>
                    </div>
                  ) : (
                    <div className="game-art">
                      <i>♠</i>
                      <i>♦</i>
                      <div className="project-logo">
                        <img
                          src={
                            [
                              `/assets/optimized/rcs.webp`,
                              `/assets/optimized/goldadan.webp`,
                              `/assets/optimized/bhabhi.webp`,
                            ][i]
                          }
                          alt="Bhabhi Thulla original logo"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  )}
                  <span className="art-bottom mono">
                    ORIGINAL PROJECT IDENTITY{" "}
                    <span className="art-arrow">↗</span>
                  </span>
                </button>
                <div className="project-copy">
                  <span className="eyebrow">PROJECT / 0{i + 1}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <span className="project-category">
                    {
                      [
                        "Logistics web project",
                        "Company website",
                        "Card-game project",
                      ][i]
                    }
                  </span>
                  <button className="text-link" onClick={() => setProject(i)}>
                    Inside the project <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section id="about" className="section about-section">
          <div className="section-top">
            <span className="eyebrow">02 / THE PERSON BEHIND THE CODE</span>
            <span className="mono">HUMAN FIRST. DEVELOPER ALWAYS.</span>
          </div>
          <div className="about-layout">
            <div className="portrait-frame">
              <span className="portrait-label mono">
                MUHAMMAD ALI EJAZ / ALI BHATTI
              </span>
              <div className="portrait-grid" />
              <img
                src="/assets/optimized/portrait.webp"
                alt="Ali Bhatti, full stack web developer"
                loading="lazy"
                width="1105"
                height="1105"
              />
              <span className="portrait-footer mono">
                KHANEWAL, PK <span>FULL STACK DEVELOPER</span>
              </span>
            </div>
            <div className="about-copy">
              <h2>
                Thoughtful on the
                <br />
                surface.
                <br />
                <em>Deliberate underneath.</em>
              </h2>
              <p className="large-copy">
                I build web applications that connect responsive interfaces,
                secure backend services, and structured data.
              </p>
              <p>
                My work spans React and Next.js frontends, Node.js and NestJS
                APIs, and PostgreSQL databases with Prisma. I value clear
                communication, maintainable code, and the small decisions that
                make an experience feel right.
              </p>
              <p>
                Learning is part of the process. My completed programs cover
                full stack development, Node.js, C# and .NET, and SvelteKit.
              </p>
              <a className="text-link" href="#experience">
                The journey so far <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>
        </section>
        <section id="skills" className="section skills-section">
          <div className="section-top">
            <span className="eyebrow">03 / THE TOOLKIT</span>
            <span className="mono">ONE CONNECTED APPROACH.</span>
          </div>
          <div className="section-heading">
            <h2>
              Every layer.
              <br />
              <em>Considered.</em>
            </h2>
            <p>
              From what you see to how it works.
              <br />
              The tools I use to connect the two.
            </p>
          </div>
          <div className="stack-grid">
            {stack.map((s) => (
              <article className="stack-layer" key={s.name}>
                <div className="stack-number">
                  {s.number}
                  <span aria-hidden="true">↘</span>
                </div>
                <div className="stack-icons">
                  {s.icons.map((icon) => (
                    <img
                      key={icon}
                      src={`/assets/brands/${icon}.svg`}
                      alt=""
                      loading="lazy"
                    />
                  ))}
                </div>
                <h3>{s.name}</h3>
                <p>{s.text}</p>
                <ul>
                  {s.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="learning-note">
            <span className="accent">↳</span> Further completed study: C# 12 ·
            .NET 8 · ASP.NET Core · Blazor · Svelte 5 · SvelteKit.{" "}
            <a href="#credentials">See credentials ↗</a>
          </p>
        </section>
        <section id="experience" className="section journey-section">
          <div className="section-top">
            <span className="eyebrow">04 / EXPERIENCE & FOUNDATIONS</span>
            <span className="mono">BUILD. LEARN. REPEAT.</span>
          </div>
          <div className="journey-layout">
            <h2>
              A foundation.
              <br />
              <em>A way forward.</em>
            </h2>
            <div className="timeline">
              <span className="timeline-label mono">
                PROFESSIONAL EXPERIENCE
              </span>
              {["Upwork", "Fiverr"].map((platform) => (
                <article className="timeline-row" key={platform}>
                  <span className="mono">SEP 2025 — JUN 2026</span>
                  <h3>Freelance Full Stack Web Developer</h3>
                  <span className="timeline-org">
                    {platform} · Lahore, Pakistan
                  </span>
                  <p>
                    {platform === "Upwork"
                      ? "Developed responsive React and Next.js applications, Node.js and NestJS REST APIs, and PostgreSQL / Prisma integrations. Implemented JWT authentication and role-based access control."
                      : "Built custom interfaces and backend services around client requirements. Integrated third-party services, managed business logic, and incorporated client feedback into maintainable applications."}
                  </p>
                </article>
              ))}
              <span className="timeline-label mono">EDUCATION</span>
              <article className="timeline-row">
                <span className="mono">2021 — 2025</span>
                <h3>Bachelor in Computer Science</h3>
                <p>Punjab University · Lahore, Pakistan</p>
              </article>
              <article className="timeline-row">
                <span className="mono">2018 — 2020</span>
                <h3>Intermediate in Computer Science (ICS)</h3>
                <p>Hawk College · Khanewal, Pakistan</p>
              </article>
            </div>
          </div>
        </section>
        <Credentials />
        <section id="resume" className="section resume-section">
          <div>
            <span className="eyebrow">THE STORY, ON PAPER</span>
            <h2>
              Take it
              <br />
              <em>with you.</em>
            </h2>
            <p>
              Experience, projects, education, and selected credentials.
              <br />
              Two formats, ready for your next conversation.
            </p>
          </div>
          <div className="resume-options">
            <a href="/assets/resume/Resume-Premium.pdf" download>
              <span className="resume-file">PDF / 01</span>
              <h3>Designed résumé</h3>
              <p>A considered layout. The complete professional picture.</p>
              <span className="download-label">
                DOWNLOAD PREMIUM <b aria-hidden="true">↓</b>
              </span>
            </a>
            <a href="/assets/resume/Resume-ATS.pdf" download>
              <span className="resume-file">PDF / 02</span>
              <h3>ATS-friendly résumé</h3>
              <p>A simple, single-column format for applications.</p>
              <span className="download-label">
                DOWNLOAD ATS <b aria-hidden="true">↓</b>
              </span>
            </a>
          </div>
        </section>
        <section id="contact" className="section contact-section">
          <div className="section-top">
            <span className="eyebrow">06 / THE NEXT CHAPTER</span>
            <span className="mono">GOOD THINGS BEGIN WITH A CONVERSATION.</span>
          </div>
          <div className="contact-heading">
            <h2>
              Let’s make
              <br />
              <em>something matter.</em>
            </h2>
            <a
              className="contact-orb"
              href={`mailto:${profile.email}`}
              aria-label="Email Ali Bhatti"
            >
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="contact-details">
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email} <span aria-hidden="true">↗</span>
            </a>
            <div>
              <a href={profile.phoneHref}>{profile.phone}</a>
              <span>{profile.location}</span>
            </div>
          </div>
          <div className="social-links">
            {socials.map((s) => (
              <a
                key={s.id}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={s.icon} alt="" loading="lazy" />
                {s.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <a href="#home" className="footer-name">
          ALI BHATTI<span>↗</span>
        </a>
        <div className="footer-bottom">
          <span className="mono">© 2026 ALI BHATTI. BUILT WITH INTENTION.</span>
          <button aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
            Motion: {reduced ? "reduced" : "full"}{" "}
            <span aria-hidden="true">{reduced ? "○" : "◉"}</span>
          </button>
          <a href="#home">Back to top ↑</a>
        </div>
      </footer>
      <dialog
        ref={menuDialog}
        id="mobile-menu"
        className="mobile-menu"
        aria-labelledby="menu-title"
        onCancel={() => setMenu(false)}
      >
        <div className="dialog-heading">
          <h2 id="menu-title">Explore.</h2>
          <button
            className="close-dialog"
            onClick={() => setMenu(false)}
            aria-label="Close navigation"
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          {[
            ...nav,
            ["skills", "Toolkit"],
            ["experience", "Experience"],
            ["archive", "Certificate archive"],
            ["resume", "Résumé"],
          ].map(([id, label], i) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => {
                setMenu(false);
                setTimeout(
                  () => document.getElementById(id)?.scrollIntoView(),
                  0,
                );
              }}
            >
              <span className="mono">0{i + 1}</span>
              {label}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </dialog>
      <dialog
        ref={projectDialog}
        className="project-dialog"
        aria-labelledby="project-title"
        onCancel={() => setProject(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setProject(null);
        }}
      >
        {project !== null && (
          <>
            <div className="dialog-heading">
              <span className="eyebrow">SELECTED WORK / 0{project + 1}</span>
              <button
                className="close-dialog"
                onClick={() => setProject(null)}
                aria-label="Close project details"
              >
                ×
              </button>
            </div>
            <h2 id="project-title">{projects[project].name}</h2>
            <img
              src={projects[project].logo}
              alt={`${projects[project].name} original identity`}
            />
            <p>{projects[project].description}</p>
            <p>{chapters[project + 7].detail}</p>
            <div className="project-evidence">
              <span className="mono">PUBLIC DEMO & REPOSITORY</span>
              <p>Project links are not currently available.</p>
            </div>
            <a
              className="button"
              href={`mailto:${profile.email}?subject=${encodeURIComponent(`Tell me about ${projects[project].name}`)}`}
            >
              Ask about this project ↗
            </a>
          </>
        )}
      </dialog>
    </>
  );
}
