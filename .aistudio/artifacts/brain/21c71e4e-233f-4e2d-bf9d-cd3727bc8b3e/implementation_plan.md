# GTA VI Countdown — Implementation Plan

A cinematic, dark-themed gaming portal inspired by Rockstar Games' Grand Theft Auto VI and Vice City's neon aesthetic. Features dual real-time release & preload countdowns, genuine multi-source news aggregation, official trailer showcase, dynamic browser tab updates, and high-fidelity page transitions.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The implementation strictly aligns with all 15 core design requirements, incorporating live backend RSS aggregation, dual countdown precision, and custom Vice City artwork.

- **Audio & Ambiance**: The cinematic intro will start with atmospheric synthwave audio muted by default, with an unmistakable audio toggle in the top-right and a "Skip Intro" control in the bottom-right.
- **News Aggregation & CORS**: External gaming RSS feeds (Rockstar Newswire, IGN, GameSpot, Eurogamer) are fetched and parsed through a server-side proxy (`/api/news`) with a 15-minute memory cache and resilient fallback to maintain 100% genuine information without CORS failures.
- **Dual Countdowns**:
  - **Global Release Date**: November 19, 2026 at 12:00 AM local time everywhere.
  - **Confirmed Preload Date**: November 12, 2026 at 12:00 AM local time everywhere (exactly 7 days prior to launch, with emerald "Confirmed Everywhere" badge and calendar export).
- **Creator Credits**: Prominently features `DESIGNED & DEVELOPED BY SAMAR` in the cinematic footer with full Rockstar Games fan disclaimer.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers an official-grade, immersive countdown and intelligence hub for Grand Theft Auto VI. Visitors experience a cinematic movie-style intro, real-time down-to-the-second countdowns for both global launch and preload phases, genuine breaking news from reputable gaming journalism outlets, high-definition trailer playback, release specifications, and interactive Vice City styling.
- **Target Audience**: GTA community members, gamers, and journalists eagerly awaiting the launch of GTA VI.
- **Key Value**: Replaces low-effort countdown widgets with an authentic, responsive, dark-mode portal that brings the atmosphere of Leonida and Vice City directly to the browser.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **First-Visit Experience (Cinematic Intro)**:
   - Screen starts pitch black (`#08090D`) with subtle film grain.
   - Text reveals: *"ROCKSTAR GAMES PRESENTS"* with cinematic letterspacing.
   - Crossfades into *"GRAND THEFT AUTO VI"* with neon pink/purple bloom and camera zoom.
   - Tagline reveals: *"THE WAIT IS ALMOST OVER."*
   - Smooth fade-in transition into the main homepage.
   - *Skip Intro* button available instantly. Intro status saved to `sessionStorage` (with a "Replay Intro" button in the footer).

2. **Hero & Countdown Flow**:
   - Fixed navbar with GTA VI typographic wordmark, links (`HOME`, `COUNTDOWN`, `NEWS`, `RELEASE INFO`, `TRAILERS`), and live local clock.
   - Main Hero features an oversized display title, Vice City twilight skyline backdrop with interactive mouse parallax, and two glassmorphism countdown modules:
     - **Global Release Countdown** (Prominent): Days, Hours, Minutes, Seconds with flip/glow animations and local/official timezone labels.
     - **Preload Countdown** (Secondary): Marked with *ESTIMATED / PLACEHOLDER* badge.
   - Actions: "Copy Countdown", "Add to Calendar (.ics)", and quick jump to News.

3. **News Intelligence Flow**:
   - Tabbed filtering: `ALL NEWS`, `OFFICIAL NEWS`, `RELEASE UPDATES`, `GAMEPLAY`, `TRAILERS`, `LEAKS & RUMORS`.
   - Verified genuine headlines with publisher logos (Rockstar Newswire, IGN, GameSpot, Eurogamer), publication relative timestamps, and "READ FULL STORY" external links.
   - Unconfirmed rumors flagged with explicit warning tags.
   - Live pulse indicator showing when feeds were last synchronized (auto-refreshing every 15 min).

4. **Trailers & Media Showcase**:
   - Cinematic gallery featuring Official Trailer 1 and Trailer 2 showcase.
   - In-app modal video player and direct YouTube linkouts.

5. **Release Specifications & Footer**:
   - Structured specification cards: Rockstar North, Rockstar Games, PS5 & Xbox Series X|S, confirmed features, and Newswire portal.
   - Signature footer with "DESIGNED & DEVELOPED BY SAMAR" and Rockstar Games fan disclaimer.

### Visual Identity & Theme Tokens

