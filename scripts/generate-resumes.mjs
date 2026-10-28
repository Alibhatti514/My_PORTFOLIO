import { chromium } from "playwright";
import fs from "node:fs/promises";
const root = new URL("../", import.meta.url);
const certificates = JSON.parse(
  await fs.readFile(new URL("src/data/certificates.json", root), "utf8"),
);
const esc = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const asset = async (path, mime) =>
  `data:${mime};base64,${(await fs.readFile(new URL(path, root))).toString("base64")}`;
const bodyFont = await asset(
  "node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2",
  "font/woff2",
);
const headingFont = await asset(
  "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
  "font/woff2",
);
const portrait = await asset(
  "public/assets/ali-bhatti-portrait.png",
  "image/png",
);
const icons = {};
for (const name of [
  "react",
  "typescript",
  "nodedotjs",
  "nestjs",
  "postgresql",
  "prisma",
])
  icons[name] = await asset(
    `public/assets/brands/${name}.svg`,
    "image/svg+xml",
  );
const programs = certificates
  .filter((c) => c.featured)
  .sort((a, b) => a.type.localeCompare(b.type));
const summary =
  "Full Stack Web Developer building responsive React and Next.js interfaces, Node.js and NestJS services, and PostgreSQL databases with Prisma ORM. Experienced with REST APIs, JWT authentication, client collaboration, and maintainable code.";
const contact = `<a href="mailto:dev._.ali@icloud.com">dev._.ali@icloud.com</a><a href="tel:+923172003786">+92 317 2003786</a><span>Khanewal, Pakistan</span><a href="https://github.com/Alibhatti514">github.com/Alibhatti514</a><a href="https://www.linkedin.com/in/muhammad-ali-ejaz-bhatti-629676442/">LinkedIn / Muhammad Ali Ejaz Bhatti</a>`;
const experience = `<h2><span>01</span> Professional experience</h2><article class="role"><div class="role-top"><h3>Freelance Full Stack<br/>Web Developer</h3><span>Sep 2025 - Jun 2026</span></div><p class="org">Upwork / Lahore, Pakistan</p><ul><li>Developed responsive full stack web applications using React.js, Next.js, HTML5, CSS3, JavaScript (ES6+), and TypeScript.</li><li>Built Node.js and NestJS services and REST APIs; integrated PostgreSQL databases using Prisma ORM.</li><li>Implemented JWT authentication and role-based access control, with attention to application performance.</li><li>Collaborated with clients on maintainable solutions and clear, timely delivery.</li></ul></article><article class="role"><div class="role-top"><h3>Freelance Full Stack<br/>Web Developer</h3><span>Sep 2025 - Jun 2026</span></div><p class="org">Fiverr / Lahore, Pakistan</p><ul><li>Built custom full stack applications and responsive interfaces around client requirements.</li><li>Developed backend APIs, integrated third-party services, and managed business logic with NestJS and Node.js.</li><li>Managed PostgreSQL data with Prisma ORM for secure, reliable application performance.</li><li>Incorporated client feedback and maintained project documentation and communication.</li></ul></article>`;
const education = `<h2><span>02</span> Education</h2><article><h3>Bachelor in Computer Science</h3><p>Punjab University / Lahore, Pakistan</p><p class="date">2021 - 2025</p></article><article><h3>Intermediate in Computer Science (ICS)</h3><p>Hawk College / Khanewal, Pakistan</p><p class="date">2018 - 2020</p></article>`;
const groups = [
  ["Languages", "JavaScript (ES6+) · TypeScript · Python"],
  ["Frontend", "HTML5 · CSS3 · React.js · Next.js"],
  ["Backend", "Node.js · NestJS · REST APIs · JWT Authentication"],
  ["Data", "PostgreSQL · Prisma ORM"],
  ["Tools", "Git · GitHub · Postman"],
];
const study =
  "C# 12, .NET 8, ASP.NET Core, Blazor, Svelte 5, SvelteKit, Express, Supabase, Sanity CMS, Stripe integration, OOP, web scraping, algorithms, deployment, security, and UI/UX accessibility.";
