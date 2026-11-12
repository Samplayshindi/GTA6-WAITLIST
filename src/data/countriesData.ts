export interface RegionOption {
  id: string; // IANA Timezone identifier
  name: string; // Human-readable region label
  abbr: string; // Short code e.g. EST, CST, JST
}

export interface CountryEntry {
  code: string;
  name: string;
  regionGroup:
    | 'Asia Pacific'
    | 'Middle East'
    | 'Eastern and Southeastern Europe'
    | 'Central Europe'
    | 'Western Europe'
    | 'South America'
    | 'North and Central America';
  flagEmoji: string;
  defaultIana: string;
  multiZone: boolean;
  regions?: RegionOption[];
}

export const REGION_GROUPS = [
  'North and Central America',
  'South America',
  'Western Europe',
  'Central Europe',
  'Eastern and Southeastern Europe',
  'Middle East',
  'Asia Pacific',
] as const;

export const COUNTRIES_DATA: CountryEntry[] = [
  // --- NORTH AND CENTRAL AMERICA ---
  {
    code: 'US',
    name: 'United States',
    regionGroup: 'North and Central America',
    flagEmoji: '🇺🇸',
    defaultIana: 'America/New_York',
    multiZone: true,
    regions: [
      { id: 'America/New_York', name: 'Eastern Time (New York, Miami, Atlanta)', abbr: 'ET' },
      { id: 'America/Chicago', name: 'Central Time (Chicago, Dallas, Houston)', abbr: 'CT' },
      { id: 'America/Denver', name: 'Mountain Time (Denver, Phoenix, Salt Lake)', abbr: 'MT' },
      { id: 'America/Los_Angeles', name: 'Pacific Time (Los Angeles, Seattle, SF)', abbr: 'PT' },
      { id: 'America/Anchorage', name: 'Alaska Time (Anchorage)', abbr: 'AKT' },
      { id: 'Pacific/Honolulu', name: 'Hawaii Time (Honolulu)', abbr: 'HT' },
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    regionGroup: 'North and Central America',
    flagEmoji: '🇨🇦',
    defaultIana: 'America/Toronto',
    multiZone: true,
    regions: [
      { id: 'America/Toronto', name: 'Eastern Time (Toronto, Montreal, Ottawa)', abbr: 'ET' },
      { id: 'America/Winnipeg', name: 'Central Time (Winnipeg)', abbr: 'CT' },
      { id: 'America/Edmonton', name: 'Mountain Time (Edmonton, Calgary)', abbr: 'MT' },
      { id: 'America/Vancouver', name: 'Pacific Time (Vancouver)', abbr: 'PT' },
      { id: 'America/Halifax', name: 'Atlantic Time (Halifax)', abbr: 'AT' },
      { id: 'America/St_Johns', name: 'Newfoundland Time (St. John\'s)', abbr: 'NT' },
    ],
  },
  {
    code: 'MX',
    name: 'Mexico',
    regionGroup: 'North and Central America',
    flagEmoji: '🇲🇽',
    defaultIana: 'America/Mexico_City',
    multiZone: true,
    regions: [
      { id: 'America/Mexico_City', name: 'Central Time (Mexico City, Guadalajara)', abbr: 'CST' },
      { id: 'America/Cancun', name: 'Eastern Time (Cancún)', abbr: 'EST' },
      { id: 'America/Tijuana', name: 'Pacific Time (Tijuana)', abbr: 'PST' },
      { id: 'America/Hermosillo', name: 'Mountain Time (Hermosillo)', abbr: 'MST' },
    ],
  },
  {
    code: 'GT',
    name: 'Guatemala',
    regionGroup: 'North and Central America',
    flagEmoji: '🇬🇹',
    defaultIana: 'America/Guatemala',
    multiZone: false,
  },
  {
    code: 'SV',
    name: 'El Salvador',
    regionGroup: 'North and Central America',
    flagEmoji: '🇸🇻',
    defaultIana: 'America/El_Salvador',
    multiZone: false,
  },
  {
    code: 'CR',
    name: 'Costa Rica',
    regionGroup: 'North and Central America',
    flagEmoji: '🇨🇷',
    defaultIana: 'America/Costa_Rica',
    multiZone: false,
  },
  {
    code: 'HN',
    name: 'Honduras',
    regionGroup: 'North and Central America',
    flagEmoji: '🇭🇳',
    defaultIana: 'America/Tegucigalpa',
    multiZone: false,
  },
  {
    code: 'NI',
    name: 'Nicaragua',
    regionGroup: 'North and Central America',
    flagEmoji: '🇳🇮',
    defaultIana: 'America/Managua',
    multiZone: false,
  },

  // --- SOUTH AMERICA ---
  {
    code: 'BR',
    name: 'Brazil',
    regionGroup: 'South America',
    flagEmoji: '🇧🇷',
    defaultIana: 'America/Sao_Paulo',
    multiZone: true,
    regions: [
      { id: 'America/Sao_Paulo', name: 'Brasília Time (São Paulo, Rio de Janeiro)', abbr: 'BRT' },
      { id: 'America/Manaus', name: 'Amazon Time (Manaus)', abbr: 'AMT' },
      { id: 'America/Noronha', name: 'Fernando de Noronha', abbr: 'FNT' },
      { id: 'America/Rio_Branco', name: 'Acre Time (Rio Branco)', abbr: 'ACT' },
    ],
  },
  {
    code: 'AR',
    name: 'Argentina',
    regionGroup: 'South America',
    flagEmoji: '🇦🇷',
    defaultIana: 'America/Argentina/Buenos_Aires',
    multiZone: false,
  },
  {
    code: 'CL',
    name: 'Chile',
    regionGroup: 'South America',
    flagEmoji: '🇨🇱',
    defaultIana: 'America/Santiago',
    multiZone: false,
  },
  {
    code: 'PY',
    name: 'Paraguay',
    regionGroup: 'South America',
    flagEmoji: '🇵🇾',
    defaultIana: 'America/Asuncion',
    multiZone: false,
  },
  {
    code: 'UY',
    name: 'Uruguay',
    regionGroup: 'South America',
    flagEmoji: '🇺🇾',
    defaultIana: 'America/Montevideo',
    multiZone: false,
  },
  {
    code: 'BO',
    name: 'Bolivia',
    regionGroup: 'South America',
    flagEmoji: '🇧🇴',
    defaultIana: 'America/La_Paz',
    multiZone: false,
  },
  {
    code: 'CO',
    name: 'Colombia',
    regionGroup: 'South America',
    flagEmoji: '🇨🇴',
    defaultIana: 'America/Bogota',
    multiZone: false,
  },
  {
    code: 'EC',
    name: 'Ecuador',
    regionGroup: 'South America',
    flagEmoji: '🇪🇨',
    defaultIana: 'America/Guayaquil',
    multiZone: false,
  },
  {
    code: 'PA',
    name: 'Panama',
    regionGroup: 'South America',
    flagEmoji: '🇵🇦',
    defaultIana: 'America/Panama',
    multiZone: false,
  },
  {
    code: 'PE',
    name: 'Peru',
    regionGroup: 'South America',
    flagEmoji: '🇵🇪',
    defaultIana: 'America/Lima',
    multiZone: false,
  },

  // --- WESTERN EUROPE ---
  {
    code: 'GB',
    name: 'United Kingdom',
    regionGroup: 'Western Europe',
    flagEmoji: '🇬🇧',
    defaultIana: 'Europe/London',
    multiZone: false,
  },
  {
    code: 'IE',
    name: 'Ireland',
    regionGroup: 'Western Europe',
    flagEmoji: '🇮🇪',
    defaultIana: 'Europe/Dublin',
    multiZone: false,
  },
  {
    code: 'PT',
    name: 'Portugal',
    regionGroup: 'Western Europe',
    flagEmoji: '🇵🇹',
    defaultIana: 'Europe/Lisbon',
    multiZone: false,
  },
  {
    code: 'IS',
    name: 'Iceland',
    regionGroup: 'Western Europe',
    flagEmoji: '🇮🇸',
    defaultIana: 'Atlantic/Reykjavik',
    multiZone: false,
  },

  // --- CENTRAL EUROPE ---
  {
    code: 'DE',
    name: 'Germany',
    regionGroup: 'Central Europe',
    flagEmoji: '🇩🇪',
    defaultIana: 'Europe/Berlin',
    multiZone: false,
  },
  {
    code: 'FR',
    name: 'France',
    regionGroup: 'Central Europe',
    flagEmoji: '🇫🇷',
    defaultIana: 'Europe/Paris',
    multiZone: false,
  },
  {
    code: 'ES',
    name: 'Spain',
    regionGroup: 'Central Europe',
    flagEmoji: '🇪🇸',
    defaultIana: 'Europe/Madrid',
    multiZone: false,
  },
  {
    code: 'IT',
    name: 'Italy',
    regionGroup: 'Central Europe',
    flagEmoji: '🇮🇹',
    defaultIana: 'Europe/Rome',
    multiZone: false,
  },
  {
    code: 'NL',
    name: 'Netherlands',
    regionGroup: 'Central Europe',
    flagEmoji: '🇳🇱',
    defaultIana: 'Europe/Amsterdam',
    multiZone: false,
  },
  {
    code: 'BE',
    name: 'Belgium',
    regionGroup: 'Central Europe',
    flagEmoji: '🇧🇪',
    defaultIana: 'Europe/Brussels',
    multiZone: false,
  },
  {
    code: 'AT',
    name: 'Austria',
    regionGroup: 'Central Europe',
    flagEmoji: '🇦🇹',
    defaultIana: 'Europe/Vienna',
    multiZone: false,
  },
  {
    code: 'CH',
    name: 'Switzerland',
    regionGroup: 'Central Europe',
    flagEmoji: '🇨🇭',
    defaultIana: 'Europe/Zurich',
    multiZone: false,
  },
  {
    code: 'PL',
    name: 'Poland',
    regionGroup: 'Central Europe',
    flagEmoji: '🇵🇱',
    defaultIana: 'Europe/Warsaw',
    multiZone: false,
  },
  {
    code: 'SE',
    name: 'Sweden',
    regionGroup: 'Central Europe',
    flagEmoji: '🇸🇪',
    defaultIana: 'Europe/Stockholm',
    multiZone: false,
  },
  {
    code: 'NO',
    name: 'Norway',
    regionGroup: 'Central Europe',
    flagEmoji: '🇳🇴',
    defaultIana: 'Europe/Oslo',
    multiZone: false,
  },
  {
    code: 'DK',
    name: 'Denmark',
    regionGroup: 'Central Europe',
    flagEmoji: '🇩🇰',
    defaultIana: 'Europe/Copenhagen',
    multiZone: false,
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    regionGroup: 'Central Europe',
    flagEmoji: '🇨🇿',
    defaultIana: 'Europe/Prague',
    multiZone: false,
  },
  {
    code: 'SK',
    name: 'Slovakia',
    regionGroup: 'Central Europe',
    flagEmoji: '🇸🇰',
    defaultIana: 'Europe/Bratislava',
    multiZone: false,
  },
  {
    code: 'HU',
    name: 'Hungary',
    regionGroup: 'Central Europe',
    flagEmoji: '🇭🇺',
    defaultIana: 'Europe/Budapest',
    multiZone: false,
  },
  {
    code: 'LU',
    name: 'Luxembourg',
    regionGroup: 'Central Europe',
    flagEmoji: '🇱🇺',
    defaultIana: 'Europe/Luxembourg',
    multiZone: false,
  },
  {
    code: 'MT',
    name: 'Malta',
    regionGroup: 'Central Europe',
    flagEmoji: '🇲🇹',
    defaultIana: 'Europe/Valletta',
    multiZone: false,
  },
  {
    code: 'HR',
    name: 'Croatia',
    regionGroup: 'Central Europe',
    flagEmoji: '🇭🇷',
    defaultIana: 'Europe/Zagreb',
    multiZone: false,
  },
  {
    code: 'SI',
    name: 'Slovenia',
    regionGroup: 'Central Europe',
    flagEmoji: '🇸🇮',
    defaultIana: 'Europe/Ljubljana',
    multiZone: false,
  },

  // --- EASTERN AND SOUTHEASTERN EUROPE & AFRICA ---
  {
    code: 'GR',
    name: 'Greece',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇬🇷',
    defaultIana: 'Europe/Athens',
    multiZone: false,
  },
  {
    code: 'FI',
    name: 'Finland',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇫🇮',
    defaultIana: 'Europe/Helsinki',
    multiZone: false,
  },
  {
    code: 'RO',
    name: 'Romania',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇷🇴',
    defaultIana: 'Europe/Bucharest',
    multiZone: false,
  },
  {
    code: 'BG',
    name: 'Bulgaria',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇧🇬',
    defaultIana: 'Europe/Sofia',
    multiZone: false,
  },
  {
    code: 'CY',
    name: 'Cyprus',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇨🇾',
    defaultIana: 'Asia/Nicosia',
    multiZone: false,
  },
  {
    code: 'UA',
    name: 'Ukraine',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇺🇦',
    defaultIana: 'Europe/Kyiv',
    multiZone: false,
  },
  {
    code: 'ZA',
    name: 'South Africa',
    regionGroup: 'Eastern and Southeastern Europe',
    flagEmoji: '🇿🇦',
    defaultIana: 'Africa/Johannesburg',
    multiZone: false,
  },

  // --- MIDDLE EAST ---
  {
    code: 'AE',
    name: 'United Arab Emirates',
    regionGroup: 'Middle East',
    flagEmoji: '🇦🇪',
    defaultIana: 'Asia/Dubai',
    multiZone: false,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    regionGroup: 'Middle East',
    flagEmoji: '🇸🇦',
    defaultIana: 'Asia/Riyadh',
    multiZone: false,
  },
  {
    code: 'TR',
    name: 'Turkey',
    regionGroup: 'Middle East',
    flagEmoji: '🇹🇷',
    defaultIana: 'Europe/Istanbul',
    multiZone: false,
  },

  // --- ASIA PACIFIC ---
  {
    code: 'NZ',
    name: 'New Zealand',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇳🇿',
    defaultIana: 'Pacific/Auckland',
    multiZone: false,
  },
  {
    code: 'AU',
    name: 'Australia',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇦🇺',
    defaultIana: 'Australia/Sydney',
    multiZone: true,
    regions: [
      { id: 'Australia/Sydney', name: 'Sydney & Melbourne (AEST / AEDT)', abbr: 'AEDT' },
      { id: 'Australia/Brisbane', name: 'Brisbane (AEST)', abbr: 'AEST' },
      { id: 'Australia/Adelaide', name: 'Adelaide (ACST / ACDT)', abbr: 'ACDT' },
      { id: 'Australia/Perth', name: 'Perth (AWST)', abbr: 'AWST' },
      { id: 'Australia/Darwin', name: 'Darwin (ACST)', abbr: 'ACST' },
    ],
  },
  {
    code: 'JP',
    name: 'Japan',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇯🇵',
    defaultIana: 'Asia/Tokyo',
    multiZone: false,
  },
  {
    code: 'KR',
    name: 'South Korea',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇰🇷',
    defaultIana: 'Asia/Seoul',
    multiZone: false,
  },
  {
    code: 'HK',
    name: 'Hong Kong',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇭🇰',
    defaultIana: 'Asia/Hong_Kong',
    multiZone: false,
  },
  {
    code: 'TW',
    name: 'Taiwan',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇹🇼',
    defaultIana: 'Asia/Taipei',
    multiZone: false,
  },
  {
    code: 'MY',
    name: 'Malaysia',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇲🇾',
    defaultIana: 'Asia/Kuala_Lumpur',
    multiZone: false,
  },
  {
    code: 'SG',
    name: 'Singapore',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇸🇬',
    defaultIana: 'Asia/Singapore',
    multiZone: false,
  },
  {
    code: 'ID',
    name: 'Indonesia',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇮🇩',
    defaultIana: 'Asia/Jakarta',
    multiZone: true,
    regions: [
      { id: 'Asia/Jakarta', name: 'Western Time - WIB (Jakarta)', abbr: 'WIB' },
      { id: 'Asia/Makassar', name: 'Central Time - WITA (Makassar, Bali)', abbr: 'WITA' },
      { id: 'Asia/Jayapura', name: 'Eastern Time - WIT (Jayapura)', abbr: 'WIT' },
    ],
  },
  {
    code: 'TH',
    name: 'Thailand',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇹🇭',
    defaultIana: 'Asia/Bangkok',
    multiZone: false,
  },
  {
    code: 'IN',
    name: 'India',
    regionGroup: 'Asia Pacific',
    flagEmoji: '🇮🇳',
    defaultIana: 'Asia/Kolkata',
    multiZone: false,
  },
];

export function findCountryByCode(code: string): CountryEntry | undefined {
  return COUNTRIES_DATA.find((c) => c.code.toUpperCase() === code.toUpperCase());
}

export function findCountryByIana(iana: string): { country: CountryEntry; regionId?: string } | undefined {
  for (const c of COUNTRIES_DATA) {
    if (c.defaultIana === iana) {
      return { country: c, regionId: iana };
    }
    if (c.multiZone && c.regions) {
      const match = c.regions.find((r) => r.id === iana);
      if (match) {
        return { country: c, regionId: match.id };
      }
    }
  }
  return undefined;
}

export function detectUserCountry(): { country: CountryEntry; iana: string } {
  if (typeof window !== 'undefined') {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) {
        const found = findCountryByIana(userTz);
        if (found) {
          return { country: found.country, iana: found.regionId || found.country.defaultIana };
        }
      }
    } catch {
      // ignore
    }
  }
  // Default to US
  const us = findCountryByCode('US')!;
  return { country: us, iana: us.defaultIana };
}
