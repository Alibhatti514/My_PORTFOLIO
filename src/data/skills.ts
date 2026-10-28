export interface Skill {
  name: string;
  icon?: string;
  category: string;
  evidence: string;
  study?: boolean;
}
export const skills: Skill[] = [
  {
    name: "JavaScript",
    icon: "javascript",
    category: "Languages",
    evidence:
      "JavaScript (ES6+) — original résumé; responsive full stack applications.",
  },
  {
    name: "TypeScript",
    icon: "typescript",
    category: "Languages",
    evidence:
      "Original résumé — typed React, Next.js, Node.js and NestJS applications.",
  },
  {
    name: "Python",
    icon: "python",
    category: "Languages",
    evidence:
      "Original résumé; Duke University guided projects in OOP and web scraping.",
  },
  {
    name: "React.js",
    icon: "react",
    category: "Frontend",
    evidence:
      "Original résumé — responsive interfaces in both freelance roles.",
  },
  {
    name: "Next.js",
    icon: "nextdotjs",
    category: "Frontend",
    evidence:
      "Original résumé — full stack web applications and responsive interfaces.",
  },
  {
    name: "HTML5",
    icon: "html5",
    category: "Frontend",
    evidence:
      "Original résumé; Meta, Microsoft and University of London coursework.",
  },
  {
    name: "Node.js",
    icon: "nodedotjs",
    category: "Backend",
    evidence:
      "Original résumé; Mastering Node.js Web Development specialization, Packt.",
  },
  {
    name: "NestJS",
    icon: "nestjs",
    category: "Backend",
    evidence:
      "Original résumé — REST APIs, business logic and third-party services.",
  },
  {
    name: "REST / JWT",
    category: "Backend",
    evidence:
      "Original résumé — REST APIs, JWT authentication and role-based access control.",
  },
  {
    name: "PostgreSQL",
    icon: "postgresql",
    category: "Data",
    evidence:
      "Original résumé — relational data management in both freelance roles.",
  },
  {
    name: "Prisma ORM",
    icon: "prisma",
    category: "Data",
    evidence: "Original résumé — PostgreSQL integration and efficient queries.",
  },
  {
    name: "Git",
    icon: "git",
    category: "Tools",
    evidence: "Original résumé — development tools and version control.",
  },
  {
    name: "Postman",
    icon: "postman",
    category: "Tools",
    evidence: "Original résumé — API development tools.",
  },
  {
    name: "C# 12",
    icon: "csharp",
    category: "Completed study",
    study: true,
    evidence:
      "Packt C# 12 and .NET 8 specialization; Microsoft backend program. Includes ASP.NET Core and Blazor.",
  },
  {
    name: "Svelte 5",
    icon: "svelte",
    category: "Completed study",
    study: true,
    evidence:
      "Packt Svelte 5 & SvelteKit specialization; related Supabase, Sanity CMS and Stripe integration courses.",
  },
  {
    name: "Express",
    icon: "express",
    category: "Completed study",
    study: true,
    evidence:
      "Packt — Master Express Framework: Beginner to Advanced with Node.js course.",
  },
  {
    name: "CSS3",
    icon: "css3",
    category: "Frontend",
    evidence:
      "Original r\u00e9sum\u00e9 \u2014 responsive interfaces and accessible layouts.",
  },
  {
    name: "GitHub",
    icon: "github",
    category: "Tools",
    evidence:
      "Original r\u00e9sum\u00e9 \u2014 version control and development workflow.",
  },
  {
    name: ".NET 8",
    icon: "dotnet",
    category: "Completed study",
    evidence:
      "Packt C# 12 and .NET 8 specialization; Microsoft backend program.",
    study: true,
  },
  {
    name: "ASP.NET Core",
    icon: "dotnet",
    category: "Completed study",
    evidence: "C# 12 and .NET 8 specialization; web development and APIs.",
    study: true,
  },
  {
    name: "Blazor",
    icon: "blazor",
    category: "Completed study",
    evidence: "Microsoft \u2014 Blazor for Front-End Development.",
    study: true,
  },
  {
    name: "SvelteKit",
    icon: "sveltekit",
    category: "Completed study",
    evidence: "Packt Svelte 5 & SvelteKit specialization.",
    study: true,
  },
  {
    name: "Supabase",
    icon: "supabase",
    category: "Completed study",
    evidence:
      "Packt \u2014 Full-Stack Web Development with SvelteKit & Supabase.",
    study: true,
  },
  {
    name: "Sanity CMS",
    icon: "sanity",
    category: "Completed study",
    evidence:
      "Packt \u2014 Build a Developer Portfolio with SvelteKit & Sanity CMS.",
    study: true,
  },
  {
    name: "Stripe integration",
    icon: "stripe",
    category: "Completed study",
    evidence:
      "Packt \u2014 Build a Product Landing Page with Stripe Integration.",
    study: true,
  },
];
export const additionalStudy = [
  "ASP.NET Core",
  "Blazor",
  "Supabase",
  "Sanity CMS",
  "Stripe integration",
  "Web scraping",
  "Object-oriented programming",
  "Data structures and algorithms",
  "Deployment and DevOps",
  "Web application security",
  "UI/UX and accessibility",
];
