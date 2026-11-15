# GTA VI WAITLIST

<p align="center">
  <strong>Your destination for everything surrounding Grand Theft Auto VI.</strong>
</p>

<p align="center">
  <a href="https://gtaviwaitlist.run.place/">Live Website</a> ·
  <a href="https://github.com/Samplayshindi/GTA6-WAITLIST">GitHub Repository</a>
</p>

---

## About the Project

**GTA VI WAITLIST** is a comprehensive fan-made website dedicated to Grand Theft Auto VI, developed to bring together the game's countdown, characters, official media, screenshots, soundtrack, news, development history, and launch information in one place.

The project combines an immersive visual experience with interactive features, responsive layouts, and performance-focused engineering.

The website is designed to serve as a central destination for fans following the road to Leonida.

**Current Version: v1.9.9**

**Release Status: Final major pre-launch update**

## Features

### Countdown & Launch System
- Dynamic Grand Theft Auto VI countdown.
- Separate preload and global release milestones.
- Three-state launch experience:
  - Before Preload
  - Pre-load Is Live
  - Released
- Launch location and country selection.
- Time-zone-aware launch information.

### Characters
- Dedicated character profiles and dossiers.
- Character artwork and portraits.
- Information about the major characters of Leonida.

### Gallery
- Extensive collection of official Rockstar Games artwork and screenshots.
- 141 gallery assets.
- Six browsing categories:
  - All Media
  - Jason & Lucia
  - Characters
  - Vice City
  - Leonida & Locations
  - Artworks
- Dedicated collection of 13 curated artworks.
- Responsive image grid.
- Fullscreen image lightbox.
- Image navigation and touch interactions.

### Official Videos
- Official Grand Theft Auto VI trailers and videos.
- High-resolution video thumbnails.
- Integrated video viewing experience.

### Newswire
- GTA VI-related news and updates.
- News aggregation with fallback content.
- Cached article snapshots for faster navigation.

### Development Timeline
- Chronological development history.
- Major announcements and trailer releases.
- Important milestones and launch information.

### FAQ
- Dedicated frequently asked questions section.
- Information about the game and its launch.

### Music Player
- Integrated soundtrack experience.
- Persistent playback while navigating the website.
- Track queue and playback controls.
- Favorites and volume controls.
- Progress seeking.
- Album artwork and track information.

### Share Countdown
- Interactive countdown card creator.
- Multiple background selections.
- Progressive background loading.
- Canvas-based image generation.
- Downloadable countdown designs.

### Themes & Customization
- Seven available color themes.
- Theme-specific interface accents.
- Customizable website appearance.

### Progressive Web App
- PWA support.
- Installable website experience.
- Service Worker integration.
- Offline resource caching.

## Performance & Optimization

Version 1.9.9 introduces extensive performance improvements throughout the project.

### Image Optimization
- Responsive AVIF and WebP image delivery.
- Multiple image widths: 375px, 768px, 1280px and 1920px.
- Optimized image loading based on display requirements.
- Improved image fallback handling.
- Lazy loading for below-the-fold images.
- Improved caching and image decoding.

The image optimization manifest indexes 161 source images and 1,278 responsive variants. The verified on-disk image collection was subsequently synchronized to 787 files across 99 entries.

### Navigation Performance
- React concurrent route transitions.
- Visited-route caching.
- Route prefetching.
- Improved browser Back and Forward navigation.
- Non-blocking navigation indicators.
- Reduced unnecessary component remounting.
- Independent loading boundaries for mobile sections.

### Rendering Improvements
- Lazy-loaded routes and components.
- Memoized contexts and callbacks.
- Shared IntersectionObserver handling.
- Optimized canvas rendering.
- Improved loading states and reduced unnecessary image requests.

## Technology Stack

The project uses:

- **React** for the user interface.
- **TypeScript** for application logic and type safety.
- **Vite** for development and production builds.
- **Tailwind CSS** for styling.
- **Sharp** for image processing.
- **Service Workers** for PWA and caching functionality.
- **HTML5 Canvas** for countdown card generation.

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Install:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Samplayshindi/GTA6-WAITLIST.git
```

### 2. Open the project directory

```bash
cd GTA6-WAITLIST
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local address displayed in your terminal.

### 5. Build for production

```bash
npm run build
```

### 6. Run TypeScript checks

```bash
npm run lint
```

## Project Structure

The project follows a component-based React architecture.

```text
GTA6-WAITLIST/
│
├── public/
│   ├── assets/
│   ├── images/
│   ├── media/
│   ├── optimized-images/
│   ├── manifest.json
│   └── ...
│
├── scripts/
│   ├── build-manifest.ts
│   ├── generate-manifest.js
│   └── process-images.ts
│
├── src/
│   ├── components/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

*Some directories and files may vary between releases.*

## Version History

| Version | Description |
|---|---|
| v1.9.9 | Final major pre-launch update, performance optimization, navigation improvements, Gallery fixes and soundtrack enhancements |
| v1.9.0–v1.9.8 | Earlier development releases |

## What's New in v1.9.9?

The final major pre-launch update focuses on refining the existing experience.

Highlights include:

- Rebuilt responsive image optimization pipeline.
- Improved image fallback and caching systems.
- Gallery redesign and dedicated Artworks category.
- Fixed broken fullscreen artwork and placeholder thumbnails.
- Smooth site-wide navigation across eight major sections.
- Improved route caching and prefetching.
- Optimized Share Countdown background loading and canvas rendering.
- Improved country and launch location selector.
- Soundtrack playback improvements and additional music.
- Refined desktop and mobile experiences.
- Service Worker runtime error fixes.
- Improved loading states and rendering efficiency.

## Development & Testing

The v1.9.9 release underwent several technical verification checks.

- TypeScript checks passed.
- Production build completed successfully.
- All 141 Gallery cards verified.
- All six Gallery filters tested.
- Fullscreen image loading verified.
- Site-wide navigation tested across all eight sections.
- Desktop and mobile navigation tested.
- Image fallback behavior tested.
- Browser console and network checks completed.

## Disclaimer

GTA VI WAITLIST is an independent, unofficial fan-made project.

This website is not affiliated with, endorsed by, sponsored by, or associated with Rockstar Games, Take-Two Interactive, or any of their subsidiaries.

Grand Theft Auto, Grand Theft Auto VI, Rockstar Games, related logos, characters, artwork, trademarks, and other intellectual property belong to their respective owners.

All referenced official media and artwork remain the property of their respective copyright holders.

This project is created for informational, archival, and fan-community purposes.

## Credits

**Developed by Sam Plays**

Built with a focus on performance, visual presentation, and the Grand Theft Auto community.

<p align="center">
  <strong>THE COUNTDOWN TO LEONIDA CONTINUES.</strong>
  <br/>
  <a href="https://gtaviwaitlist.run.place/">Visit GTA VI WAITLIST</a>
</p>
