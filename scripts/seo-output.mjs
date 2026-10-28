import fs from "node:fs/promises";
// Configure an actual deployment origin; never invent a public portfolio URL.
if (process.env.SITE_URL) {
  const url = new URL(process.env.SITE_URL);
  if (!["https:", "http:"].includes(url.protocol))
    throw new Error("SITE_URL must be http(s)");
  const origin = url.origin;
  let html = await fs.readFile("dist/index.html", "utf8");
  html = html
    .replace(
      "</head>",
      `<link rel="canonical" href="${origin}/" /><meta property="og:url" content="${origin}/" /></head>`,
    )
    .replaceAll(
      'content="/social-card.png"',
      `content="${origin}/social-card.png"`,
    );
  await fs.writeFile("dist/index.html", html);
  await fs.writeFile(
    "dist/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url></urlset>`,
  );
  await fs.appendFile("dist/robots.txt", `\nSitemap: ${origin}/sitemap.xml\n`);
  console.log(
    "Canonical, absolute sharing image and sitemap generated for configured SITE_URL.",
  );
} else
  console.log(
    "SITE_URL not configured: canonical and domain-specific sitemap intentionally omitted.",
  );
