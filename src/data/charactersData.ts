export interface CharacterItem {
  id: string;
  name: string;
  subtitle: string;
  whoAreTheyTitle: string;
  whoAreThey: string;
  images: string[];
  backstory: { title: string; description: string }[];
  personalityTraits: { title: string; description: string }[];
  roleHeading: string;
  roleDescription: string;
  members?: { name: string; description: string }[];
}

export const CHARACTERS_DATA: CharacterItem[] = [
  {
    id: 'jason-duval',
    name: 'Jason Duval',
    subtitle: 'Small-Time Criminal & Tactical Muscle',
    whoAreTheyTitle: 'Who He Is?',
    whoAreThey: 'Jason Duval is a quiet, grounded small-time criminal who fundamentally wants an easy life, but bad habits drag him back into trouble.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_02.1486~7_v40cn..jpg',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_01.07m377xeb6jhq.jpg',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_06.086o72llg6~1p.jpg',
    ],
    backstory: [
      { title: 'Rough Upbringing', description: 'Grew up surrounded by crooks and hustlers.' },
    ],
    personalityTraits: [
      { title: 'Calm & Methodical', description: 'Thinks before he shoots and uses smart situational awareness.' },
    ],
    roleHeading: 'The Turning Point',
    roleDescription: 'Pulls off high-stakes heists alongside Lucia.',
  },
  {
    id: 'lucia-caminos',
    name: 'Lucia Caminos',
    subtitle: 'Ambitious & Street-Smart Robber',
    whoAreTheyTitle: 'Who Is She?',
    whoAreThey: 'Lucia Caminos is a fierce, ambitious criminal determined to build a better life.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_01.0a7yqvewctkfp.jpg',
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_02.16n.5umvlu_48.jpg',
    ],
    backstory: [
      { title: 'Street Roots', description: 'Raised around Vice City, learning to survive early.' },
    ],
    personalityTraits: [
      { title: 'Bold & Direct', description: 'Confident, aggressive when provoked.' },
    ],
    roleHeading: 'The Turning Point',
    roleDescription: 'Partners with Jason Duval across Leonida heists.',
  },
];
