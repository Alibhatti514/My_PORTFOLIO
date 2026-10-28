import { chromium } from "playwright";
import fs from "node:fs/promises";
const root = new URL("../", import.meta.url);
const credentials = JSON.parse(
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
const font = await fs.readFile(
  new URL(
    "node_modules/@fontsource/manrope/files/manrope-latin-400-normal.woff2",
    root,
  ),
);
const headingFont = await fs.readFile(
  new URL(
    "node_modules/@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2",
    root,
  ),
);
const summary =
  "Full Stack Web Developer building responsive React and Next.js interfaces, Node.js and NestJS services, and PostgreSQL databases with Prisma ORM. Experienced with REST APIs, JWT authentication, client collaboration, and maintainable code.";
const contact = `Khanewal, Pakistan · <a href="tel:+923172003786">+92 317 2003786</a> · <a href="mailto:dev._.ali@icloud.com">dev._.ali@icloud.com</a><br/><a href="https://github.com/Alibhatti514">github.com/Alibhatti514</a> · <a href="https://www.linkedin.com/in/muhammad-ali-ejaz-bhatti-629676442/">LinkedIn: Muhammad Ali Ejaz Bhatti</a>`;
const experience = `<h2>Professional Experience</h2><article><div class="role"><h3>Freelance Full Stack Web Developer</h3><span>Sep 2025 – Jun 2026</span></div><p class="org">Upwork · Lahore, Pakistan</p><ul><li>Developed responsive web applications with React.js, Next.js, HTML5, CSS3, JavaScript, and TypeScript.</li><li>Built Node.js and NestJS REST APIs and integrated PostgreSQL databases with Prisma ORM.</li><li>Implemented JWT authentication and role-based access control; collaborated with clients on maintainable solutions.</li></ul></article><article><div class="role"><h3>Freelance Full Stack Web Developer</h3><span>Sep 2025 – Jun 2026</span></div><p class="org">Fiverr · Lahore, Pakistan</p><ul><li>Built custom full stack applications and responsive interfaces around client requirements.</li><li>Developed backend APIs, integrated third-party services, and managed business logic with NestJS and Node.js.</li><li>Managed PostgreSQL data with Prisma ORM, incorporated feedback, and maintained client communication and project documentation.</li></ul></article>`;
const skills = `<h2>Technical Skills</h2><p><strong>Languages:</strong> JavaScript (ES6+), TypeScript, Python</p><p><strong>Frontend:</strong> HTML5, CSS3, React.js, Next.js</p><p><strong>Backend:</strong> Node.js, NestJS, REST APIs, JWT Authentication</p><p><strong>Data & tools:</strong> PostgreSQL, Prisma ORM, Git, GitHub, Postman</p><p><strong>Completed study:</strong> C# 12, .NET 8, ASP.NET Core, Blazor, Svelte 5, SvelteKit</p>`;
const education = `<h2>Education</h2><article><div class="role"><h3>Bachelor in Computer Science</h3><span>2021 – 2025</span></div><p>Punjab University · Lahore, Pakistan</p></article><article><div class="role"><h3>Intermediate in Computer Science (ICS)</h3><span>2018 – 2020</span></div><p>Hawk College · Khanewal, Pakistan</p></article>`;
const projects = `<h2>Selected Projects</h2><article><h3>RCS CARGO</h3><p>Logistics web project with an authentic brand identity and a focus on connected routes and movement.</p></article><article><h3>GOLDADAN</h3><p>Company website presenting security, software, hardware, and enterprise technology services.</p></article><article><h3>BHABHI THULLA</h3><p>Card-game project with a playful visual identity and interactive presentation.</p></article>`;
const certifications = `<h2>Professional Certifications</h2><p class="section-intro">Completed programs · Coursera · October 2026</p>${credentials
  .filter((c) => c.featured)
  .sort((a, b) => a.type.localeCompare(b.type))
  .map(
    (c) =>
      `<article class="cert"><h3><a href="${c.url}">${esc(c.title)}</a></h3><p>${esc(c.issuer)} · ${c.type} · ${c.date}</p></article>`,
  )
  .join("")}`;
await fs.mkdir(new URL("public/assets/resume/", root), { recursive: true });
await fs.mkdir(new URL("docs/redesign/resume-source/", root), {
  recursive: true,
});
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const mode of ["Premium", "ATS"]) {
  const premium = mode === "Premium";
  const css = `@font-face{font-family:Body;src:url(data:font/woff2;base64,${font.toString("base64")})}@font-face{font-family:Heading;src:url(data:font/woff2;base64,${headingFont.toString("base64")})}@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.5 ${premium ? "Body" : "Arial"},sans-serif;color:#20291e}a{color:inherit;text-decoration:none}p{margin:5px 0}h1,h2,h3{margin:0;font-family:${premium ? "Heading" : "Arial"},sans-serif}h1{font-size:30px;line-height:1.15;letter-spacing:-1px;font-weight:500}h2{font-size:12px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #bdc9b3;padding-bottom:8px;margin:23px 0 13px;color:#3b5430}h3{font-size:12.5px;font-weight:600}.page{width:210mm;height:297mm;padding:17mm 18mm;position:relative;break-after:page;overflow:hidden;background:${premium ? "#fafbf7" : "white"}}.page:last-child{break-after:auto}header{padding-bottom:18px;border-bottom:2px solid #4e6537}.alias{font-size:9px;letter-spacing:2px;color:#597044;margin-bottom:12px}.title{font-size:14px;margin:8px 0 13px}.contact{font-size:10px;line-height:1.65}.summary{font-size:12px;line-height:1.65;margin-top:20px;max-width:590px}article{margin-bottom:17px;break-inside:avoid}.role{display:flex;justify-content:space-between;gap:15px;align-items:baseline}.role>span{white-space:nowrap;font-size:9px;color:#5a6652}.org{color:#4e6537;font-size:10px}ul{margin:8px 0 0;padding-left:15px}li{padding-left:3px;margin:5px 0}.footer{position:absolute;bottom:11mm;left:18mm;right:18mm;display:flex;justify-content:space-between;border-top:1px solid #ccd4c4;padding-top:9px;font-size:8px;color:#657359}.continuation{display:flex;justify-content:space-between;align-items:end;border-bottom:2px solid #4e6537;padding-bottom:16px;margin-bottom:23px}.continuation h1{font-size:21px}.continuation>span{font-size:9px}.section-intro{font-size:9px;color:#64715b;margin-bottom:15px}.cert{padding-left:${premium ? "13px" : "0"};border-left:${premium ? "2px solid #b5cc90" : "0"};margin-bottom:16px}.cert h3{font-size:12.5px}.cert p{font-size:10px;color:#5d6856}.two-col{display:grid;grid-template-columns:${premium ? "1.18fr 1fr" : "1fr"};gap:${premium ? "28px" : "0"}}.two-col h2{margin-top:20px}.page-marker{color:#73865d;font-size:35px;font-family:Heading;line-height:1}${!premium ? ".role{display:block}.role>span{display:block;margin:2px 0}.page{padding:15mm 18mm}h2{margin-top:18px}article{margin-bottom:10px}li{margin:3px 0}.summary{margin-top:15px}.two-col p{margin:3px 0}.two-col article{margin-bottom:9px}.two-col h2{margin-top:12px}.two-col p{font-size:11px}.two-col h3{font-size:11px}.cert{margin-bottom:17px}.footer{bottom:10mm}" : ""}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Muhammad Ali Ejaz — ${mode} Résumé</title><style>${css}</style></head><body><section class="page"><header><div class="alias">ALI BHATTI / SOFTWARE DEVELOPMENT</div><h1>MUHAMMAD ALI EJAZ</h1><p class="title">Full Stack Web Developer</p><div class="contact">${contact}</div></header><p class="summary">${summary}</p>${experience}<div class="two-col"><div>${skills}</div><div>${education}</div></div><footer class="footer"><span>MUHAMMAD ALI EJAZ · ALI BHATTI</span><span>EXPERIENCE & FOUNDATIONS / 01</span></footer></section><section class="page"><header class="continuation"><div><div class="alias">ALI BHATTI / SOFTWARE DEVELOPMENT</div><h1>MUHAMMAD ALI EJAZ</h1></div><span class="page-marker">02</span></header>${projects}${certifications}<footer class="footer"><span><a href="mailto:dev._.ali@icloud.com">dev._.ali@icloud.com</a></span><span>PROJECTS & CREDENTIALS / 02</span></footer></section></body></html>`;
  await fs.writeFile(
    new URL(`docs/redesign/resume-source/Resume-${mode}.html`, root),
    html,
  );
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page
    .locator(".page")
    .evaluateAll((es) =>
      es.map((e) => ({
        scroll: e.scrollHeight,
        client: e.clientHeight,
        footer: e.querySelector("footer").getBoundingClientRect().top,
        last: e
          .querySelector("footer")
          .previousElementSibling.getBoundingClientRect().bottom,
      })),
    );
  if (overflow.some((x) => x.scroll > x.client + 2 || x.last > x.footer - 8))
    throw new Error(`Resume overflow ${mode}: ${JSON.stringify(overflow)}`);
  await page.pdf({
    path: new URL(`public/assets/resume/Resume-${mode}.pdf`, root).pathname,
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    tagged: true,
  });
  console.log(mode, overflow);
  await page.close();
}
await browser.close();
