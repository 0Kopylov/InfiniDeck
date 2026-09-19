import { Slide } from '../types';

export const INITIAL_SLIDES: Slide[] = [
  // PAST MEETING (Left: x = -1300)
  {
    id: 'slide-past-1',
    title: 'Sprint 41 Architecture & Retro',
    subtitle: 'Previous Week Decisions & Foundation',
    type: 'meeting',
    timelineCategory: 'past',
    meetingContext: {
      date: 'Sept 12, 2026',
      time: '10:00 AM UTC',
      attendees: ['Elena Rostova', 'Marcus Chen', 'David Kim', 'Amina Sow'],
      status: 'past',
      summary: 'Finalized infinite canvas viewport math and agreed on non-linear slide arrangement.',
      agendaItem: 'Previous Alignment',
    },
    x: -1300,
    y: 0,
    width: 1100,
    height: 620,
    theme: {
      bg: '#121316',
      text: '#f4f4f5',
      accent: '#6366f1',
      border: '#27272a',
    },
    orderIndex: 0,
    notes: {
      privateNotes: 'Speaker reminder: Acknowledge Elena’s work on the coordinate transform benchmarks.',
      publicNotes: 'Approved: 2D spatial canvas layout over traditional top-to-bottom slide decks.',
      voiceNotes: [
        {
          id: 'vn-past-1',
          title: 'Elena on Spatial Canvas consensus',
          duration: 34,
          createdAt: 'Sept 12, 2026',
          isPublic: true,
          author: 'Elena Rostova',
          transcript: 'The team concluded that 1D linear decks force unnatural context switching. Adding past and future meetings along the horizontal axis gives everyone instant chronological context.',
        }
      ],
    },
    elements: [
      {
        id: 'el-past-md-1',
        type: 'markdown',
        x: 48,
        y: 80,
        width: 480,
        height: 240,
        content: `### 🎯 Sprint 41 Retrospective

* **Key Takeaway**: Non-linear navigation reduced meeting prep by 45%
* **Resolved**: Latency in canvas matrix panning down to <4ms
* **Deprecated**: Static 16:9 fixed slide bounds`,
        style: {
          fontSize: 16,
          fontFamily: 'sans',
          color: '#e4e4e7',
          backgroundColor: '#18181b',
          borderColor: '#27272a',
          borderWidth: 1,
          borderRadius: 8,
        }
      },
      {
        id: 'el-past-img-1',
        type: 'image',
        x: 560,
        y: 80,
        width: 490,
        height: 260,
        mediaUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80',
        style: {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#27272a',
        }
      },
      {
        id: 'el-past-md-2',
        type: 'markdown',
        x: 48,
        y: 350,
        width: 1000,
        height: 220,
        content: `| Topic | Decision | Owner | Status |
| :--- | :--- | :--- | :--- |
| Coordinate System | World-space 2D matrix with subpixel scaling | Marcus | ✅ Complete |
| Voice Notes | In-browser MediaRecorder + dual privacy tiers | Elena | ✅ Complete |
| PowerPoint Import | Client-side JSZip XML AST unpacker | Amina | ✅ Complete |`,
        style: {
          fontSize: 14,
          fontFamily: 'mono',
          color: '#d4d4d8',
          backgroundColor: '#18181b',
          borderColor: '#27272a',
          borderWidth: 1,
          borderRadius: 8,
        }
      }
    ],
  },

  // CURRENT MEETING (Center: x = 0)
  {
    id: 'slide-current-1',
    title: 'Infinideck: Live Launch',
    subtitle: 'Next-Generation Non-Linear Storytelling',
    type: 'meeting',
    timelineCategory: 'current',
    meetingContext: {
      date: 'Sept 19, 2026 (Today)',
      time: '2:30 PM UTC',
      attendees: ['Elena Rostova', 'Marcus Chen', 'David Kim', 'Sarah Jenkins'],
      status: 'present',
      summary: 'Demonstrating infinite canvas, live paint-over, real-time collaboration, and multi-format deck export.',
      agendaItem: 'Active Presentation',
    },
    x: 0,
    y: 0,
    width: 1100,
    height: 620,
    theme: {
      bg: '#0e1015',
      text: '#ffffff',
      accent: '#38bdf8',
      border: '#38bdf840',
    },
    orderIndex: 1,
    notes: {
      privateNotes: 'CONFIDENTIAL PRESENTER CUES: Emphasize that slides can expand organically without constraint. Demo live drawing laser pointer right over the diagram.',
      publicNotes: 'Live launch agenda: 1) Infinite zooming demo, 2) Left/Right timeline meetings, 3) Real-time cursors & drawing, 4) PPTX/PDF import & export.',
      voiceNotes: [
        {
          id: 'vn-curr-1',
          title: 'Opening Remarks & Goal Statement',
          duration: 48,
          createdAt: 'Just now',
          isPublic: false,
          author: 'Marcus Chen',
          transcript: 'Today we break out of the 1987 slide carousel. Slides are spatial frames within a living canvas. We can zoom into details, pan back to the big picture, and look back at past meetings on the left.',
        }
      ],
    },
    elements: [
      {
        id: 'el-curr-md-title',
        type: 'markdown',
        x: 48,
        y: 80,
        width: 540,
        height: 250,
        content: `## 🚀 Rethinking Presentations

Traditional slide decks force your narrative into a strict 1-dimensional box.

* **Infinite Zoom & Pan**: Move smoothly between micro-details and bird's-eye overviews.
* **Bi-Directional Timeline**: Jump to **Past Meetings on the left** and **Future Roadmaps on the right**.
* **Live Paint-Over**: Draw freehand directly over any slide in real-time.
* **Dual-Tier Notes**: Private presenter speaker cues + public team action notes.`,
        style: {
          fontSize: 16,
          fontFamily: 'sans',
          color: '#ffffff',
          backgroundColor: '#161922',
          borderColor: '#38bdf830',
          borderWidth: 1,
          borderRadius: 8,
        }
      },
      {
        id: 'el-curr-yt-1',
        type: 'youtube',
        x: 610,
        y: 80,
        width: 440,
        height: 250,
        youtubeId: 'dQw4w9WgXcQ',
        mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        style: {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#38bdf830',
        }
      },
      {
        id: 'el-curr-md-code',
        type: 'markdown',
        x: 48,
        y: 350,
        width: 540,
        height: 220,
        content: `### ⚡ Minimalist Keyboard Controls

* **Space + Drag**: Pan anywhere on the canvas
* **Pinch / Wheel**: Infinite zoom in and out
* **P**: Fullscreen Distraction-Free Presenter View
* **Z**: Zen Mode (toggle all floating UI)
* **Arrow Up / Down / Left / Right**: 2D spatial jump between branches and timeline
* **Left Navigation Pane**: Collapsible slide explorer and 4-way D-Pad`,
        style: {
          fontSize: 14,
          fontFamily: 'mono',
          color: '#bae6fd',
          backgroundColor: '#0c1929',
          borderColor: '#0284c740',
          borderWidth: 1,
          borderRadius: 8,
        }
      },
      {
        id: 'el-curr-img-2',
        type: 'image',
        x: 610,
        y: 350,
        width: 440,
        height: 220,
        mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        style: {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#27272a',
        }
      }
    ],
  },

  // VERTICAL BRANCH: UP (Deep Dive / Architecture)
  {
    id: 'slide-up-1',
    title: 'Deep Dive: Spatial Canvas Architecture',
    subtitle: 'Branch (Up): Subpixel Matrix Transform & Viewport Optics',
    type: 'slide',
    timelineCategory: 'current',
    meetingContext: {
      date: 'Technical Deep Dive',
      status: 'present',
      summary: 'Architectural breakdown of coordinate spaces, virtual camera matrix, and GPU composition.',
      agendaItem: 'Engineering Deep Dive',
    },
    x: 0,
    y: -780,
    width: 1100,
    height: 620,
    theme: {
      bg: '#0c131d',
      text: '#f0f9ff',
      accent: '#38bdf8',
      border: '#0284c750',
    },
    orderIndex: 3,
    notes: {
      privateNotes: 'Speaker reminder: Highlight that world-to-screen matrix calculations execute in sub-millisecond frames.',
      publicNotes: 'Technical consensus: Virtualized 2D canvas matrix provides continuous 60fps gesture rendering.',
      voiceNotes: [],
    },
    elements: [
      {
        id: 'el-up-md-1',
        type: 'markdown',
        x: 48,
        y: 80,
        width: 530,
        height: 480,
        content: `### 📐 Coordinate Spaces & Viewport Math

Infinideck decouples **Screen Coordinates** from **Infinite World Coordinates**:

\`\`\`typescript
// Screen -> World Space
const worldX = (clientX - viewport.x) / viewport.zoom;
const worldY = (clientY - viewport.y) / viewport.zoom;

// World -> Screen Transform
const screenX = worldX * viewport.zoom + viewport.x;
const screenY = worldY * viewport.zoom + viewport.y;
\`\`\`

#### Key Architectural Benefits:
* **True Non-Linear Branching**: Slides can be organized in clusters (Up for deep dives, Down for appendix).
* **Relative Paint Offsets**: Paint strokes calculate offsets relative to slide origin so slides remain draggable.
* **Camera Lerping**: Smooth cubic ease-out interpolates camera between slides.`,
        style: {
          fontSize: 14,
          fontFamily: 'mono',
          color: '#e0f2fe',
          backgroundColor: '#101d2d',
          borderColor: '#0369a1',
          borderWidth: 1,
          borderRadius: 8,
        }
      },
      {
        id: 'el-up-img-1',
        type: 'image',
        x: 600,
        y: 80,
        width: 450,
        height: 250,
        mediaUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
        style: {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#0284c740',
        }
      },
      {
        id: 'el-up-md-2',
        type: 'markdown',
        x: 600,
        y: 350,
        width: 450,
        height: 210,
        content: `### 🧭 Spatial Navigation Tip

* Press **Arrow Down** or click **↓** in the left Navigation Pane to return to the main presentation!
* Press **Arrow Left** to view preceding Sprint 41.
* Press **Arrow Right** to view Sprint 43 roadmap.`,
        style: {
          fontSize: 14,
          fontFamily: 'sans',
          color: '#bae6fd',
          backgroundColor: '#0e1c2b',
          borderColor: '#0284c740',
          borderWidth: 1,
          borderRadius: 8,
        }
      }
    ]
  },

  // VERTICAL BRANCH: DOWN (Appendix / Metrics)
  {
    id: 'slide-down-1',
    title: 'Appendix: Performance Metrics & Sync',
    subtitle: 'Branch (Down): Benchmark Data & Real-Time Telemetry',
    type: 'slide',
    timelineCategory: 'current',
    meetingContext: {
      date: 'Telemetry Appendix',
      status: 'present',
      summary: 'Latency benchmarks, DOM footprint comparison, and memory profiling across 50+ spatial slides.',
      agendaItem: 'Supporting Appendix',
    },
    x: 0,
    y: 780,
    width: 1100,
    height: 620,
    theme: {
      bg: '#0c1613',
      text: '#f0fdf4',
      accent: '#10b981',
      border: '#05966950',
    },
    orderIndex: 4,
    notes: {
      privateNotes: 'Speaker reminder: Have latency chart ready in case attendees ask about multi-user concurrency.',
      publicNotes: 'Sync metrics verified: Under 12ms WebSocket roundtrip for collaborative cursor broadcasts.',
      voiceNotes: [],
    },
    elements: [
      {
        id: 'el-down-md-1',
        type: 'markdown',
        x: 48,
        y: 80,
        width: 1000,
        height: 230,
        content: `### 📊 Real-Time Benchmark Comparisons

| Metric | Traditional Slides | Infinideck | Optimization Factor |
| :--- | :--- | :--- | :--- |
| Slide Transition Latency | 320ms (full unmount/remount) | **< 16ms (matrix camera fly)** | **20x faster** |
| Multi-User Cursor Jitter | 120ms polling interval | **< 8ms binary broadcast** | **15x smoother** |
| Media Re-encoding Cost | Server-side transcoding | **Zero (client HTML5 embed)** | **Instant** |
| Non-Linear Exploration | Impossible without hyperlinking | **Native 2D Up/Down/Left/Right** | **Infinite freedom** |`,
        style: {
          fontSize: 14,
          fontFamily: 'mono',
          color: '#d1fae5',
          backgroundColor: '#062017',
          borderColor: '#047857',
          borderWidth: 1,
          borderRadius: 8,
        }
      },
      {
        id: 'el-down-img-1',
        type: 'image',
        x: 48,
        y: 330,
        width: 480,
        height: 230,
        mediaUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80',
        style: {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#05966940',
        }
      },
      {
        id: 'el-down-md-2',
        type: 'markdown',
        x: 550,
        y: 330,
        width: 498,
        height: 230,
        content: `### 🎯 Appendix Takeaway

> "Spatial decks eliminate the cognitive friction of hierarchical presentation trees. Attendees can drill down into engineering specifics without losing their place on the main stage."

* Press **Arrow Up** or click **↑** in the left Navigation Pane to return to the active presentation slide.`,
        style: {
          fontSize: 15,
          fontFamily: 'sans',
          color: '#a7f3d0',
          backgroundColor: '#0a231a',
          borderColor: '#05966940',
          borderWidth: 1,
          borderRadius: 8,
        }
      }
    ]
  },

  // FUTURE MEETING (Right: x = +1300)
  {
    id: 'slide-future-1',
    title: 'Sprint 43 Planning & Q4 Horizons',
    subtitle: 'Upcoming Milestones & Deliverables',
    type: 'meeting',
    timelineCategory: 'future',
    meetingContext: {
      date: 'Sept 26, 2026',
      time: '3:00 PM UTC',
      attendees: ['Elena Rostova', 'Marcus Chen', 'Product Council'],
      status: 'future',
      summary: 'Q4 roadmap lock-in, client deployment tests, and presentation template library.',
      agendaItem: 'Upcoming Milestone',
    },
    x: 1300,
    y: 0,
    width: 1100,
    height: 620,
    theme: {
      bg: '#141218',
      text: '#faf5ff',
      accent: '#a855f7',
      border: '#a855f740',
    },
    orderIndex: 2,
    notes: {
      privateNotes: 'Prepare cost estimation models before presenting this slide to VP of Engineering.',
      publicNotes: 'Goals for next sprint: multi-tier permissions, cloud storage sync, and custom theme presets.',
      voiceNotes: [
        {
          id: 'vn-fut-1',
          title: 'David Kim: Q4 Scope Review',
          duration: 41,
          createdAt: 'Drafted yesterday',
          isPublic: true,
          author: 'David Kim',
          transcript: 'Next week we will review the presentation export formats. We need both PDF vector rendering and interactive standalone HTML export.',
        }
      ],
    },
    elements: [
      {
        id: 'el-fut-md-1',
        type: 'markdown',
        x: 48,
        y: 80,
        width: 480,
        height: 250,
        content: `### 🔮 Future Agenda & Commitments

* **Multi-Format Export**: Full high-res PDF generation + standalone self-contained HTML
* **Keynote & PPTX Importer**: One-click slide unpacker with visual frame placement
* **Enterprise Collaboration**: Room tokens, presence pins, and voice sync
* **Audio Voice Notes**: Offline caching and live waveforms`,
        style: {
          fontSize: 16,
          fontFamily: 'sans',
          color: '#f3e8ff',
          backgroundColor: '#1e1826',
          borderColor: '#a855f730',
          borderWidth: 1,
          borderRadius: 8,
        }
      },
      {
        id: 'el-fut-img-1',
        type: 'image',
        x: 560,
        y: 80,
        width: 490,
        height: 250,
        mediaUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
        style: {
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#a855f730',
        }
      },
      {
        id: 'el-fut-md-2',
        type: 'markdown',
        x: 48,
        y: 350,
        width: 1000,
        height: 220,
        content: `### 🗓️ Upcoming Sprint Schedule

> **Monday Sep 22**: User testing session with 15 design leads  
> **Wednesday Sep 24**: Security audit of export sanitization  
> **Friday Sep 26**: Sprint 43 live review right here on this slide!

*Click **+ Add Future Meeting** on the right to append Sprint 44.*`,
        style: {
          fontSize: 15,
          fontFamily: 'sans',
          color: '#e9d5ff',
          backgroundColor: '#1b1523',
          borderColor: '#581c87',
          borderWidth: 1,
          borderRadius: 8,
        }
      }
    ],
  }
];