const projects = [
  [
    "RCS CARGO",
    "Logistics web project with an authentic brand identity and a focus on connected routes and movement.",
  ],
  [
    "GOLDADAN",
    "Company website presenting security, software, hardware, and enterprise technology services.",
  ],
  [
    "BHABHI THULLA",
    "Card-game project with an authentic, playful visual identity.",
  ],
];
const footer = (page, label) =>
  `<footer><span>MUHAMMAD ALI EJAZ / ALI BHATTI</span><span>${label} / 0${page}</span></footer>`;
const fontCSS = `@font-face{font-family:Body;src:url('${bodyFont}')}@font-face{font-family:Heading;src:url('${headingFont}')}@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;color:#251a1d;font:11px/1.6 Body,sans-serif}h1,h2,h3,p{margin:0}h1,h2,h3{font-family:Heading,sans-serif;font-weight:500} .premium h1{font-family:Georgia,serif;font-weight:400}a{color:inherit;text-decoration:none}article{break-inside:avoid}.page{width:210mm;height:297mm;position:relative;break-after:page;overflow:hidden}.page:last-child{break-after:auto}footer{position:absolute;left:13mm;right:13mm;bottom:10mm;display:flex;justify-content:space-between;border-top:1px solid #d6c2aa;padding-top:8px;font-size:7px;letter-spacing:1px;color:#755b5e}.eyebrow{font-size:8px;letter-spacing:1.8px;text-transform:uppercase}.date{color:#755b5e;font-size:9px}h2{font-size:12px;letter-spacing:.9px;text-transform:uppercase;margin:0 0 17px;display:flex;align-items:center;gap:10px}h2>span{color:#782d46;font-size:9px}h3{font-size:12px}ul{margin:10px 0 0;padding-left:14px}li{padding-left:3px;margin-bottom:7px}.org{color:#755b5e;font-size:9px;margin:7px 0}.role{margin-bottom:24px}.role-top{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.role-top>span{font-size:8px;color:#755b5e;white-space:nowrap}.role-top h3{line-height:1.3}.contact{display:flex;flex-direction:column;gap:8px;font-size:9px}`;
const premiumCSSBase = `${fontCSS}body{background:white}.premium-header{height:78mm;position:relative;padding:14mm 13mm;overflow:hidden;background:radial-gradient(ellipse at 82% 60%,#782d46,#581c32 50%,#35101f);color:#f7f0e6}.premium-header .eyebrow{color:#c49a82;margin-bottom:14px}.premium-header h1{font-size:36px;line-height:1.03;letter-spacing:-1.8px;position:relative;z-index:2}.premium-header .job-title{font-size:13px;color:#e9dccb;margin-top:13px;letter-spacing:.4px}.header-note{position:absolute;left:13mm;bottom:10mm;color:#d6c2aa;font-size:8px;letter-spacing:1.2px}.portrait{position:absolute;right:-1mm;bottom:-8mm;width:87mm;height:87mm;object-fit:contain;z-index:1}.portrait-orbit{position:absolute;right:9mm;top:10mm;width:70mm;height:70mm;border:1px solid #c49a8277;border-radius:50%;transform:rotate(-30deg) scaleX(.75)}.portrait-orbit.two{transform:rotate(35deg) scaleX(.9);top:14mm;border-color:#c49a8266}.header-dot{position:absolute;right:17mm;top:20mm;width:5px;height:5px;background:#c49a82;border-radius:50%;box-shadow:0 0 0 5px #c49a8219}.premium-grid{display:grid;grid-template-columns:61mm 1fr;gap:0;min-height:201mm}.sidebar{background:#581c32;color:#f7f0e6;padding:9mm 8mm 10mm 13mm}.sidebar h2{font-size:10px;color:#e9dccb;letter-spacing:1px;margin-bottom:14px;border-bottom:1px solid #c49a824d;padding-bottom:10px}.sidebar .contact{font-size:8px;gap:7px;overflow-wrap:anywhere}.sidebar-section{margin-top:24px}.sidebar h3{color:#c49a82;font:8px Body;letter-spacing:1px;text-transform:uppercase;margin:12px 0 4px}.sidebar p{font-size:9px;color:#e9dccb;line-height:1.7}.sidebar .study-note{font-size:7px;color:#d6c2aa;margin-top:8px}.main-column{padding:9mm 13mm 5mm 10mm}.summary{font-size:11px;line-height:1.8;margin-bottom:22px;padding-bottom:20px;border-bottom:1px solid #d6c2aa}.main-column li{font-size:10.5px;line-height:1.65;margin-bottom:6px}.main-column .role{margin-bottom:19px}.main-column h2{font-size:10px;margin-bottom:14px}.main-column h3{font-size:11px}.main-column .role-top>span{font-size:7px}.education{margin-top:20px}.education article{margin-bottom:13px}.education p{font-size:9px;margin-top:3px}.premium .page:first-child footer{left:71mm}.continuation{height:36mm;background:linear-gradient(115deg,#35101f,#581c32);padding:11mm 13mm;color:#f7f0e6;display:flex;justify-content:space-between;align-items:center}.continuation h1{font-size:22px;line-height:1.1;letter-spacing:-.5px}.continuation .eyebrow{color:#c49a82;margin-bottom:8px}.folio{font-size:54px;color:#c49a82;line-height:1;opacity:.6}.page-two-content{padding:8mm 13mm}.section-heading{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #d6c2aa;margin-bottom:18px}.section-heading h2{margin-bottom:10px}.section-heading>span{font-size:8px;color:#755b5e}.skill-lanes{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:20px}.skill-lane{border:1px solid #d6c2aa;padding:13px;background:#f7f0e6;position:relative}.lane-icons{display:flex;align-items:center;gap:10px;margin-bottom:10px;position:relative}.lane-icons:before{content:'';position:absolute;left:10px;right:10px;top:50%;height:1px;background:#d6c2aa}.lane-icons img{width:31px;height:31px;object-fit:contain;background:#e9dccb;padding:7px;border-radius:50%;position:relative}.skill-lane h3{font-size:10px;margin-bottom:4px}.skill-lane p{font-size:8px;color:#755b5e}.program-intro{color:#755b5e;font-size:9px;margin-bottom:20px}.programs{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:15px 22px;margin-bottom:28px}.program{min-width:0;position:relative;padding-left:14px;border-left:2px solid #782d46;min-height:65px}.program .issuer{font-size:8px;color:#782d46;letter-spacing:.5px}.program h3{overflow-wrap:anywhere;font-size:11px;line-height:1.45;margin:4px 0 6px}.program p{font-size:8px;color:#755b5e}.program .verify{font-size:7px;letter-spacing:1px;color:#782d46;display:inline-block;margin-top:5px}.project-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}.project-summary article{border-top:2px solid #782d46;padding-top:12px}.project-summary .project-id{font-size:9px;color:#782d46;margin-bottom:9px}.project-summary h3{font-size:11px;margin-bottom:7px}.project-summary p{font-size:9px;line-height:1.75;color:#755b5e}.closing{margin-top:18px;padding:15px;background:#e9dccb;border-left:3px solid #c49a82;color:#755b5e;font-size:9px}.premium .page:first-child footer{color:#755b5e}`;
const premiumCSS = `${premiumCSSBase}.page{background:#f7f0e6}.premium-header{background:#581c32;height:75mm}.premium-header h1{font-size:43px;line-height:.98;letter-spacing:-1.8px}.premium-header .eyebrow{color:#e9dccb}.portrait{right:0;bottom:-10mm;width:90mm;height:90mm}.portrait-orbit{border:0;border-radius:0;background:linear-gradient(100deg,#c49a8222,#c49a8277);width:25mm;height:130mm;right:26mm;top:-25mm;transform:rotate(24deg)}.portrait-orbit.two{width:1px;height:130mm;right:12mm;top:-25mm;background:#c49a82;transform:rotate(24deg)}.header-dot{display:none}.sidebar{background:#e9dccb;color:#581c32;padding-top:10mm}.sidebar h2{color:#581c32;border-color:#c49a82}.sidebar h3{color:#782d46}.sidebar p,.sidebar .study-note{color:#583b43}.sidebar-section{margin-top:21px}.premium-grid{min-height:204mm}.main-column{padding-top:10mm}.main-column .summary{font-size:10.5px}.main-column h2{letter-spacing:.6px}.education{border-left:1px solid #c49a82;padding-left:14px}.education h2{margin-left:-14px;background:#f7f0e6}.education article{position:relative}.education article:before{content:'';position:absolute;left:-17px;top:5px;width:5px;height:5px;border-radius:50%;background:#782d46}.continuation{background:#581c32;height:34mm}.continuation h1{font-size:26px}.page-two-content{padding-top:7mm}.section-heading{margin-bottom:12px}.skill-lanes{gap:12px;margin-bottom:20px}.skill-lane{border:0;border-top:2px solid #782d46;background:#e9dccb;padding:12px}.lane-icons img{border-radius:0;background:#f7f0e6}.program-intro{margin-bottom:15px}.programs{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px 18px;margin-bottom:24px}.program{min-height:100px;padding-left:11px;border-color:#782d46}.program h3{font-size:10px;line-height:1.45;margin:5px 0}.program .issuer{font-size:7px}.program p{font-size:7px;line-height:1.6}.program .verify{font-size:6px}.project-summary p{font-size:9px}.closing{font-size:8px;line-height:1.7}.section-heading h2{font-size:10px}.folio{font-family:Georgia,serif;font-style:italic}footer{color:#755b5e}`;
const atsCSS = `${fontCSS}.page{padding:15mm 17mm}.ats-header{padding-bottom:15px;border-bottom:1px solid #69738a}.ats-header h1{font-size:27px;letter-spacing:-.5px}.ats-header .job-title{font-size:13px;margin:5px 0 10px}.ats-header .contact{font-size:10px;display:block;line-height:1.8}.ats-header .contact a,.ats-header .contact span{display:inline}.ats-header .contact>*:after{content:' | '}.summary{font-size:12px;line-height:1.65;margin:17px 0}h2{font-size:11px;margin-top:20px;margin-bottom:11px;border-bottom:1px solid #b5bdce;padding-bottom:5px}h2>span{display:none}.role{margin-bottom:17px}.role-top{display:block}.role-top h3{font-size:12px}.role-top h3 br{display:none}.role-top>span{display:block;font-size:9px;margin:3px 0}.org{margin:3px 0}li{font-size:12px;line-height:1.6;margin:5px 0}.ats-skills p{font-size:11px;margin:5px 0}.education{display:block}.education article{margin-bottom:12px}.education article p{font-size:10px}.ats-continuation{border-bottom:1px solid #69738a;padding-bottom:15px;margin-bottom:22px}.ats-continuation h1{font-size:21px}.ats-continuation p{font-size:10px;margin-top:5px}.project-summary article{margin-bottom:17px}.project-summary h3{font-size:12px}.project-summary p{font-size:10px;margin-top:5px}.programs .program{margin-bottom:17px}.program h3{font-size:11px}.program p{font-size:9px;margin-top:3px}.ats-study{font-size:10px;line-height:1.7}.ats h2:first-child{margin-top:0}`;
const atsFinalCSS = `${atsCSS}.ats .programs .program{margin-bottom:11px}.ats .program h3{font-size:10px}.ats .program p{font-size:8px}.ats .project-summary article{margin-bottom:12px}.ats .ats-study{font-size:9px}`;
const sidebarSkills = groups
  .map(([name, items]) => `<h3>${name}</h3><p>${items}</p>`)
  .join("");
