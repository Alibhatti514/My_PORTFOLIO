export interface Chapter {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  tags: string[];
  shortLabel: string;
}

/** The editorial sequence also defines the stable, shareable chapter hashes. */
export const chapters: Chapter[] = [
  {
    id: 'human',
    eyebrow: 'THE PERSON BEHIND THE PIXELS',
    title: 'The internet,\nbuilt by me.',
    description: 'I’m Ali Bhatti. I turn ideas into interfaces, systems, and experiences people can use.',
    detail: 'Full stack web developer · Khanewal, Pakistan',
    tags: ['Human first.', 'Built with intention.'],
    shortLabel: 'The human',
  },
  {
    id: 'code',
    eyebrow: 'EVERY EXPERIENCE STARTS SOMEWHERE',
    title: 'A first line.\nA new world.',
    description: 'Before the interface. Before the application. An idea takes its first shape in code.',
    detail: 'Small, deliberate decisions become the foundations of a complete digital experience.',
    tags: ['const idea = { human: true };', 'build(idea);'],
    shortLabel: 'First line',
  },
  {
    id: 'languages',
    eyebrow: 'THE LANGUAGE OF POSSIBILITY',
    title: 'Ideas need\na language.',
    description: 'JavaScript brings behavior. TypeScript brings structure. Python opens another way to solve the problem.',
    detail: 'Three languages. A shared purpose: making an idea work.',
    tags: ['JavaScript (ES6+)', 'TypeScript', 'Python'],
    shortLabel: 'Languages',
  },
  {
    id: 'frontend',
    eyebrow: 'FRONTEND ENGINEERING',
    title: 'A world you\ncan touch.',
    description: 'Structure becomes a surface. Style gives it character. Components turn the pieces into a responsive interface.',
    detail: 'HTML5 and CSS3 establish the foundation. JavaScript and TypeScript add behavior and typed logic. React.js and Next.js bring the application together.',
    tags: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React.js', 'Next.js'],
    shortLabel: 'The interface',
  },
  {
    id: 'backend',
    eyebrow: 'BACKEND ENGINEERING',
    title: 'Behind the surface,\na system.',
    description: 'Every interaction begins a journey: route the request, authenticate it, run the logic, return a response.',
    detail: 'Node.js and NestJS services connect the interface to business logic through REST APIs and JWT authentication.',
    tags: ['Node.js', 'NestJS', 'REST APIs', 'JWT Authentication'],
    shortLabel: 'The system',
  },
  {
    id: 'data',
    eyebrow: 'THE DATA ARCHITECTURE',
    title: 'A place for\nevery connection.',
    description: 'Useful applications remember. Structured records and deliberate relationships give their data a lasting home.',
    detail: 'PostgreSQL stores relational data. Prisma ORM connects application queries to the database and persistent state.',
    tags: ['PostgreSQL', 'Prisma ORM', 'Relationships', 'Persistent state'],
    shortLabel: 'The data',
  },
  {
    id: 'workflow',
    eyebrow: 'FROM AN IDEA TO A WORKING APPLICATION',
    title: 'Build. Refine.\nMove forward.',
    description: 'Version each decision. Collaborate around the code. Test how the system responds.',
    detail: 'Git tracks change, GitHub organizes repositories and collaboration, and Postman supports API development and testing.',
    tags: ['Git', 'GitHub', 'Postman'],
    shortLabel: 'The workflow',
  },
  {
    id: 'rcs-cargo',
    eyebrow: 'SELECTED WORK / 01',
    title: 'Everything,\nin motion.',
    description: 'RCS CARGO — a web project for a connected logistics world.',
    detail: 'An architectural study of routes, movement, and connection, built around the project’s original identity.',
    tags: ['RCS CARGO', 'Logistics', 'Web application'],
    shortLabel: 'RCS Cargo',
  },
  {
    id: 'goldadan',
    eyebrow: 'SELECTED WORK / 02',
    title: 'Technology,\nwith purpose.',
    description: 'GOLDADAN — a company website for security, software, hardware, and enterprise technology.',
    detail: 'A digital presence shaped around the company’s services and authentic brand identity.',
    tags: ['GOLDADAN', 'Company website', 'Technology services'],
    shortLabel: 'Goldadan',
  },
  {
    id: 'bhabhi-thulla',
    eyebrow: 'SELECTED WORK / 03',
    title: 'A little logic.\nA little play.',
    description: 'BHABHI THULLA — a card-game project with a world of its own.',
    detail: 'A familiar game inspires a dimensional deck, deliberate motion, and a playful change of pace.',
    tags: ['BHABHI THULLA', 'Card game', 'Interactive experience'],
    shortLabel: 'Bhabhi Thulla',
  },
  {
    id: 'experience',
    eyebrow: 'PROFESSIONAL EXPERIENCE',
    title: 'Built with people.\nBuilt to work.',
    description: 'Freelance Full Stack Web Developer on Upwork and Fiverr — September 2025–June 2026 on both platforms.',
    detail: 'React and Next.js applications, responsive interfaces, Node.js and NestJS services, REST APIs, JWT authentication, PostgreSQL and Prisma. Close client collaboration and maintainable code throughout.',
    tags: ['Upwork · Sep 2025–Jun 2026', 'Fiverr · Sep 2025–Jun 2026'],
    shortLabel: 'Experience',
  },
  {
    id: 'education',
    eyebrow: 'THE FOUNDATIONS',
    title: 'Curiosity,\nwith a foundation.',
    description: 'Punjab University — Bachelor in Computer Science, 2021–2025.',
    detail: 'Hawk College — Intermediate in Computer Science (ICS), 2018–2020.',
    tags: ['Punjab University · 2021–2025', 'Hawk College · 2018–2020'],
    shortLabel: 'Education',
  },
  {
    id: 'connect',
    eyebrow: 'THE NEXT CHAPTER IS OURS',
    title: 'Let’s build\nwhat’s next.',
    description: 'Have an idea that deserves to exist? Let’s turn it into something people can use.',
    detail: 'Connect with Ali Bhatti — full stack web developer in Khanewal, Pakistan.',
    tags: [],
    shortLabel: 'Let’s connect',
  },
];
