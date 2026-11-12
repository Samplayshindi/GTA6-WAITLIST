export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'jason-lucia' | 'characters' | 'vice-city' | 'leonida';
  tag: string;
}

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'All Media' },
  { id: 'jason-lucia', label: 'Jason & Lucia' },
  { id: 'characters', label: 'Characters' },
  { id: 'vice-city', label: 'Vice City' },
  { id: 'leonida', label: 'Leonida & Locations' },
] as const;

export const GALLERY_IMAGES: GalleryImage[] = [
  // --- JASON & LUCIA ---
  {
    id: 'jl-rooftop',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_Lucia_Rooftop_landscape.0c6p5do~-8~7..jpg',
    title: 'Jason & Lucia - Rooftop Overlook',
    category: 'jason-lucia',
    tag: 'Official Artwork',
  },
  {
    id: 'jl-14',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_14.10e7v.06pcm_t.jpg',
    title: 'Jason & Lucia - Vice City Night',
    category: 'jason-lucia',
    tag: 'Official Artwork',
  },
  {
    id: 'jl-20',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_20.0cd~.c7jr~5g9.jpg',
    title: 'Jason & Lucia - Getaway',
    category: 'jason-lucia',
    tag: 'Official Artwork',
  },
  {
    id: 'jl-15',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_15.0m-_zb~mcy2zr.jpg',
    title: 'Jason & Lucia - Sunset Overlook',
    category: 'jason-lucia',
    tag: 'Hero Artwork',
  },
  {
    id: 'jl-16',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_16.05-d133mx68ku.jpg',
    title: 'Jason & Lucia - Neon Streets',
    category: 'jason-lucia',
    tag: 'Official Artwork',
  },
  {
    id: 'jl-17',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_17.117_b11r13mg5.jpg',
    title: 'Jason & Lucia - Trust Key Art',
    category: 'jason-lucia',
    tag: 'Key Artwork',
  },
  {
    id: 'jl-motel',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Motel_landscape.08edvuwtm-20v.jpg',
    title: 'Jason & Lucia - Ocean View Motel',
    category: 'jason-lucia',
    tag: 'Location Art',
  },
  {
    id: 'jl-01-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_01_landscape.12x2gvspcm_3m.jpg',
    title: 'Jason & Lucia - Vice City Boulevard',
    category: 'jason-lucia',
    tag: 'Key Artwork',
  },
  {
    id: 'jl-02-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_02_landscape.0cosv-uzbpt91.jpg',
    title: 'Jason & Lucia - Convertible Ride',
    category: 'jason-lucia',
    tag: 'Key Artwork',
  },
  {
    id: 'jl-beach-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Beach_landscape.0419q._86ukpt.jpg',
    title: 'Jason & Lucia - Washington Beach',
    category: 'jason-lucia',
    tag: 'Location Art',
  },
  {
    id: 'jl-robbery-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_and_Lucia_Robbery_landscape.09c8a~do21h4p.jpg',
    title: 'Jason & Lucia - Store Heist',
    category: 'jason-lucia',
    tag: 'Action Artwork',
  },
  {
    id: 'jl-lockload',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Jason_Lucia_Lock_And_Load_landscape.0l9s5w7ih9p~3.jpg',
    title: 'Jason & Lucia - Lock & Load',
    category: 'jason-lucia',
    tag: 'Action Artwork',
  },

  // --- CHARACTERS ---
  {
    id: 'char-boobie-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_landscape.0ldnbn87k-8mq.jpg',
    title: 'Boobie Ike - Vice City Legend',
    category: 'characters',
    tag: 'Character Artwork',
  },
  {
    id: 'char-brian-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_landscape.0a-egj5b8yo1q.jpg',
    title: 'Brian Heder - Vice City Underworld',
    category: 'characters',
    tag: 'Character Artwork',
  },
  {
    id: 'char-raul-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_landscape.11_3hd0fr69~j.jpg',
    title: 'Raul Bautista - Vice Syndicate',
    category: 'characters',
    tag: 'Character Artwork',
  },
  {
    id: 'char-dimez-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_landscape.0637akp_a5a_q.jpg',
    title: 'Real Dimez - Vice City Records',
    category: 'characters',
    tag: 'Character Artwork',
  },
  {
    id: 'char-drequan-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_landscape.0_b7hszyze6cy.jpg',
    title: 'DreQuan Priest - Vice Beats',
    category: 'characters',
    tag: 'Character Artwork',
  },
  {
    id: 'char-cal-ls',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_landscape.17k7bnt3myg.2.jpg',
    title: 'Cal Hampton - Leonida Local',
    category: 'characters',
    tag: 'Character Artwork',
  },

  // --- VICE CITY ---
  {
    id: 'vc-18',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Vice_City_18.001ebutl6h-9w.jpg',
    title: 'Vice City - Downtown Skyline',
    category: 'vice-city',
    tag: 'City Panorama',
  },
  {
    id: 'vc-19',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Vice_City_19.01ow62.xq.64i.jpg',
    title: 'Vice City - Ocean Drive Sunset',
    category: 'vice-city',
    tag: 'Cityscape',
  },
  {
    id: 'vc-20',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Vice_City_20.18c75478u52nf.jpg',
    title: 'Vice City - Port Vice City',
    category: 'vice-city',
    tag: 'Cityscape',
  },
  {
    id: 'vc-21',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Vice_City_21.0m5vh15h178-e.jpg',
    title: 'Vice City - Starfish Island Aerial',
    category: 'vice-city',
    tag: 'Aerial View',
  },

  // --- LEONIDA & LOCATIONS ---
  {
    id: 'grass-07',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Grassrivers_07.0txitddjiq5o1.jpg',
    title: 'Grassrivers - Wetlands Airboat',
    category: 'leonida',
    tag: 'State of Leonida',
  },
  {
    id: 'keys-07',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Leonida_Keys_07.0z9tb69ssp4rq.jpg',
    title: 'Leonida Keys - Overseas Highway',
    category: 'leonida',
    tag: 'State of Leonida',
  },
  {
    id: 'grass-08',
    url: 'https://www.rockstargames.com/VI/_next/static/media/Grassrivers_08.0x-z0h-he35zo.jpg',
    title: 'Grassrivers - Alligator Basin',
    category: 'leonida',
    tag: 'State of Leonida',
  },
];