const lanes = [
  [
    "Interface",
    ["react", "typescript"],
    "React.js / Next.js",
    "JavaScript, TypeScript, HTML5, CSS3",
  ],
  [
    "Services",
    ["nodedotjs", "nestjs"],
    "Node.js / NestJS",
    "REST APIs, JWT authentication",
  ],
  [
    "Data",
    ["postgresql", "prisma"],
    "PostgreSQL / Prisma",
    "Relational databases, ORM integration",
  ],
]
  .map(
    ([name, marks, title, copy]) =>
      `<div class="skill-lane"><div class="lane-icons">${marks.map((i) => `<img src="${icons[i]}" alt=""/>`).join("")}</div><h3>${name} / ${title}</h3><p>${copy}</p></div>`,
  )
  .join("");
const projectHTML = projects
  .map(
    ([name, description], i) =>
      `<article><p class="project-id">0${i + 1} / SELECTED WORK</p><h3>${name}</h3><p>${description}</p></article>`,
  )
  .join("");
const programHTML = programs
  .map(
    (c) =>
      `<article class="program"><span class="issuer">${esc(c.issuer)}</span><h3><a href="${c.url}">${esc(c.title)}</a></h3><p>${c.type} / ${c.date}</p><a class="verify" href="${c.url}">VERIFY CREDENTIAL</a></article>`,
  )
  .join("");
