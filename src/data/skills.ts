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
    name: "HTML5 / CSS3",
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
    name: "Git / GitHub",
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
    name: "C# / .NET 8",
    category: "Completed study",
    study: true,
    evidence:
      "Packt C# 12 and .NET 8 specialization; Microsoft backend program. Includes ASP.NET Core and Blazor.",
  },
  {
    name: "Svelte / SvelteKit",
    category: "Completed study",
    study: true,
    evidence:
      "Packt Svelte 5 & SvelteKit specialization; related Supabase, Sanity CMS and Stripe integration courses.",
  },
  {
    name: "Express",
    category: "Completed study",
    study: true,
    evidence:
      "Packt — Master Express Framework: Beginner to Advanced with Node.js course.",
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
