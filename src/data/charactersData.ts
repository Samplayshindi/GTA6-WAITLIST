export interface CharacterItem {
  id: string;
  name: string;
  subtitle: string;
  whoAreTheyTitle: string; // "Who He Is?", "Who Is She?", "Who He Is", "Who They Are"
  whoAreThey: string;
  images: string[];
  backstory: {
    title: string;
    description: string;
  }[];
  personalityTraits: {
    title: string;
    description: string;
  }[];
  roleHeading: string; // "The Turning Point", "His Role", "Their Role"
  roleDescription: string;
  members?: {
    name: string;
    description: string;
  }[];
}

export const CHARACTERS_DATA: CharacterItem[] = [
  {
    id: 'jason-duval',
    name: 'Jason Duval',
    subtitle: 'Small-Time Criminal & Tactical Muscle',
    whoAreTheyTitle: 'Who He Is?',
    whoAreThey:
      'Jason Duval is a quiet, grounded small-time criminal who fundamentally wants an easy life, but bad habits and bad luck keep dragging him back into trouble.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_02.1486~7_v40cn..jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_01.07m377xeb6jhq.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_06.086o72llg6~1p.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_05.0kxp6enhvzqka.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_04.16d-z2wa2s~bk.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Jason_Duval_03.0-1vum7x-3vtp.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Rough Upbringing',
        description: 'Grew up surrounded by crooks and hustlers.',
      },
      {
        title: 'Military Past',
        description:
          'Joined the U.S. Army to get away from his messy youth, gaining weapons training and tactical discipline.',
      },
      {
        title: 'Life in the Keys',
        description:
          'After leaving the army, he ended up in the Leonida Keys working as muscle and an enforcer for local smugglers.',
      },
    ],
    personalityTraits: [
      {
        title: 'Calm & Methodical',
        description:
          'Thinks before he shoots and uses smart situational awareness rather than reckless violence.',
      },
      {
        title: 'Exhausted with the Grind',
        description: 'Tired of small-time shakedowns and wants a way out.',
      },
      {
        title: 'Loyal Partner',
        description: 'When committed, he stands firmly by the people he trusts.',
      },
    ],
    roleHeading: 'The Turning Point',
    roleDescription:
      'Knowing he needs a change, his life flips upside down when a robbery goes sideways, pulling him into high-stakes heists alongside Lucia—a dangerous partnership that could either save him or ruin him completely.',
  },
  {
    id: 'lucia-caminos',
    name: 'Lucia Caminos',
    subtitle: 'Ambitious & Street-Smart Robber',
    whoAreTheyTitle: 'Who Is She?',
    whoAreThey:
      'Lucia Caminos is a fierce, ambitious, and street-smart criminal determined to build a better life, willing to take whatever high-risk path is necessary to get it.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_01.0a7yqvewctkfp.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_02.16n.5umvlu_48.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_05.0i5b7k6a7_w6p.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_06.0fxbjfk0jakb3.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_04.04kb_~4ubn3wn.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Lucia_Caminos_03.14xgd2y_ymmeg.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Street Roots',
        description:
          'Raised around Vice City, learning to survive the city’s harsh underworld from an early age.',
      },
      {
        title: 'Incarceration',
        description:
          'Spent time behind bars at the Leonida Department of Corrections after an operation went wrong, which only hardened her resolve.',
      },
      {
        title: 'Hungry for More',
        description:
          'Refuses to stay at the bottom of the food chain or settle for petty, low-reward crimes.',
      },
    ],
    personalityTraits: [
      {
        title: 'Bold & Direct',
        description:
          'Confident, aggressive when provoked, and unafraid to take direct action during stick-ups.',
      },
      {
        title: 'Pragmatic & Resourceful',
        description:
          'Believes deeply in trusting her instincts and making her own luck rather than relying on fate.',
      },
      {
        title: 'Driven Partner',
        description:
          'Operates as a decisive force, pushing to pull off daring jobs with tight coordination.',
      },
    ],
    roleHeading: 'The Turning Point',
    roleDescription:
      'After her release from prison, she links up with Jason Duval to carry out armed robberies across Leonida. Tied together by trust and survival, their partnership quickly pulls them both into high-stakes heists that test just how far they are willing to go.',
  },
  {
    id: 'cal-hampton',
    name: 'Cal Hampton',
    subtitle: 'Reclusive Scanner Enthusiast & Informant',
    whoAreTheyTitle: 'Who He Is',
    whoAreThey:
      'Cal Hampton is a reclusive, paranoid, and weed-smoking local associate in the Leonida Keys who spends his days glued to police and military radio scanners.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_01.0xlil231_osh4.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_04.0-78dep86yx2q.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_02.05r2t_mck65fe.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Cal_Hampton_03.0.q68~pt1to9z.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Keys Resident',
        description:
          'Lives isolated in the damp swamplands and backwaters of the Leonida Keys.',
      },
      {
        title: "Jason's Circle",
        description:
          "One of Jason Duval's closest day-to-day contacts before high-stakes robberies pull Jason away.",
      },
      {
        title: 'Scanner Watcher',
        description:
          'Monitors Coast Guard, police, and border patrol frequencies, acting as an informal early-warning radar for local smugglers.',
      },
    ],
    personalityTraits: [
      {
        title: 'Paranoid & Conspiratorial',
        description:
          'Deep down the rabbit hole of government cover-ups, surveillance theories, and off-grid survivalism.',
      },
      {
        title: 'Unambitious',
        description:
          'Unlike Jason or Lucia, he has zero desire to climb the criminal ladder; he is content scraping by under the radar.',
      },
      {
        title: 'Nervous Informant',
        description:
          'Reliable when it comes to radio chatter, but visibly uncomfortable and skittish whenever real-world violence shows up at his doorstep.',
      },
    ],
    roleHeading: 'His Role',
    roleDescription:
      'Cal serves as the quintessential backwater information-broker—useful for listening in on maritime patrols and scouting trouble from behind a radio desk, but strictly out of his element once the shooting starts.',
  },
  {
    id: 'boobie-ike',
    name: 'Boobie Ike',
    subtitle: 'Music Producer & Nightlife Impresario',
    whoAreTheyTitle: 'Who He Is',
    whoAreThey:
      'Boobie Ike is a wealthy, flamboyant music producer, nightlife impresario, and underground figure embedded in the Vice City entertainment and rap scene.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_01.0-wji2pg5anfs.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_03.0neka36~z25b5.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_02.0sp9mtc.1cdzs.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Boobie_Ike_04.0~1fr6ijgvnzx.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Music & Nightlife Hustle',
        description:
          'Built his empire through high-end recording studios, strip clubs, and record label operations across Leonida.',
      },
      {
        title: 'Underworld Ties',
        description:
          'Blurs the line between legitimate music business and dirty cash, acting as a middleman and financier for illicit projects and local talent.',
      },
      {
        title: 'City Status',
        description:
          'A flashy, well-connected public figure known for driving exotic cars, throwing lavish parties, and flaunting his wealth across social media.',
      },
    ],
    personalityTraits: [
      {
        title: 'Flamboyant & Charismatic',
        description:
          'Larger than life, loud, and image-obsessed, treating life like an ongoing music video.',
      },
      {
        title: 'Shrewd Businessman',
        description:
          'Behind the flashy exterior, he is calculating about who he invests in and ruthless about protecting his money.',
      },
      {
        title: 'Connected Power-Broker',
        description:
          'Moves comfortably between corporate music executives, street hustlers, and local fixers.',
      },
    ],
    roleHeading: 'His Role',
    roleDescription:
      'Boobie acts as a high-roller contact who bridges street-level operations with the lucrative Vice City creative economy—offering connections, money laundering avenues, and high-paying jobs, provided you can handle the chaotic lifestyle that comes with him.',
  },
  {
    id: 'drequan-priest',
    name: "Dre'Quan Priest",
    subtitle: 'Rising Rap Artist & Street Figure',
    whoAreTheyTitle: 'Who He Is',
    whoAreThey:
      "Dre'Quan Priest is an ambitious, self-assured rising rap artist and street figure trying to make his mark on the Vice City hip-hop scene.",
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_01.0_0~wi-ipdj35.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_02.02u69e~nkk3eo.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_04.0n~kj~px_fn8t.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/DreQuan_Priest_03.0zbl4i_x_1biu.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Streets to the Booth',
        description:
          'Clawed his way up from local neighborhood crews, channeling his street background into raw tracks and viral internet buzz.',
      },
      {
        title: 'Industry Ambitions',
        description:
          'Constantly pushing to break out of the underground circuit and lock down major recording deals with influential city players like Boobie Ike.',
      },
      {
        title: 'Underworld Entanglements',
        description:
          'Despite his musical talents, he remains deeply connected to local crews, hustling on the side to fund recording sessions, videos, and flash lifestyle optics.',
      },
    ],
    personalityTraits: [
      {
        title: 'Confident & Hungry',
        description:
          "Believes wholeheartedly that he is the next big thing out of Leonida and refuses to stay in anyone's shadow.",
      },
      {
        title: 'Volatile Temper',
        description:
          'Quick to take offense, protect his image, and escalate petty beefs—both on social media and on the block.',
      },
      {
        title: 'Clout-Driven',
        description:
          'Obsessed with status, street credibility, and views, often blurring the line between artistic promotion and real-life criminal recklessness.',
      },
    ],
    roleHeading: 'His Role',
    roleDescription:
      "Dre'Quan represents the modern, clout-heavy generation of Vice City's street-level music culture—bringing volatile drama, street connections, and unpredictable high-risk jobs that straddle the line between the studio and the streets.",
  },
  {
    id: 'real-dimez',
    name: 'Real Dimez',
    subtitle: 'Flashy Rap & Influencer Duo',
    whoAreTheyTitle: 'Who They Are',
    whoAreThey:
      "Real Dimez is a flashy, provocative Vice City rap and influencer duo made up of best friends and collaborators Bae-Luxe and Roxy. Together, they dominate the city's nightlife and social feeds with viral videos, wild club antics, and raw trap music.",
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_03.02o2si7.op.ye.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_01.0djwwboo8-glx.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_02.1366u9.x.yp0_.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Real_Dimez_04.0wa3vo07lz4e2.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'From the Streets to the Timeline',
        description:
          'Built a massive following across Leonida by livestreaming chaotic night runs, twerking clips, and unfiltered neighborhood drama.',
      },
      {
        title: 'Music & Nightlife Hustle',
        description:
          'Used their social media clout to jump into the music booth, dropping club tracks and rubbing shoulders with high-roller producers like Boobie Ike.',
      },
      {
        title: 'Unbreakable Dynamic',
        description:
          'Though their personalities often clash on camera for views, they move as a tight-knit pair when it comes to business, clout, and street beefs.',
      },
    ],
    members: [
      {
        name: 'Bae-Luxe',
        description:
          'The stylish, image-obsessed diva focused on luxury aesthetics, viral trends, and looking untouchable while chasing high-end sponsorship bags.',
      },
      {
        name: 'Roxy',
        description:
          'The louder, more confrontational wildcard of the two, quick to call people out on live video, throw hands in the club, and back up their street rep.',
      },
    ],
    personalityTraits: [
      {
        title: 'Clout-Driven',
        description:
          'Every argument, party, and run-in with trouble is treated as fresh content for the algorithm.',
      },
      {
        title: 'Loud & Unapologetic',
        description:
          'They live without a filter, completely unfazed by public scandals or internet haters.',
      },
      {
        title: 'Hustle Mentality',
        description:
          'Behind the glamour and drama, they are relentless opportunists looking to turn underground fame into serious cash.',
      },
    ],
    roleHeading: 'Their Role',
    roleDescription:
      "Real Dimez embodies the wild, camera-first social media culture of modern Vice City—serving as a noisy, unpredictable bridge between the city’s music studios, club VIP lounges, and street-level rivalries.",
  },
  {
    id: 'raul-bautista',
    name: 'Raul Bautista',
    subtitle: 'Seasoned Syndicate Fixer & Intermediary',
    whoAreTheyTitle: 'Who He Is',
    whoAreThey:
      'Raul Bautista is a seasoned, tough-nosed criminal figure and veteran underworld fixer operating across the shifting syndicates of Vice City and greater Leonida.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_01.0md1ii-yrn96r.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_03.0-x4xbav_6c40.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_02.10ddy6ogywu-t.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Raul_Bautista_04.0qx77gyvykvv5.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Old-School Syndicate Roots',
        description:
          'Came up through the ranks of established Latin-American cartels and smuggling networks that have moved contraband through South Florida for decades.',
      },
      {
        title: 'Prison Hardened',
        description:
          'Did hard time inside state facilities, earning respect and cementing valuable connections on both sides of the cell bars.',
      },
      {
        title: 'Network Operator',
        description:
          'Serves as a reliable intermediary, connecting armed street crews and freelance robbers with high-paying buyers, fence networks, and money launderers.',
      },
    ],
    personalityTraits: [
      {
        title: 'Pragmatic & Cold',
        description:
          "Has seen every empire rise and fall; he doesn't care about flashy social media clout or street prestige—only margins, risk assessment, and cold cash.",
      },
      {
        title: 'Direct & Authoritative',
        description:
          'Commands respect naturally, expecting instructions to be followed to the letter and showing zero tolerance for sloppy, amateur mistakes.',
      },
      {
        title: 'Calculated Survivor',
        description:
          'Moves carefully in the shadows to avoid heat from federal task forces, letting younger crews take the loud risks while he coordinates the logistics.',
      },
    ],
    roleHeading: 'His Role',
    roleDescription:
      'Raul acts as a bridge between desperate low-level stick-up crews and serious, organized criminal contracts—offering high-payout scores and tactical support, provided the job is executed cleanly and without unnecessary collateral damage.',
  },
  {
    id: 'brian-heder',
    name: 'Brian Heder',
    subtitle: 'Backwater Drug Smuggler & Property Owner',
    whoAreTheyTitle: 'Who He Is',
    whoAreThey:
      'Brian Heder is a gritty, sun-baked drug smuggler and property owner operating out of the backwaters of the Leonida Keys.',
    images: [
      'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_01.0r.ute88os9k-.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_03.10ntuqh2h6upf.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_02.0kmg6iw38f-9o.jpg?akim=1&imdensity=1&imwidth=1920',
      'https://www.rockstargames.com/VI/_next/static/media/Brian_Heder_04.0z3o0t88jw54l.jpg?akim=1&imdensity=1&imwidth=1920',
    ],
    backstory: [
      {
        title: 'Keys Veteran',
        description:
          'An established local figure who has spent years moving illicit cargo through the shallow waterways and mangrove channels of the Keys.',
      },
      {
        title: 'Landlord & Boss',
        description:
          'Owns several rundown coastal properties and trailers, using them as safehouses and staging grounds for his operations.',
      },
      {
        title: "Jason's Employer",
        description:
          'Provides Jason Duval with a place to live rent-free in exchange for Jason serving as his muscle, collector, and local enforcer.',
      },
    ],
    personalityTraits: [
      {
        title: 'Coarse & Demanding',
        description:
          'A gruff, no-nonsense operator who expects his orders carried out without complaints or excuses.',
      },
      {
        title: 'Territorial',
        description:
          'Fiercely protective of his smuggling routes, water turf, and local operations from rival traffickers and Coast Guard patrols.',
      },
      {
        title: 'Transactional',
        description:
          'Views people around him strictly by their utility; as long as Jason handles debts, intimidation, and muscle work, Brian keeps a roof over his head.',
      },
    ],
    roleHeading: 'His Role',
    roleDescription:
      "Brian serves as Jason’s early-game anchor in the Leonida Keys—the local boss keeping Jason tied to small-time swamp smuggling and petty intimidation before bigger, statewide scores pull him away.",
  },
];