const premium = `<section class="page"><header class="premium-header"><span class="eyebrow">ALI BHATTI / SOFTWARE DEVELOPMENT</span><h1>MUHAMMAD<br/>ALI EJAZ</h1><p class="job-title">Full Stack Web Developer</p><span class="header-note">CURIOSITY. CODE. CONNECTED SYSTEMS.</span><div class="portrait-orbit"></div><div class="portrait-orbit two"></div><i class="header-dot"></i><img class="portrait" src="${portrait}" alt="Muhammad Ali Ejaz"/></header><div class="premium-grid"><aside class="sidebar"><h2>Let’s connect</h2><div class="contact">${contact}</div><div class="sidebar-section"><h2>Technical skills</h2>${sidebarSkills}</div><div class="sidebar-section"><h2>Completed study</h2><p>C# 12 / .NET 8<br/>ASP.NET Core / Blazor<br/>Svelte 5 / SvelteKit<br/>Express / Supabase<br/>Sanity CMS / Stripe</p><p class="study-note">Course-backed learning, separate from résumé experience. Program details on page 02.</p></div></aside><div class="main-column"><p class="summary">${summary}</p>${experience}<div class="education">${education}</div></div></div>${footer(1, "EXPERIENCE & FOUNDATIONS")}</section><section class="page"><header class="continuation"><div><span class="eyebrow">ALI BHATTI / CONTINUOUS LEARNING</span><h1>Systems built.<br/>Curiosity, continued.</h1></div><span class="folio">02</span></header><div class="page-two-content"><div class="section-heading"><h2><span>03</span> The connected stack</h2><span>APPLIED TECHNOLOGIES / RÉSUMÉ</span></div><div class="skill-lanes">${lanes}</div><div class="section-heading"><h2><span>04</span> Featured credentials</h2><span>OCTOBER 2026 / COURSERA</span></div><p class="program-intro">Three professional certificates, four specializations and two Duke University guided projects. Select a title for verification.</p><div class="programs">${programHTML}</div><div class="section-heading"><h2><span>05</span> Selected projects</h2><span>LOGISTICS / ENTERPRISE / PLAY</span></div><div class="project-summary">${projectHTML}</div><p class="closing">Additional completed coursework: object-oriented programming, web scraping, data structures and algorithms, deployment and DevOps, web application security, and UI/UX accessibility.</p></div>${footer(2, "PROJECTS & CREDENTIALS")}</section>`;
const atsPrograms = programs
  .map(
    (c) =>
      `<article class="program"><h3><a href="${c.url}">${esc(c.title)}</a></h3><p>${esc(c.issuer)} | ${c.type} | ${c.date} | Coursera</p></article>`,
  )
  .join("");
