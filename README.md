# Infinideck

> **Next-Generation Non-Linear Spatial Presentation Engine**

Infinideck reimagines presentations as an infinite, collaborative 2D workspace. Instead of forcing your ideas into rigid, linear slide decks, Infinideck arranges slides across a continuous 2D plane with non-linear branching, timeline context, real-time drawing overlays, live multi-user collaboration, and multi-format import/export.

---

## Key Features

### 🌌 2D Spatial Non-Linear Slides
- **Decoupled Coordinate Spaces**: Each slide is positioned in an infinite 2D world coordinate system `(x, y)` with custom dimensions and themes.
- **Directional Slide Transitions**: Smooth, snappy 2D animations (flying left, right, up, or down) powered by `motion/react`.
- **Branching Workflows**: Branch slides in any direction (sub-topics down, progressions right, retrospectives left) to create natural conceptual trees.

### 🗺️ Interactive Canvas Navigation Pane
- **Thumbnails on Canvas**: An interactive 2D spatial canvas inside the navigation drawer displaying miniature previews of all slides at their real coordinates.
- **Dynamic Pan & Zoom**: Pan across the spatial directory, zoom with the mouse wheel, and click **Fit Canvas** to auto-center the whole deck.
- **Branch Connectors**: Curved SVG paths and directional arrows linking adjacent and branched slides.
- **In-Place Actions**: Drag thumbnails to adjust layout, jump directly to slides, duplicate, delete, or branch new slides.
- **Search & Filter**: Real-time slide search across titles, content, and notes with canvas highlighting.

### 📅 Meeting Timeline Ribbon
- **Chronological Anchors**: Organizes decks into **Past** (context/retrospectives), **Current** (active discussion), and **Future** (milestones/commitments) phases.
- **Quick Jump**: Instant navigation across past alignments and future roadmap commitments with dedicated meeting metadata.

### 🎨 Live Paint-over & Annotation
- **Freehand Canvas Drawing**: Draw annotations directly over any slide in real time.
- **Annotation Tools**: Pen, highlighter, eraser, customizable brush sizing, and color palette.
- **Slide-Specific Layers**: Annotations stick to their parent slide and persist across presentation views.

### 👥 Real-Time Collaboration & Presence
- **Multiplayer Cursors**: Live collaborative cursor tracking with user labels and distinct color accents.
- **In-App Chat**: Collaborative discussion drawer for team commentary and meeting chatter.
- **Simulation Mode**: Built-in simulated collaborator agent for instant testing and demonstrations.

### 🎙️ Presenter Notes & Voice Memos
- **Dual Note Streams**: Private presenter notes (visible only to the presenter) and shared public takeaways.
- **Audio Voice Notes**: Built-in browser audio recording with interactive waveform playback and duration tracking.

### 🎬 Presentation & Zen Modes
- **Distraction-Free Fullscreen**: One-click presentation mode with slide timer, slide tracker, and laser pointer overlay.
- **Zen Mode**: Hides all chrome, toolbars, and drawers for focused content creation.
- **Keyboard-First Controls**: Intuitive shortcuts for fast navigation and mode switching.

### 📦 Multi-Format Import & Export
- **Export to PDF**: Compiles the entire deck into a multi-page PDF presentation with footers and slide numbers.
- **Export to PNG**: Captures current slide in high resolution.
- **Export to Standalone HTML**: Produces a single, self-contained interactive HTML presentation file that runs offline.
- **Export/Import JSON**: Complete deck state backup and restore.
- **Import PowerPoint (.pptx)**: Parses PPTX slide decks using client-side ZIP and XML parsing.

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `→` / `Space` | Navigate to adjacent right slide |
| `←` | Navigate to adjacent left slide |
| `↑` | Navigate to adjacent upper slide |
| `↓` | Navigate to adjacent lower slide |
| `P` | Toggle Presentation Mode |
| `Z` | Toggle Zen Mode |
| `V` | Switch to Select Tool |
| `H` | Switch to Hand / Pan Tool |
| `B` | Switch to Freehand Pen Tool |
| `E` | Switch to Eraser Tool |
| `]` | Toggle Canvas Navigation Pane |
| `Esc` | Exit Presentation Mode / Close Drawers |
| `Ctrl` / `Cmd` + `V` | Paste image directly onto active slide |

---

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Motion](https://motion.dev/) (`motion/react`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Backend & Dev Server**: [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx), [esbuild](https://esbuild.github.io/)
- **Export Utilities**: [jspdf](https://github.com/parallax/jsPDF), [html2canvas](https://html2canvas.hertzen.com/), [jszip](https://stuk.github.io/jszip/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

3. Build for production:
   ```bash
   npm run build
   ```

4. Run the production server:
   ```bash
   npm start
   ```

---

## Project Structure

```
├── index.html                   # HTML entry point and OpenGraph metadata
├── metadata.json                # Application configuration and capabilities
├── package.json                 # Dependencies and build scripts
├── server.ts                    # Express server with Vite middleware integration
├── src/
│   ├── App.tsx                  # Main application container, state & global listeners
│   ├── types.ts                 # Shared TypeScript interfaces & models
│   ├── index.css                # Global Tailwind CSS stylesheet
│   ├── components/
│   │   ├── Canvas.tsx           # Primary slide viewport with 2D transitions & pan/zoom
│   │   ├── NavigationPane.tsx   # 2D spatial canvas navigation pane with thumbnails
│   │   ├── TimelineBar.tsx      # Chronological past/current/future meeting ribbon
│   │   ├── SlideFrame.tsx       # Individual slide card renderer with element handles
│   │   ├── MarkdownEditor.tsx   # Rich markdown editor with live formatting
│   │   ├── PaintLayer.tsx       # Freehand drawing canvas (pen, highlighter, eraser)
│   │   ├── Toolbar.tsx          # Main floating application toolbar
│   │   ├── PresentationMode.tsx # Fullscreen presentation player with timer & controls
│   │   ├── Minimap.tsx          # Compact radar minimap and canvas zoom controls
│   │   ├── NotesDrawer.tsx      # Presenter notes and audio voice recording drawer
│   │   ├── ChatDrawer.tsx       # Real-time multi-user discussion drawer
│   │   ├── CollaborativeCursors.tsx # Real-time peer cursors with position interpolation
│   │   ├── ImportExportModal.tsx# PDF, PNG, HTML, JSON, and PPTX import/export dialog
│   │   └── YouTubeEmbed.tsx     # Embedded responsive YouTube player
│   └── utils/
│       ├── pdfExporter.ts       # Multi-page PDF generation engine
│       ├── pptxParser.ts        # Client-side PPTX ZIP/XML parsing utility
│       └── sampleDeck.ts        # Default starter deck demonstrating spatial branching
```

---

## License

MIT