- **Dominant Neutral Canvas (60%)**: Deep Black `#08090D`, Midnight Obsidian `#0D0E15`
- **Structural Surfaces (30%)**: Midnight Purple `#171025`, Deep Navy `#12162B`, with glassmorphic backdrop-blur (`rgba(23, 16, 37, 0.75)`) and hairline neon borders (`border-pink-500/20`, `border-cyan-500/20`).
- **Accent Budget (10%)**: Neon Pink `#FF4FA3`, Sunset Orange `#FF9B54`, Ocean Blue `#36B9E9`.
- **Typography**: 
  - *Display / Hero*: Bold Condensed & Neo-Grotesque (`Plus Jakarta Sans` / `Outfit` with tight tracking and uppercase styling).
  - *Body Prose*: Clean readable sans (`Plus Jakarta Sans`).
  - *Data & Timers*: Tabular numerals (`tabular-nums font-mono`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-time News via Server Proxy vs Client Fetch**
  - *Chosen Approach*: An Express API route (`/api/news`) that fetches RSS feeds from Rockstar Newswire, IGN, and GameSpot, parses XML into structured JSON, strips HTML noise, and caches responses in-memory for 15 minutes.
  - *Why*: Direct client-side fetching of external RSS feeds triggers browser CORS blocks. The server route provides seamless CORS-free delivery, rapid response times, and resilience.
  - *Alternative Considered*: Client-side CORS proxies (e.g. `allorigins.win`) are notoriously unstable, rate-limited, and often blocked.
- **Decision 2: Cinematic Intro Session Governance**
  - *Chosen Approach*: Automatic play on first visit per tab/session (`sessionStorage`), with a visible "SKIP INTRO" affordance and a dedicated "Replay Intro" button in the footer.
  - *Why*: Maximizes the dramatic impact without annoying returning users or blocking quick navigation.
- **Decision 3: Configurable Countdowns & Timezones**
  - *Chosen Approach*: Centralized configuration file (`src/config/countdown.ts`) allowing dynamic override of the target dates, alongside local browser timezone conversion and copyable timestamps.

---

## 4. Technical Architecture & Data Strategy

### System Layout & Component Hierarchy

```
┌────────────────────────────────────────────────────────┐
│                      index.html                        │
│  - Custom GTA VI Favicon & Apple Touch Icons           │
│  - Dynamic Browser Tab Title Sync Engine               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                        App.tsx                         │
│  - Session-aware Cinematic Intro Overlay               │
│  - Global State (Active Tab, Target Dates, Sound State)│
│  - Dynamic Ambient Background & Cursor Neon Aura       │
└──────┬──────────────┬──────────────┬─────────────┬─────┘
       │              │              │             │
┌──────▼─────┐ ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼───────┐
│   Navbar   │ │ HeroSection │ │NewsSection │ │  Trailers  │
│ - Brandmark│ │ - Dual      │ │- /api/news │ │ - Trailer 1│
│ - Nav Links│ │   Countdown │ │- Filter Tabs│ │ - Trailer 2│
│ - Live Time│ │ - Timezones │ │- Live Sync │ │ - Modal    │
└────────────┘ └─────────────┘ └────────────┘ └────────────┘
                            │
               ┌────────────▼────────────┐
               │    ReleaseInfoSection   │
               │ - Platforms, Dev, Date  │
               └────────────┬────────────┘
                            │
               ┌────────────▼────────────┐
               │         Footer          │
               │ - "DEVELOPED BY SAMAR"  │
               │ - Replay Intro Trigger  │
               │ - Rockstar Disclaimer   │
               └─────────────────────────┘
```

### Server-Side News Aggregation Route

```
[Client Request: GET /api/news?category=all]
              │
              ▼
[Express Server Proxy: server.ts / vite middleware]
              │
  ┌───────────┴───────────┐
  ▼                       ▼
[Cache Valid (<15m)]   [Cache Expired]
  │                       │
  │                       ├─► Fetch Rockstar Newswire RSS
  │                       ├─► Fetch IGN GTA VI Feed
  │                       ├─► Fetch GameSpot / Eurogamer Feed
  │                       ▼
  │                   [Parse XML -> Deduplicate -> Classify]
  │                       │
  └───────────┬───────────┘
              ▼
[Return JSON: articles[], lastUpdated, liveStatus]
```

### Component State Mapping

- `CountdownTimer`: Computes delta between `Date.now()` and target timestamps (`Nov 19, 2026` & `Dec 15, 2026`). Dispatches `days`, `hours`, `minutes`, `seconds` to animated digit cards. Updates `document.title` every second.
- `NewsSection`: Calls `/api/news` with automatic 15-minute polling interval, manages loading skeleton state, error recovery banner with retry button, and category filtering.
- `CinematicIntro`: Orchestrates step-by-step framer-motion timeline with soundwave animation, audio toggle, and skip handler.
- `TrailerGallery`: Manages active video modal with embedded YouTube player and trailer metadata.
