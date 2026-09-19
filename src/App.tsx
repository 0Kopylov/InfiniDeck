import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Slide, Viewport, CanvasElement, PaintStroke, PaintTool, ToolMode, Collaborator, ChatMessage } from './types';
import { INITIAL_SLIDES } from './utils/sampleDeck';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { TimelineBar } from './components/TimelineBar';
import { Minimap } from './components/Minimap';
import { NotesDrawer } from './components/NotesDrawer';
import { ChatDrawer } from './components/ChatDrawer';
import { ImportExportModal } from './components/ImportExportModal';
import { PresentationMode } from './components/PresentationMode';
import { NavigationPane, getAdjacentSlide } from './components/NavigationPane';
import { CollaborationService } from './services/websocket';
import { Share2, Sparkles, Check, Copy } from 'lucide-react';

const USER_COLORS = ['#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fb923c', '#fbbf24'];

export default function App() {
  // Current user identity
  const [currentUser] = useState<Collaborator>(() => {
    const randomColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    return {
      id: `user-${Math.random().toString(36).substring(2, 7)}`,
      name: 'You (Presenter)',
      color: randomColor,
      lastActive: Date.now(),
    };
  });

  // Presentation State
  const [slides, setSlides] = useState<Slide[]>(() => {
    try {
      const saved = localStorage.getItem('canvas_deck_slides');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored slides only had 3 horizontal slides, merge initial vertical branch slides
          const hasVertical = parsed.some((s: Slide) => s.y !== 0);
          if (!hasVertical && parsed.length <= 3) {
            const upSlide = INITIAL_SLIDES.find((s) => s.id === 'slide-up-1');
            const downSlide = INITIAL_SLIDES.find((s) => s.id === 'slide-down-1');
            const enriched = [...parsed];
            if (upSlide && !enriched.find((s) => s.id === upSlide.id)) enriched.push(upSlide);
            if (downSlide && !enriched.find((s) => s.id === downSlide.id)) enriched.push(downSlide);
            return enriched;
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_SLIDES;
  });

  const [selectedSlideId, setSelectedSlideId] = useState<string | null>('slide-current-1');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Viewport State
  const [viewport, setViewport] = useState<Viewport>({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - 550 : 200,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 310 : 150,
    zoom: 0.85,
  });

  // Tools & Annotations
  const [toolMode, setToolMode] = useState<ToolMode>('select');
  const [isPaintingActive, setIsPaintingActive] = useState(false);
  const [paintTool, setPaintTool] = useState<PaintTool>('pen');
  const [brushColor, setBrushColor] = useState('#38bdf8');
  const [brushSize, setBrushSize] = useState(4);
  const [paintStrokes, setPaintStrokes] = useState<PaintStroke[]>([]);

  // Collaboration & Real-Time
  const [collaborators, setCollaborators] = useState<Collaborator[]>([currentUser]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const collabServiceRef = useRef<CollaborationService | null>(null);

  // Drawers, Modals & Navigation Pane
  const [isNavPaneOpen, setIsNavPaneOpen] = useState(true);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Persistence to local storage
  useEffect(() => {
    try {
      localStorage.setItem('canvas_deck_slides', JSON.stringify(slides));
    } catch {
      // storage quota
    }
  }, [slides]);

  // Navigation transition direction for per-slide canvas transitions
  const [navDirection, setNavDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  // Navigate to slide canvas with 2D directional motion
  const navigateToSlide = useCallback(
    (targetSlideId: string, explicitDirection?: 'up' | 'down' | 'left' | 'right') => {
      if (targetSlideId === selectedSlideId) return;

      const currentSlide = slides.find((s) => s.id === selectedSlideId);
      const targetSlide = slides.find((s) => s.id === targetSlideId);

      let direction = explicitDirection;
      if (!direction && currentSlide && targetSlide) {
        const dx = targetSlide.x - currentSlide.x;
        const dy = targetSlide.y - currentSlide.y;
        if (Math.abs(dx) >= Math.abs(dy)) {
          direction = dx >= 0 ? 'right' : 'left';
        } else {
          direction = dy >= 0 ? 'down' : 'up';
        }
      }

      setNavDirection(direction || null);
      setSelectedSlideId(targetSlideId);
      // Center slide in its canvas workspace
      setViewport((prev) => ({ ...prev, x: 0, y: 0 }));
    },
    [selectedSlideId, slides]
  );

  // Connect WebSocket for live collaboration
  useEffect(() => {
    const service = new CollaborationService(currentUser);
    collabServiceRef.current = service;

    service.connect({
      onInit: (data) => {
        if (data.users && data.users.length > 0) {
          setCollaborators((prev) => {
            const map = new Map<string, Collaborator>();
            [...prev, ...data.users].forEach((u) => map.set(u.id, u));
            return Array.from(map.values());
          });
        }
        if (data.messages) setChatMessages(data.messages);
        if (data.paintStrokes) setPaintStrokes(data.paintStrokes);
      },
      onUserJoined: (user) => {
        setCollaborators((prev) => {
          if (prev.find((u) => u.id === user.id)) return prev;
          return [...prev, user];
        });
      },
      onUserLeft: (userId) => {
        setCollaborators((prev) => prev.filter((u) => u.id !== userId));
      },
      onCursorUpdate: (userId, cursor) => {
        setCollaborators((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, cursor, lastActive: Date.now() } : u))
        );
      },
      onPaintStroke: (stroke) => {
        setPaintStrokes((prev) => [...prev, stroke]);
      },
      onPaintClear: (slideId) => {
        if (slideId) {
          setPaintStrokes((prev) => prev.filter((s) => s.slideId !== slideId));
        } else {
          setPaintStrokes([]);
        }
      },
      onChatMessage: (message) => {
        setChatMessages((prev) => [...prev, message]);
      },
    });

    return () => {
      service.disconnect();
    };
  }, [currentUser]);

  // Cursor Move Emitter
  const handleCursorMove = useCallback((worldX: number, worldY: number, slideId?: string) => {
    collabServiceRef.current?.sendCursor(worldX, worldY, slideId);
  }, []);

  // Stroke Emitter
  const handleAddStroke = useCallback((stroke: PaintStroke) => {
    setPaintStrokes((prev) => [...prev, stroke]);
    collabServiceRef.current?.sendStroke(stroke);
  }, []);

  // Clear Paint
  const handleClearSlidePaint = useCallback(() => {
    if (!selectedSlideId) return;
    setPaintStrokes((prev) => prev.filter((s) => s.slideId !== selectedSlideId));
    collabServiceRef.current?.sendPaintClear(selectedSlideId);
  }, [selectedSlideId]);

  // Send Chat Message
  const handleSendMessage = useCallback((text: string) => {
    collabServiceRef.current?.sendChat(text);
  }, []);

  // Simulate Collaborators for demo
  const handleSimulateCollaborator = () => {
    const simUser: Collaborator = {
      id: `sim-${Date.now()}`,
      name: ['Alex Rivera', 'Chloe Zhao', 'Liam O\'Connor', 'Siddharth Roy'][Math.floor(Math.random() * 4)],
      color: USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)],
      cursor: {
        x: (selectedSlideId ? slides.find((s) => s.id === selectedSlideId)?.x || 0 : 0) + 300,
        y: (selectedSlideId ? slides.find((s) => s.id === selectedSlideId)?.y || 0 : 0) + 200,
      },
      lastActive: Date.now(),
    };

    setCollaborators((prev) => [...prev, simUser]);

    // Send a sample chat message
    const sampleChats = [
      'The spatial timeline on the left gives great context on past decisions!',
      'Can you zoom into the architecture slide?',
      'I added my voice note feedback in the notes tab.',
      'Love that we can draw right over this diagram live!',
    ];
    setTimeout(() => {
      const msg: ChatMessage = {
        id: `sim-msg-${Date.now()}`,
        senderId: simUser.id,
        senderName: simUser.name,
        senderColor: simUser.color,
        text: sampleChats[Math.floor(Math.random() * sampleChats.length)],
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, msg]);
    }, 1200);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        setIsPresentationMode((prev) => !prev);
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZenMode((prev) => !prev);
      } else if (e.key === 'v' || e.key === 'V') {
        setToolMode('select');
        setIsPaintingActive(false);
      } else if (e.key === 'h' || e.key === 'H') {
        setToolMode('hand');
        setIsPaintingActive(false);
      } else if (e.key === 'd' || e.key === 'D') {
        setIsPaintingActive((prev) => !prev);
      } else if (e.key === 'n' || e.key === 'N') {
        setIsNotesOpen((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        setIsChatOpen((prev) => !prev);
      } else if (e.key === '[' || e.key === ']') {
        setIsNavPaneOpen((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        const next = getAdjacentSlide('right', selectedSlideId, slides);
        if (next) {
          navigateToSlide(next.id, 'right');
        } else {
          // Fallback to sorted array navigation if strictly horizontal
          const sorted = [...slides].sort((a, b) => a.x - b.x);
          const currentIndex = sorted.findIndex((s) => s.id === selectedSlideId);
          if (currentIndex < sorted.length - 1) {
            navigateToSlide(sorted[currentIndex + 1].id, 'right');
          }
        }
      } else if (e.key === 'ArrowLeft') {
        const next = getAdjacentSlide('left', selectedSlideId, slides);
        if (next) {
          navigateToSlide(next.id, 'left');
        } else {
          const sorted = [...slides].sort((a, b) => a.x - b.x);
          const currentIndex = sorted.findIndex((s) => s.id === selectedSlideId);
          if (currentIndex > 0) {
            navigateToSlide(sorted[currentIndex - 1].id, 'left');
          }
        }
      } else if (e.key === 'ArrowUp') {
        const next = getAdjacentSlide('up', selectedSlideId, slides);
        if (next) {
          navigateToSlide(next.id, 'up');
        }
      } else if (e.key === 'ArrowDown') {
        const next = getAdjacentSlide('down', selectedSlideId, slides);
        if (next) {
          navigateToSlide(next.id, 'down');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides, selectedSlideId, navigateToSlide]);

  // 4-Directional Non-Linear Branching (Up, Down, Left, Right)
  const handleAddBranchSlide = (direction: 'up' | 'down' | 'left' | 'right', refSlideId?: string) => {
    if (direction === 'left') {
      handleAddPastMeeting(refSlideId);
      return;
    }
    if (direction === 'right') {
      handleAddFutureMeeting(refSlideId);
      return;
    }

    const refSlide =
      slides.find((s) => s.id === refSlideId) ||
      slides.find((s) => s.id === selectedSlideId) ||
      slides[0];

    const newX = refSlide ? refSlide.x : 0;
    const isUp = direction === 'up';
    const newY = isUp
      ? (refSlide ? refSlide.y - refSlide.height - 160 : -780)
      : (refSlide ? refSlide.y + refSlide.height + 160 : 780);

    const newId = `slide-${direction}-${Date.now()}`;

    const newSlide: Slide = {
      id: newId,
      title: isUp ? 'Technical Sub-Topic: Architecture Deep Dive' : 'Supporting Appendix & Benchmark Data',
      subtitle: isUp
        ? 'Branch (Up): Subpixel Transform & System Engine'
        : 'Branch (Down): Real-Time Telemetry & Verification',
      type: 'slide',
      timelineCategory: 'current',
      meetingContext: {
        date: isUp ? 'Sub-Topic Deep Dive' : 'Telemetry Appendix',
        status: 'present',
        summary: isUp
          ? 'Architectural breakdown and schema design for spatial matrix execution.'
          : 'Detailed backup metrics, real-time sync performance, and stress tests.',
        agendaItem: isUp ? 'Branch (Up)' : 'Branch (Down)',
      },
      x: newX,
      y: newY,
      width: 1100,
      height: 620,
      theme: {
        bg: isUp ? '#0c141f' : '#0a1712',
        text: isUp ? '#f0f9ff' : '#f0fdf4',
        accent: isUp ? '#38bdf8' : '#10b981',
        border: isUp ? '#0284c750' : '#05966950',
      },
      elements: [
        {
          id: `el-${direction}-${Date.now()}-1`,
          type: 'markdown',
          x: 48,
          y: 80,
          width: 580,
          height: 440,
          content: isUp
            ? `### 🚀 Deep Dive: Sub-Topic Architecture\n\n* **Branch Focus**: High-resolution technical details\n* **Context**: Branched from "${refSlide?.title || 'Main Slide'}"\n* **Return Navigation**: Press **Arrow Down** or click **↓** in the left Navigation Pane to return!\n\nDouble-click to customize your sub-topic notes, upload images, or embed video.`
            : `### 📊 Supporting Appendix & Telemetry\n\n* **Data Backup**: Detailed tables, benchmark records, and methodology\n* **Spatial Position**: Below "${refSlide?.title || 'Main Slide'}"\n* **Return Navigation**: Press **Arrow Up** or click **↑** in the left Navigation Pane to return!\n\nDouble-click to format tables or paste charts.`,
          style: {
            fontSize: 16,
            fontFamily: 'sans',
            color: isUp ? '#e0f2fe' : '#d1fae5',
            backgroundColor: isUp ? '#101e2e' : '#062017',
            borderColor: isUp ? '#0284c750' : '#047857',
            borderWidth: 1,
            borderRadius: 8,
          },
        },
      ],
      notes: {
        privateNotes: isUp
          ? 'Presenter cue: Be prepared to walk through code and latency specs.'
          : 'Presenter cue: Keep this open during audience Q&A for backing data.',
        publicNotes: isUp
          ? 'Architecture documentation attached to this branch.'
          : 'Appendix materials available for team review.',
        voiceNotes: [],
      },
      orderIndex: slides.length,
    };

    setSlides((prev) => [...prev, newSlide]);
    setNavDirection(direction);
    setSelectedSlideId(newId);
    setViewport((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  // Non-linear Slide Adders: Left (Past) & Right (Future)
  const handleAddPastMeeting = (refSlideId?: string) => {
    const refSlide = slides.find((s) => s.id === refSlideId) || slides[0];
    const newX = refSlide ? refSlide.x - refSlide.width - 200 : -1300;
    const newId = `slide-past-${Date.now()}`;

    const newSlide: Slide = {
      id: newId,
      title: 'Previous Meeting & Alignment',
      subtitle: 'Context, Historical Decisions & Retrospective',
      type: 'meeting',
      timelineCategory: 'past',
      meetingContext: {
        date: new Date(Date.now() - 7 * 86400000).toLocaleDateString(),
        status: 'past',
        summary: 'Review of preceding milestone outcomes and architectural decisions.',
      },
      x: newX,
      y: refSlide ? refSlide.y : 0,
      width: 1100,
      height: 620,
      theme: {
        bg: '#121318',
        text: '#f4f4f5',
        accent: '#6366f1',
        border: '#27272a',
      },
      elements: [
        {
          id: `el-${Date.now()}-1`,
          type: 'markdown',
          x: 48,
          y: 80,
          width: 580,
          height: 440,
          content: `### ⏪ Preceding Meeting Minutes\n\n* **Meeting Date**: ${new Date(Date.now() - 7 * 86400000).toLocaleDateString()}\n* **Key Alignments**: Agreed on horizontal timeline branching\n* **Archived Items**: Deprecated rigid slide decks\n\nDouble-click this text box to customize this past meeting's notes.`,
          style: {
            fontSize: 16,
            fontFamily: 'sans',
            color: '#e2e8f0',
            backgroundColor: '#181820',
            borderColor: '#312e81',
            borderWidth: 1,
            borderRadius: 8,
          },
        },
      ],
      notes: {
        privateNotes: 'Check with team if follow-ups from this meeting were completed.',
        publicNotes: 'Approved minutes from previous alignment session.',
        voiceNotes: [],
      },
      orderIndex: -1,
    };

    setSlides((prev) => [newSlide, ...prev]);
    setNavDirection('left');
    setSelectedSlideId(newId);
    setViewport((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  const handleAddFutureMeeting = (refSlideId?: string) => {
    const refSlide = slides.find((s) => s.id === refSlideId) || slides[slides.length - 1];
    const newX = refSlide ? refSlide.x + refSlide.width + 200 : 1300;
    const newId = `slide-future-${Date.now()}`;

    const newSlide: Slide = {
      id: newId,
      title: 'Upcoming Milestone Alignment',
      subtitle: 'Future Roadmap & Action Commitments',
      type: 'meeting',
      timelineCategory: 'future',
      meetingContext: {
        date: new Date(Date.now() + 7 * 86400000).toLocaleDateString(),
        status: 'future',
        summary: 'Next phase deliverables, customer feedback synthesis, and launch targets.',
      },
      x: newX,
      y: refSlide ? refSlide.y : 0,
      width: 1100,
      height: 620,
      theme: {
        bg: '#171220',
        text: '#faf5ff',
        accent: '#a855f7',
        border: '#a855f740',
      },
      elements: [
        {
          id: `el-${Date.now()}-2`,
          type: 'markdown',
          x: 48,
          y: 80,
          width: 580,
          height: 440,
          content: `### ⏩ Next Milestone Objectives\n\n* **Target Date**: ${new Date(Date.now() + 7 * 86400000).toLocaleDateString()}\n* **Deliverable 1**: Complete multi-format PDF & HTML export tests\n* **Deliverable 2**: Voice notes waveform sync\n* **Deliverable 3**: Real-time collaborative paint-over stress test\n\nAdd upcoming items here.`,
          style: {
            fontSize: 16,
            fontFamily: 'sans',
            color: '#f3e8ff',
            backgroundColor: '#201828',
            borderColor: '#581c87',
            borderWidth: 1,
            borderRadius: 8,
          },
        },
      ],
      notes: {
        privateNotes: 'Prepare review slides 2 days prior to this meeting.',
        publicNotes: 'Draft agenda for next week alignment.',
        voiceNotes: [],
      },
      orderIndex: 99,
    };

    setSlides((prev) => [...prev, newSlide]);
    setNavDirection('right');
    setSelectedSlideId(newId);
    setViewport((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  // Duplicate Slide
  const handleDuplicateSlide = (slideId: string) => {
    const source = slides.find((s) => s.id === slideId);
    if (!source) return;

    const newId = `slide-copy-${Date.now()}`;
    const duplicated: Slide = {
      ...source,
      id: newId,
      title: `${source.title} (Copy)`,
      x: source.x + 120,
      y: source.y + 120,
      elements: source.elements.map((el) => ({ ...el, id: `el-${Date.now()}-${Math.random()}` })),
    };

    setSlides((prev) => [...prev, duplicated]);
    setNavDirection('right');
    setSelectedSlideId(newId);
    setViewport((prev) => ({ ...prev, x: 0, y: 0 }));
  };

  // Delete Slide
  const handleDeleteSlide = (slideId: string) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((s) => s.id !== slideId));
    if (selectedSlideId === slideId) {
      const remaining = slides.filter((s) => s.id !== slideId);
      if (remaining.length > 0) {
        navigateToSlide(remaining[0].id);
      }
    }
  };

  // Element additions to active slide
  const handleAddTextElement = () => {
    const active = slides.find((s) => s.id === selectedSlideId) || slides[0];
    if (!active) return;

    const newEl: CanvasElement = {
      id: `el-text-${Date.now()}`,
      type: 'markdown',
      x: 100,
      y: 100,
      width: 460,
      height: 220,
      content: '### New Text Block\n\n*Double-click to edit with rich formatting (bold, italic, colors, strikethrough)*',
      style: {
        fontSize: 16,
        fontFamily: 'sans',
        color: '#ffffff',
        backgroundColor: '#18181b',
        borderColor: '#3f3f46',
        borderWidth: 1,
        borderRadius: 8,
      },
    };

    setSlides((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, elements: [...s.elements, newEl] } : s))
    );
    setSelectedElementId(newEl.id);
  };

  const handleAddImageElement = () => {
    const active = slides.find((s) => s.id === selectedSlideId) || slides[0];
    if (!active) return;

    const newEl: CanvasElement = {
      id: `el-img-${Date.now()}`,
      type: 'image',
      x: 120,
      y: 120,
      width: 440,
      height: 260,
      mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
      style: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#27272a',
      },
    };

    setSlides((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, elements: [...s.elements, newEl] } : s))
    );
    setSelectedElementId(newEl.id);
  };

  const handleAddYouTubeElement = () => {
    const active = slides.find((s) => s.id === selectedSlideId) || slides[0];
    if (!active) return;

    const newEl: CanvasElement = {
      id: `el-yt-${Date.now()}`,
      type: 'youtube',
      x: 140,
      y: 140,
      width: 480,
      height: 270,
      youtubeId: 'dQw4w9WgXcQ',
      mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      style: {
        borderRadius: 8,
      },
    };

    setSlides((prev) =>
      prev.map((s) => (s.id === active.id ? { ...s, elements: [...s.elements, newEl] } : s))
    );
    setSelectedElementId(newEl.id);
  };

  // Zoom helpers
  const handleZoomIn = () => {
    setViewport((v) => ({ ...v, zoom: Math.min(4.0, v.zoom * 1.25) }));
  };

  const handleZoomOut = () => {
    setViewport((v) => ({ ...v, zoom: Math.max(0.12, v.zoom * 0.8) }));
  };

  const handleZoomReset = () => {
    setViewport({
      x: 0,
      y: 0,
      zoom: 1.0,
    });
  };

  const handleZoomFitAll = () => {
    setViewport({
      x: 0,
      y: 0,
      zoom: 1.0,
    });
  };

  const activeSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];

  const totalNotesCount =
    (activeSlide?.notes.privateNotes ? 1 : 0) +
    (activeSlide?.notes.publicNotes ? 1 : 0) +
    (activeSlide?.notes.voiceNotes?.length || 0);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 font-sans text-neutral-100 flex flex-col">
      {/* Collapsible Left Navigation Pane (Up/Down/Left/Right 2D Spatial Switcher & Explorer) */}
      {!isZenMode && !isPresentationMode && (
        <NavigationPane
          slides={slides}
          selectedSlideId={selectedSlideId}
          onSelectSlide={(id, dir) => navigateToSlide(id, dir)}
          onAddBranchSlide={handleAddBranchSlide}
          onDuplicateSlide={handleDuplicateSlide}
          onDeleteSlide={handleDeleteSlide}
          onZoomFitAll={handleZoomFitAll}
          isOpen={isNavPaneOpen}
          onToggleOpen={() => setIsNavPaneOpen((prev) => !prev)}
          onUpdateSlide={(id, updated) =>
            setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
          }
        />
      )}

      {/* Top Center Meeting Timeline Ribbon */}
      {!isZenMode && !isPresentationMode && (
        <TimelineBar
          slides={slides}
          selectedSlideId={selectedSlideId}
          onSelectSlide={(id) => navigateToSlide(id)}
          onAddPastMeeting={() => handleAddPastMeeting()}
          onAddFutureMeeting={() => handleAddFutureMeeting()}
          onZoomFitAll={handleZoomFitAll}
        />
      )}

      {/* Main Slide-as-Canvas with 2D Non-Linear Spatial Navigation */}
      <Canvas
        slides={slides}
        viewport={viewport}
        onUpdateViewport={setViewport}
        selectedSlideId={selectedSlideId}
        navDirection={navDirection}
        selectedElementId={selectedElementId}
        toolMode={toolMode}
        isPaintingActive={isPaintingActive}
        paintTool={paintTool}
        brushColor={brushColor}
        brushSize={brushSize}
        paintStrokes={paintStrokes}
        collaborators={collaborators}
        currentUserId={currentUser.id}
        currentUserName={currentUser.name}
        currentUserColor={currentUser.color}
        onSelectSlide={(id, dir) => id && navigateToSlide(id, dir)}
        onNavigateDirection={(dir) => {
          const next = getAdjacentSlide(dir, selectedSlideId, slides);
          if (next) navigateToSlide(next.id, dir);
        }}
        onAddBranchSlide={handleAddBranchSlide}
        onSelectElement={(id) => setSelectedElementId(id)}
        onUpdateSlide={(id, updated) =>
          setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
        }
        onDeleteSlide={handleDeleteSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onAddStroke={handleAddStroke}
        onAddElementToSlide={(slideId, el) =>
          setSlides((prev) =>
            prev.map((s) => (s.id === slideId ? { ...s, elements: [...s.elements, el] } : s))
          )
        }
        onUpdateElementInSlide={(slideId, elId, updated) =>
          setSlides((prev) =>
            prev.map((s) =>
              s.id === slideId
                ? {
                    ...s,
                    elements: s.elements.map((el) => (el.id === elId ? { ...el, ...updated } : el)),
                  }
                : s
            )
          )
        }
        onDeleteElementInSlide={(slideId, elId) =>
          setSlides((prev) =>
            prev.map((s) =>
              s.id === slideId
                ? {
                    ...s,
                    elements: s.elements.filter((el) => el.id !== elId),
                  }
                : s
            )
          )
        }
        onOpenNotes={(slideId) => {
          setSelectedSlideId(slideId);
          setIsNotesOpen(true);
        }}
        onCursorMove={handleCursorMove}
      />

      {/* Minimap in bottom right with 2D radar */}
      {!isZenMode && !isPresentationMode && (
        <Minimap
          slides={slides}
          viewport={viewport}
          selectedSlideId={selectedSlideId}
          onSelectSlide={(id) => navigateToSlide(id)}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFitAll}
          onZoomReset={handleZoomReset}
        />
      )}

      {/* Floating Minimalist Dock */}
      {!isZenMode && !isPresentationMode && (
        <Toolbar
          toolMode={toolMode}
          onSetToolMode={setToolMode}
          isPaintingActive={isPaintingActive}
          onTogglePaint={() => setIsPaintingActive(!isPaintingActive)}
          paintTool={paintTool}
          onSetPaintTool={setPaintTool}
          brushColor={brushColor}
          onSetBrushColor={setBrushColor}
          brushSize={brushSize}
          onSetBrushSize={setBrushSize}
          onClearSlidePaint={handleClearSlidePaint}
          onAddTextElement={handleAddTextElement}
          onAddImageElement={handleAddImageElement}
          onAddYouTubeElement={handleAddYouTubeElement}
          onOpenNotes={() => setIsNotesOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenImportExport={() => setIsImportExportOpen(true)}
          onStartPresentation={() => setIsPresentationMode(true)}
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode(true)}
          collaborators={collaborators}
          onSimulateCollaborator={handleSimulateCollaborator}
          notesCount={totalNotesCount}
          chatCount={chatMessages.length}
        />
      )}

      {/* Zen Mode Restore Trigger in Corner */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-xs text-neutral-300 border border-neutral-700 shadow-xl backdrop-blur-md transition"
        >
          Exit Zen Mode (Press 'Z')
        </button>
      )}

      {/* Written and Voice Notes Drawer (Private & Public) */}
      <NotesDrawer
        slide={activeSlide}
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        onUpdateNotes={(updatedNotes) => {
          if (!activeSlide) return;
          setSlides((prev) =>
            prev.map((s) => (s.id === activeSlide.id ? { ...s, notes: updatedNotes } : s))
          );
        }}
        currentUserName={currentUser.name}
      />

      {/* Live Collaboration Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        collaborators={collaborators}
        onSendMessage={handleSendMessage}
        currentUserId={currentUser.id}
      />

      {/* Import & Export Modal (PPTX, Keynote, PDF, HTML, JSON) */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        slides={slides}
        paintStrokes={paintStrokes}
        selectedSlideId={selectedSlideId}
        onImportSlides={(newSlides, mode) => {
          if (mode === 'replace') {
            setSlides(newSlides);
            if (newSlides.length > 0) navigateToSlide(newSlides[0].id);
          } else {
            setSlides((prev) => [...prev, ...newSlides]);
            if (newSlides.length > 0) navigateToSlide(newSlides[0].id);
          }
        }}
      />

      {/* Fullscreen Distraction-Free Presentation Mode */}
      {isPresentationMode && (
        <PresentationMode
          slides={slides}
          currentSlideIndex={Math.max(0, slides.findIndex((s) => s.id === selectedSlideId))}
          paintStrokes={paintStrokes}
          onSlideChange={(newIdx) => {
            const nextSlide = slides[newIdx];
            if (nextSlide) {
              setSelectedSlideId(nextSlide.id);
            }
          }}
          onExit={() => setIsPresentationMode(false)}
          onAddStroke={handleAddStroke}
          userId={currentUser.id}
          userName={currentUser.name}
          userColor={currentUser.color}
        />
      )}
    </div>
  );
}
