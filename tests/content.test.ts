import assert from 'node:assert/strict';
import test from 'node:test';
import { chapters } from '../src/data/chapters.ts';
import { profile, projects } from '../src/data/portfolio.ts';
import { socials } from '../src/data/socials.ts';

test('all thirteen chapters preserve the requested narrative and distinct navigation hashes', () => {
  assert.deepEqual(chapters.map(({ id }) => id), [
    'human', 'code', 'languages', 'frontend', 'backend', 'data', 'workflow',
    'rcs-cargo', 'goldadan', 'bhabhi-thulla', 'experience', 'education', 'connect',
  ]);
  assert.equal(new Set(chapters.map(({ id }) => id)).size, chapters.length);
  for (const chapter of chapters) {
    assert.match(chapter.id, /^[a-z]+(?:-[a-z]+)*$/);
    for (const field of ['title', 'description', 'detail', 'eyebrow', 'shortLabel'] as const) {
      assert.ok(chapter[field].trim().length > 0, `${chapter.id}.${field} is readable`);
    }
  }
});

test('social profiles use the exact user-supplied destinations in the requested visual order', () => {
  // Independent literal expectations deliberately do not derive from the production config.
  assert.deepEqual(socials.map(({ label, href }) => [label, href]), [
    ['LinkedIn', 'https://www.linkedin.com/in/muhammad-ali-ejaz-bhatti-629676442/'],
    ['Freelancer', 'https://www.freelancer.com/u/Devalibhatti?sb=t@Devalibhatti%27s'],
    ['GitHub', 'https://github.com/Alibhatti514'],
    ['Fiverr', 'https://www.fiverr.com/dev_alibhatti?public_mode=true'],
    ['Upwork', 'https://www.upwork.com/freelancers/~01d8521e683ca03553?companyReference=1966580391923811613&mp_source=share'],
  ]);
  assert.deepEqual(socials.map(({ icon }) => icon), [
    '/assets/brands/linkedin.svg', '/assets/brands/freelancer.svg',
    '/assets/brands/github.svg', '/assets/brands/fiverr.svg', '/assets/brands/upwork.svg',
  ]);
});

test('all confirmed technologies are available as readable chapter content', () => {
  const required: Record<string, string[]> = {
    languages: ['JavaScript (ES6+)', 'TypeScript', 'Python'],
    frontend: ['HTML5', 'CSS3', 'JavaScript (ES6+)', 'TypeScript', 'React.js', 'Next.js'],
    backend: ['Node.js', 'NestJS', 'REST APIs', 'JWT Authentication'],
    data: ['PostgreSQL', 'Prisma ORM'],
    workflow: ['Git', 'GitHub', 'Postman'],
  };
  for (const [id, technologies] of Object.entries(required)) {
    const chapter = chapters.find((item) => item.id === id);
    assert.ok(chapter, `chapter ${id} exists`);
    for (const technology of technologies) {
      assert.ok(chapter.tags.includes(technology), `${id} exposes ${technology} as readable content`);
    }
  }
});

test('career and education retain the exact supplied institutions, roles, and dates', () => {
  const experience = chapters.find(({ id }) => id === 'experience')!;
  assert.match(experience.description, /Freelance Full Stack Web Developer/);
  assert.match(experience.description, /September 2025–June 2026/);
  assert.deepEqual(experience.tags, ['Upwork · Sep 2025–Jun 2026', 'Fiverr · Sep 2025–Jun 2026']);
  for (const fact of ['React', 'Next.js', 'responsive interfaces', 'Node.js', 'NestJS', 'REST APIs', 'JWT authentication', 'PostgreSQL', 'Prisma', 'client collaboration', 'maintainable code']) {
    assert.ok(experience.detail.includes(fact), `experience includes ${fact}`);
  }
  const education = chapters.find(({ id }) => id === 'education')!;
  assert.match(education.description, /Punjab University — Bachelor in Computer Science, 2021–2025/);
  assert.match(education.detail, /Hawk College — Intermediate in Computer Science \(ICS\), 2018–2020/);
});

test('contact details and resume reference exactly match the supplied information', () => {
  assert.deepEqual(profile, {
    name: 'MUHAMMAD ALI EJAZ',
    displayName: 'ALI BHATTI',
    title: 'FULL STACK WEB DEVELOPER',
    email: 'dev._.ali@icloud.com',
    phone: '+92 317 2003786',
    phoneHref: 'tel:+923172003786',
    location: 'Khanewal, Pakistan',
    resume: '/assets/Resume_Ali_ejaz.pdf',
  });
});

test('projects use original logo paths and explicitly unavailable destinations', () => {
  assert.deepEqual(projects.map(({ name, logo, url }) => [name, logo, url]), [
    ['RCS CARGO', '/assets/RCS-Logo.png', null],
    ['GOLDADAN', '/assets/GOLDADAN_LOGO.jpg', null],
    ['BHABHI THULLA', '/assets/BHABHI THULLA.png', null],
  ]);
  assert.match(projects.find(({ id }) => id === 'goldadan')!.description, /company website for security, software, hardware, and enterprise technology/);
});