const ats = `<section class="page"><header class="ats-header"><h1>MUHAMMAD ALI EJAZ</h1><p class="job-title">Full Stack Web Developer / Ali Bhatti</p><div class="contact">${contact}</div></header><p class="summary">${summary}</p>${experience.replaceAll("<br/>", " ")}<div class="ats-skills"><h2>Technical skills</h2>${groups.map(([name, items]) => `<p><strong>${name}:</strong> ${items.replaceAll(" · ", ", ")}</p>`).join("")}</div><h2>Education</h2><div class="education">${education.replace(/<h2>.*?<\/h2>/, "")}</div>${footer(1, "EXPERIENCE & EDUCATION")}</section><section class="page"><header class="ats-continuation"><h1>MUHAMMAD ALI EJAZ</h1><p>Full Stack Web Developer | dev._.ali@icloud.com | github.com/Alibhatti514</p></header><h2>Selected projects</h2><div class="project-summary">${projects.map(([n, d]) => `<article><h3>${n}</h3><p>${d}</p></article>`).join("")}</div><h2>Professional certifications, specializations and Duke projects</h2><div class="programs">${atsPrograms}</div><h2>Additional completed study</h2><p class="ats-study">${study}</p><p class="ats-study">Completed coursework is listed separately from technologies used in professional experience.</p>${footer(2, "PROJECTS & CREDENTIALS")}</section>`;
await fs.mkdir("output/pdf", { recursive: true });
await fs.mkdir("docs/burgundy-cream/resume-source", { recursive: true });
await fs.mkdir("public/assets/resume", { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
for (const mode of ["Premium", "ATS"]) {
  const premiumMode = mode === "Premium";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/><title>Muhammad Ali Ejaz - ${mode} Resume</title><style>${premiumMode ? premiumCSS : atsFinalCSS}</style></head><body class="${premiumMode ? "premium" : "ats"}">${premiumMode ? premium : ats}</body></html>`;
  await fs.writeFile(
    `docs/burgundy-cream/resume-source/Resume-${mode}.html`,
    html,
  );
  const p = await b.newPage();
  await p.setContent(html, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  const check = await p.locator(".page").evaluateAll((pages) =>
    pages.map((page) => {
      const footer = page.querySelector("footer");
      const fr = footer.getBoundingClientRect();
      const offenders = [...page.querySelectorAll("h1,h2,h3,p,li,.contact,a")]
        .filter((e) => !footer.contains(e))
        .filter((e) => {
          const r = e.getBoundingClientRect();
          return (
            r.bottom > fr.top - 6 ||
            r.right > page.getBoundingClientRect().right + 1
          );
        })
        .map((e) => e.textContent.slice(0, 60));
      return {
        height: page.clientHeight,
        scrollHeight: page.scrollHeight,
        offenders,
      };
    }),
  );
  if (check.some((c) => c.offenders.length || c.scrollHeight > c.height + 2))
    throw new Error(`${mode}: ${JSON.stringify(check)}`);
  const dest = `output/pdf/Resume-${mode}.pdf`;
  await p.pdf({
    path: dest,
    format: "A4",
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
  });
  await fs.copyFile(dest, `public/assets/resume/Resume-${mode}.pdf`);
  report.push({ mode, pages: check });
  await p.close();
}
await b.close();
await fs.writeFile(
  "docs/burgundy-cream/resume-source/layout-check.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
