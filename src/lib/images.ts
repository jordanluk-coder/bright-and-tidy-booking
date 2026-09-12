/**
 * Central image registry for the public website.
 *
 * Every photo used on the site lives here so it can be swapped later without
 * touching components. All IDs below were verified to load from Unsplash.
 * Replace `src` with your own hosted photography whenever you're ready.
 */

export interface SiteImage {
  src: string
  alt: string
}

const unsplash = (id: string, width = 1600, extra = ''): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80${extra}`

/** Verified Unsplash photo IDs, grouped by subject. */
export const PHOTO_IDS = {
  // Cleaning in action
  cleanerAtKitchenSink: '1642505172378-a6f5e5b15580',
  cleanerWithCaddyOnStairs: '1646980241033-cd7abda2ee88',
  cleanerInWhiteKitchen: '1647381518264-97ff1835026f',
  cleanerWipingWindow: '1581578731548-c64695cc6952',
  vacuumingSofa: '1686178827149-6d55c72d81df',
  dusterOnRattanChair: '1713110824336-f78c320dcf8e',
  glovesWipingWhiteSurface: '1585421514284-efb74c2b69ba',
  glovesCleaningDesk: '1627905646269-7f034dcc5738',
  glovedHandSprayingWood: '1628177142898-93e36e4e3a50',
  scrubbingFloor: '1740657254989-42fe9c3b8cce',
  // Supplies
  sprayBottleCaddy: '1626379481874-3dc5678fa8ca',
  amberSprayBottles: '1528740561666-dc2479dc08ab',
  yellowSprayBottleMint: '1563453392212-326f5e854473',
  // Bright interiors
  livingRoomArchedWindows: '1600210491892-03d54c0aaf87',
  livingRoomAiry: '1598928506311-c55ded91a20c',
  livingRoomLargeWindow: '1583847268964-b28dc8f51f92',
  livingRoomBlueSofa: '1493809842364-78817add7ffb',
  livingRoomWhite: '1600210491369-e753d80a41f3',
  livingRoomModern: '1600607687939-ce8a6c25118c',
  apartmentWithPlants: '1502672260266-1c1ef2d93688',
  apartmentBright: '1522708323590-d24dbb6b0267',
  emptyRoomDresser: '1513694203232-719a280e022f',
  kitchenWhiteBright: '1541123437800-1bb1317badc2',
  kitchenWhiteIsland: '1600585152220-90363fe7e115',
  kitchenWhiteCabinets: '1556911220-bff31c812dba',
  kitchenModernWhite: '1588854337221-4cf9fa96059c',
  bathroomTubTowels: '1620626011761-996317b8d101',
  bathroomVanityTowels: '1595515106969-1ce29566ff1c',
  bathroomBrightSink: '1552321554-5fefe8c9ef14',
  bathroomGlassShower: '1584622650111-993a426fbf0a',
  bedroomBrightLinens: '1615874959474-d609969a20ed',
  bedroomFoldedLinens: '1600607687644-c7171b42498f',
  officeGlassWalls: '1497366754035-f200968a6e72',
  laundryRoom: '1626806787461-102c1bfaaea1',
} as const

export const IMAGES = {
  hero: {
    main: {
      src: unsplash(PHOTO_IDS.livingRoomArchedWindows, 1800),
      alt: 'Bright, freshly cleaned living room with arched windows and natural light',
    },
    floating: {
      src: unsplash(PHOTO_IDS.cleanerAtKitchenSink, 900),
      alt: 'Professional cleaner wiping down a kitchen sink and countertop',
    },
    detail: {
      src: unsplash(PHOTO_IDS.dusterOnRattanChair, 700),
      alt: 'Soft duster gliding over a rattan chair in a tidy room',
    },
  },
  about: {
    main: {
      src: unsplash(PHOTO_IDS.cleanerWithCaddyOnStairs, 1200),
      alt: 'Cleaning professional carrying a supply caddy and broom up the stairs of a home',
    },
    secondary: {
      src: unsplash(PHOTO_IDS.cleanerInWhiteKitchen, 900),
      alt: 'Cleaner in an apron tidying a bright white kitchen',
    },
    detail: {
      src: unsplash(PHOTO_IDS.bathroomTubTowels, 900),
      alt: 'Spotless bathroom with a white tub and neatly folded towels',
    },
  },
  howItWorks: {
    src: unsplash(PHOTO_IDS.glovedHandSprayingWood, 1200),
    alt: 'Gloved hand misting a wooden surface with a cleaning spray',
  },
  booking: {
    side: {
      src: unsplash(PHOTO_IDS.bathroomVanityTowels, 1000),
      alt: 'Clean bathroom vanity with folded towels and a plant',
    },
    supplies: {
      src: unsplash(PHOTO_IDS.sprayBottleCaddy, 900),
      alt: 'Organized caddy of cleaning spray bottles',
    },
  },
  gallery: [
    {
      src: unsplash(PHOTO_IDS.kitchenWhiteBright, 1200),
      alt: 'Sparkling white kitchen after a professional cleaning',
    },
    {
      src: unsplash(PHOTO_IDS.bedroomBrightLinens, 1200),
      alt: 'Bright bedroom with crisp, freshly made linens',
    },
    {
      src: unsplash(PHOTO_IDS.livingRoomAiry, 1200),
      alt: 'Airy living room with clean surfaces and soft daylight',
    },
    {
      src: unsplash(PHOTO_IDS.bathroomBrightSink, 1200),
      alt: 'Clean bathroom sink with natural light',
    },
    {
      src: unsplash(PHOTO_IDS.cleanerWipingWindow, 1200),
      alt: 'Cleaner wiping a window frame with a cloth',
    },
    {
      src: unsplash(PHOTO_IDS.laundryRoom, 1200),
      alt: 'Tidy laundry room with folded linens and a washing machine',
    },
  ] as SiteImage[],
  testimonials: {
    backdrop: {
      src: unsplash(PHOTO_IDS.livingRoomWhite, 1600),
      alt: 'Calm white living room with clean lines',
    },
  },
  cta: {
    src: unsplash(PHOTO_IDS.kitchenWhiteIsland, 1800),
    alt: 'Bright modern kitchen with a clean white island',
  },
} as const

/**
 * Service images are matched by keywords in the service name so that services
 * created later in the admin dashboard still get an on-brand photo.
 * The first rule whose keywords match wins; otherwise a fallback rotates by index.
 */
export const SERVICE_IMAGE_RULES: Array<{ keywords: string[]; image: SiteImage }> = [
  {
    keywords: ['deep'],
    image: {
      src: unsplash(PHOTO_IDS.vacuumingSofa, 1000),
      alt: 'Detailed deep cleaning of upholstered furniture',
    },
  },
  {
    keywords: ['move', 'moving', 'vacate', 'end of lease', 'end-of-lease', 'tenancy'],
    image: {
      src: unsplash(PHOTO_IDS.emptyRoomDresser, 1000),
      alt: 'Empty, freshly cleaned room ready for move-in',
    },
  },
  {
    keywords: ['office', 'commercial', 'workspace', 'workplace'],
    image: {
      src: unsplash(PHOTO_IDS.glovesCleaningDesk, 1000),
      alt: 'Cleaning professional sanitizing an office desk',
    },
  },
  {
    keywords: ['renovation', 'construction', 'post-build', 'builder'],
    image: {
      src: unsplash(PHOTO_IDS.livingRoomWhite, 1000),
      alt: 'Bright finished room, dust-free after renovation cleaning',
    },
  },
  {
    keywords: ['apartment', 'condo', 'flat', 'studio'],
    image: {
      src: unsplash(PHOTO_IDS.apartmentWithPlants, 1000),
      alt: 'Tidy apartment living room with plants and natural light',
    },
  },
  {
    keywords: ['kitchen'],
    image: {
      src: unsplash(PHOTO_IDS.kitchenModernWhite, 1000),
      alt: 'Spotless modern kitchen',
    },
  },
  {
    keywords: ['bathroom', 'bath'],
    image: {
      src: unsplash(PHOTO_IDS.bathroomGlassShower, 1000),
      alt: 'Clean bathroom with a glass shower',
    },
  },
  {
    keywords: ['window', 'glass'],
    image: {
      src: unsplash(PHOTO_IDS.cleanerWipingWindow, 1000),
      alt: 'Cleaner wiping a window frame',
    },
  },
  {
    keywords: ['laundry', 'linen'],
    image: {
      src: unsplash(PHOTO_IDS.laundryRoom, 1000),
      alt: 'Tidy laundry room with folded linens',
    },
  },
  {
    keywords: ['bedroom', 'bed'],
    image: {
      src: unsplash(PHOTO_IDS.bedroomFoldedLinens, 1000),
      alt: 'Bedroom with crisp folded linens',
    },
  },
  {
    keywords: ['standard', 'regular', 'recurring', 'weekly', 'home', 'house', 'maintenance'],
    image: {
      src: unsplash(PHOTO_IDS.livingRoomLargeWindow, 1000),
      alt: 'Bright living room after a standard home cleaning',
    },
  },
]

export const SERVICE_FALLBACK_IMAGES: SiteImage[] = [
  {
    src: unsplash(PHOTO_IDS.livingRoomBlueSofa, 1000),
    alt: 'Fresh, tidy living room with a blue sofa',
  },
  {
    src: unsplash(PHOTO_IDS.kitchenWhiteCabinets, 1000),
    alt: 'Clean white kitchen with fresh produce on the counter',
  },
  {
    src: unsplash(PHOTO_IDS.apartmentBright, 1000),
    alt: 'Bright apartment interior with clean surfaces',
  },
  {
    src: unsplash(PHOTO_IDS.livingRoomModern, 1000),
    alt: 'Modern living room with clean lines',
  },
  {
    src: unsplash(PHOTO_IDS.glovesWipingWhiteSurface, 1000),
    alt: 'Gloved hands wiping a white surface',
  },
]

export function getServiceImage(serviceName: string | null | undefined, index = 0): SiteImage {
  const name = (serviceName ?? '').toLowerCase()
  for (const rule of SERVICE_IMAGE_RULES) {
    if (rule.keywords.some((keyword) => name.includes(keyword))) return rule.image
  }
  const safeIndex = Math.abs(index) % SERVICE_FALLBACK_IMAGES.length
  return SERVICE_FALLBACK_IMAGES[safeIndex]
}
