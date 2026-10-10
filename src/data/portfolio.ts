export const profile = {
  name: 'MUHAMMAD ALI EJAZ',
  displayName: 'ALI BHATTI',
  title: 'FULL STACK WEB DEVELOPER',
  email: 'dev._.ali@icloud.com',
  phone: '+92 317 2003786',
  phoneHref: 'tel:+923172003786',
  location: 'Khanewal, Pakistan',
  resume: '/assets/Resume_Ali_ejaz.pdf',
} as const;

export interface PortfolioProject {
  id: string;
  name: string;
  logo: string;
  description: string;
  url: string | null;
}

/** No public project destinations have been supplied or verified. */
export const projects: PortfolioProject[] = [
  {
    id: 'rcs-cargo',
    name: 'RCS CARGO',
    logo: '/assets/RCS-Logo.png',
    description: 'A logistics web project, presented through connected routes and its authentic identity.',
    url: null,
  },
  {
    id: 'goldadan',
    name: 'GOLDADAN',
    logo: '/assets/GOLDADAN_LOGO.jpg',
    description: 'A company website for security, software, hardware, and enterprise technology services.',
    url: null,
  },
  {
    id: 'bhabhi-thulla',
    name: 'BHABHI THULLA',
    logo: '/assets/BHABHI THULLA.png',
    description: 'A card-game project brought into a playful, dimensional environment.',
    url: null,
  },
];
