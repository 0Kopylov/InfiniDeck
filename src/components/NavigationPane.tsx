import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  X,
  FileText,
  Map as MapIcon,
  List as ListIcon,
  Maximize,
  Minimize,
  ArrowRight,
  ArrowDown,
  Navigation,
} from 'lucide-react';
import { Slide } from '../types';

interface NavigationPaneProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (slideId: string, direction?: 'up' | 'down' | 'left' | 'right') => void;
  onAddBranchSlide: (direction: 'up' | 'down' | 'left' | 'right', referenceSlideId?: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  onZoomFitAll: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateSlide?: (slideId: string, updated: Partial<Slide>) => void;
}

export function getAdjacentSlide(
  direction: 'up' | 'down' | 'left' | 'right',
  currentSlideId: string | null,
  slides: Slide[]
): Slide | null {
  const currentSlide = slides.find((s) => s.id === currentSlideId) || slides[0];
  if (!currentSlide) return null;

  const threshold = 50;

  if (direction === 'right') {
    const candidates = slides.filter(
      (s) => s.id !== currentSlide.id && s.x > currentSlide.x + threshold
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, s) => {
      const bestScore = (best.x - currentSlide.x) + 1.8 * Math.abs(best.y - currentSlide.y);
      const score = (s.x - currentSlide.x) + 1.8 * Math.abs(s.y - currentSlide.y);
      return score < bestScore ? s : best;
    });
  }

  if (direction === 'left') {
    const candidates = slides.filter(
      (s) => s.id !== currentSlide.id && s.x < currentSlide.x - threshold
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, s) => {
      const bestScore = (currentSlide.x - best.x) + 1.8 * Math.abs(best.y - currentSlide.y);
      const score = (currentSlide.x - s.x) + 1.8 * Math.abs(s.y - currentSlide.y);
      return score < bestScore ? s : best;
    });
  }

  if (direction === 'up') {
    const candidates = slides.filter(
      (s) => s.id !== currentSlide.id && s.y < currentSlide.y - threshold
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, s) => {
      const bestScore = (currentSlide.y - best.y) + 1.8 * Math.abs(best.x - currentSlide.x);
      const score = (currentSlide.y - s.y) + 1.8 * Math.abs(s.x - currentSlide.x);
      return score < bestScore ? s : best;
    });
  }

  if (direction === 'down') {
    const candidates = slides.filter(
      (s) => s.id !== currentSlide.id && s.y > currentSlide.y + threshold
    );
    if (candidates.length === 0) return null;
    return candidates.reduce((best, s) => {
      const bestScore = (best.y - currentSlide.y) + 1.8 * Math.abs(best.x - currentSlide.x);
      const score = (s.y - currentSlide.y) + 1.8 * Math.abs(s.x - currentSlide.x);
      return score < bestScore ? s : best;
    });
  }

  return null;
}

/**
 * Slide Thumbnail Card for Canvas display
 */
const SlideCanvasThumbnail: React.FC<{
  slide: Slide;
  index: number;
  isSelected: boolean;
  isMatch: boolean;
  navZoom: number;
  navPan: { x: number; y: number };
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddBranch: (dir: 'right' | 'down') => void;
  onDragStart: (e: React.MouseEvent, slide: Slide) => void;
  canDelete: boolean;
}> = ({
  slide,
  index,
  isSelected,
  isMatch,
  navZoom,
  navPan,
  onSelect,
  onDuplicate,
  onDelete,
  onAddBranch,
  onDragStart,
  canDelete,
}) => {
  const slideW = slide.width || 1100;
  const slideH = slide.height || 620;

  const screenX = slide.x * navZoom + navPan.x;
  const screenY = slide.y * navZoom + navPan.y;
  const screenW = slideW * navZoom;
  const screenH = slideH * navZoom;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${screenW}px`,
        height: `${screenH}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        onDragStart(e, slide);
      }}
      className={`group absolute rounded-xl border select-none transition-shadow cursor-pointer flex flex-col overflow-hidden ${
        isSelected
          ? 'ring-2 ring-sky-400 border-sky-400 shadow-[0_0_24px_rgba(56,189,248,0.45)] z-30'
          : 'border-neutral-700/80 hover:border-neutral-500 shadow-lg shadow-black/60 z-20'
      } ${!isMatch ? 'opacity-30' : 'opacity-100'}`}
      style-bg={{
        backgroundColor: slide.theme?.bg || '#171717',
      }}
    >
      {/* Background with slide theme */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: slide.theme?.bg || '#171717',
        }}
      />

      {/* Mini Titlebar */}
      <div className="relative z-10 px-2 py-1 bg-black/60 backdrop-blur-sm border-b border-white/10 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="px-1.5 py-0.2 rounded bg-white/20 text-[9px] font-mono font-bold text-white leading-tight">
            #{index + 1}
          </span>
          <span
            className="text-[10px] font-semibold truncate text-white leading-tight"
            title={slide.title}
          >
            {slide.title}
          </span>
        </div>

        {slide.timelineCategory && (
          <span
            className={`text-[8px] px-1 py-0.2 rounded uppercase tracking-wider font-bold shrink-0 ${
              slide.timelineCategory === 'past'
                ? 'bg-indigo-500/30 text-indigo-300'
                : slide.timelineCategory === 'future'
                ? 'bg-purple-500/30 text-purple-300'
                : 'bg-sky-500/30 text-sky-300'
            }`}
          >
            {slide.timelineCategory}
          </span>
        )}
      </div>

      {/* Miniature preview of elements */}
      <div className="relative flex-1 p-1.5 overflow-hidden pointer-events-none">
        {slide.elements.map((el) => {
          const leftPercent = Math.max(2, Math.min(88, (el.x / slideW) * 100));
          const topPercent = Math.max(2, Math.min(80, (el.y / slideH) * 100));
          const widthPercent = Math.max(14, Math.min(96 - leftPercent, (el.width / slideW) * 100));
          const heightPercent = Math.max(12, Math.min(94 - topPercent, (el.height / slideH) * 100));

          return (
            <div
              key={el.id}
              className="absolute overflow-hidden rounded-[2px]"
              style={{
                left: `${leftPercent}%`,
                top: `${topPercent}%`,
                width: `${widthPercent}%`,
                height: `${heightPercent}%`,
              }}
            >
              {el.type === 'image' && el.mediaUrl ? (
                <img
                  src={el.mediaUrl}
                  alt=""
                  className="w-full h-full object-cover rounded-[2px]"
                  loading="lazy"
                />
              ) : el.type === 'youtube' ? (
                <div className="w-full h-full bg-neutral-900/90 flex items-center justify-center relative rounded-[2px] overflow-hidden">
                  {el.youtubeId ? (
                    <img
                      src={`https://img.youtube.com/vi/${el.youtubeId}/mqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover opacity-70"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center shadow">
                    <Play className="w-1.5 h-1.5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              ) : (
                <div
                  className="w-full h-full p-0.5 text-[5px] leading-[6px] overflow-hidden break-words font-sans select-none rounded-[2px]"
                  style={{
                    backgroundColor: el.style?.backgroundColor || 'rgba(255, 255, 255, 0.08)',
                    color: el.style?.color || slide.theme?.text || '#d4d4d8',
                  }}
                >
                  {el.content ? el.content.replace(/[#*`_\[\]]/g, '').slice(0, 70) : 'Text block'}
                </div>
              )}
            </div>
          );
        })}

        {slide.elements.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-[8px] text-neutral-500 italic">
            Empty canvas
          </div>
        )}
      </div>

      {/* Slide footer info */}
      <div className="relative z-10 px-2 py-0.5 bg-black/50 text-[8px] text-neutral-400 flex items-center justify-between border-t border-white/5 pointer-events-none">
        <span>{slide.elements.length} items</span>
        {(slide.notes?.privateNotes || slide.notes?.publicNotes) && (
          <span className="flex items-center gap-0.5 text-amber-300">
            <FileText className="w-2 h-2" />
          </span>
        )}
      </div>

      {/* Hover Action Overlay */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-30 bg-neutral-900/90 p-0.5 rounded-md border border-neutral-700 shadow-md">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded"
          title="Duplicate slide"
        >
          <Copy className="w-2.5 h-2.5" />
        </button>
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-neutral-800 text-neutral-300 hover:text-red-400 rounded"
            title="Delete slide"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Quick Add Branch Buttons on Hover */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBranch('right');
          }}
          className="w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-400 text-white shadow-md flex items-center justify-center hover:scale-110 transition"
          title="Branch new slide right"
        >
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="absolute left-1/2 -bottom-3 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddBranch('down');
          }}
          className="w-5 h-5 rounded-full bg-sky-500 hover:bg-sky-400 text-white shadow-md flex items-center justify-center hover:scale-110 transition"
          title="Branch new slide down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const NavigationPane: React.FC<NavigationPaneProps> = ({
  slides,
  selectedSlideId,
  onSelectSlide,
  onAddBranchSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onZoomFitAll,
  isOpen,
  onToggleOpen,
  onUpdateSlide,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Navigation Canvas Viewport State (pan & zoom on thumbnail canvas)
  const [navPan, setNavPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [navZoom, setNavZoom] = useState<number>(0.16);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const isNavPanningRef = useRef(false);
  const navPanStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Dragging a slide thumbnail on canvas
  const isDraggingSlideRef = useRef<boolean>(false);
  const dragSlideRef = useRef<{
    slideId: string;
    startX: number;
    startY: number;
    initialSlideX: number;
    initialSlideY: number;
  } | null>(null);

  // Filter slides by search query
  const matchingSlideIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set(slides.map((s) => s.id));
    const query = searchQuery.toLowerCase();
    const matches = new Set<string>();
    slides.forEach((s) => {
      if (
        s.title.toLowerCase().includes(query) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(query)) ||
        (s.meetingContext?.summary && s.meetingContext.summary.toLowerCase().includes(query)) ||
        s.elements.some((el) => el.content && el.content.toLowerCase().includes(query))
      ) {
        matches.add(s.id);
      }
    });
    return matches;
  }, [slides, searchQuery]);

  // Fit all slide thumbnails inside the navigation canvas
  const handleFitAllOnCanvas = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container || slides.length === 0) return;

    const cw = container.clientWidth || 400;
    const ch = container.clientHeight || 360;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    slides.forEach((s) => {
      const sw = s.width || 1100;
      const sh = s.height || 620;
      minX = Math.min(minX, s.x);
      maxX = Math.max(maxX, s.x + sw);
      minY = Math.min(minY, s.y);
      maxY = Math.max(maxY, s.y + sh);
    });

    const worldW = Math.max(800, maxX - minX + 240);
    const worldH = Math.max(600, maxY - minY + 240);

    const scaleX = (cw - 60) / worldW;
    const scaleY = (ch - 60) / worldH;
    const computedZoom = Math.min(0.28, Math.max(0.06, Math.min(scaleX, scaleY)));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newPanX = cw / 2 - centerX * computedZoom;
    const newPanY = ch / 2 - centerY * computedZoom;

    setNavPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
    setNavZoom(computedZoom);
  }, [slides]);

  // Auto-fit on initial render or whenever pane is opened
  useEffect(() => {
    if (isOpen && viewMode === 'canvas') {
      const timer = setTimeout(() => {
        handleFitAllOnCanvas();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, viewMode, slides.length, handleFitAllOnCanvas]);

  // Wheel listener on navigation canvas: smooth zoom & pan
  const handleCanvasWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey || e.altKey) {
        // Zoom centered on cursor
        const zoomDelta = e.deltaY < 0 ? 1.15 : 0.87;
        const newZoom = Math.min(0.5, Math.max(0.04, navZoom * zoomDelta));

        const worldX = (mouseX - navPan.x) / navZoom;
        const worldY = (mouseY - navPan.y) / navZoom;

        const newPanX = mouseX - worldX * newZoom;
        const newPanY = mouseY - worldY * newZoom;

        setNavZoom(newZoom);
        setNavPan({ x: newPanX, y: newPanY });
      } else {
        // Smooth pan
        setNavPan((prev) => ({
          x: prev.x - e.deltaX * 0.8,
          y: prev.y - e.deltaY * 0.8,
        }));
      }
    },
    [navZoom, navPan]
  );

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleCanvasWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleCanvasWheel);
  }, [handleCanvasWheel]);

  // Pointer dragging handlers for canvas panning or slide dragging
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only pan if clicked on the canvas background
    if (e.target === canvasContainerRef.current || (e.target as HTMLElement).classList.contains('canvas-bg-target')) {
      isNavPanningRef.current = true;
      navPanStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: navPan.x,
        panY: navPan.y,
      };
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isNavPanningRef.current && navPanStartRef.current) {
      const dx = e.clientX - navPanStartRef.current.x;
      const dy = e.clientY - navPanStartRef.current.y;
      setNavPan({
        x: navPanStartRef.current.panX + dx,
        y: navPanStartRef.current.panY + dy,
      });
    } else if (isDraggingSlideRef.current && dragSlideRef.current && onUpdateSlide) {
      const dx = (e.clientX - dragSlideRef.current.startX) / navZoom;
      const dy = (e.clientY - dragSlideRef.current.startY) / navZoom;
      const newX = Math.round(dragSlideRef.current.initialSlideX + dx);
      const newY = Math.round(dragSlideRef.current.initialSlideY + dy);
      onUpdateSlide(dragSlideRef.current.slideId, { x: newX, y: newY });
    }
  };

  const handleCanvasPointerUp = () => {
    isNavPanningRef.current = false;
    navPanStartRef.current = null;
    isDraggingSlideRef.current = false;
    dragSlideRef.current = null;
  };

  // Thumbnail drag start
  const handleSlideDragStart = (e: React.MouseEvent, slide: Slide) => {
    e.stopPropagation();
    isDraggingSlideRef.current = true;
    dragSlideRef.current = {
      slideId: slide.id,
      startX: e.clientX,
      startY: e.clientY,
      initialSlideX: slide.x,
      initialSlideY: slide.y,
    };
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // -------------------------------------------------------------
  // COLLAPSED VIEW: Slim floating dock
  // -------------------------------------------------------------
  if (!isOpen) {
    return (
      <div className="fixed top-4 left-4 z-40 flex flex-col items-center gap-2">
        <button
          onClick={onToggleOpen}
          className="p-2.5 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800/90 rounded-2xl shadow-2xl backdrop-blur-xl transition group flex items-center justify-center"
          title="Open Slide Canvas Navigation Pane (])"
        >
          <PanelLeftOpen className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
        </button>

        <div
          onClick={onToggleOpen}
          className="px-2 py-1 bg-neutral-900/90 border border-neutral-800/90 rounded-xl shadow-lg backdrop-blur-md cursor-pointer hover:bg-neutral-800 transition text-[10px] font-mono text-neutral-400 flex items-center gap-1"
          title="Click to expand slide canvas directory"
        >
          <MapIcon className="w-3 h-3 text-sky-400" />
          <span>
            {slides.findIndex((s) => s.id === selectedSlideId) + 1}/{slides.length}
          </span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EXPANDED VIEW: Thumbnails ON CANVAS
  // -------------------------------------------------------------
  return (
    <div
      className={`fixed top-4 left-4 z-40 ${
        isExpanded ? 'w-[720px] h-[640px]' : 'w-[480px] h-[540px]'
      } max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] flex flex-col bg-neutral-900/95 border border-neutral-800/90 rounded-2xl shadow-2xl backdrop-blur-2xl text-neutral-200 overflow-hidden select-none transition-all duration-200`}
    >
      {/* Header */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-950/50">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-white tracking-tight leading-none">
                Canvas Navigation
              </h2>
              <span className="px-1.5 py-0.2 text-[9px] font-mono bg-sky-500/20 text-sky-400 rounded-md border border-sky-500/30">
                Spatial Map
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 leading-none">
              {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'} on canvas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Switch between Canvas thumbnails and compact list */}
          <div className="flex items-center bg-neutral-950/70 p-0.5 rounded-lg border border-neutral-800 mr-1">
            <button
              onClick={() => setViewMode('canvas')}
              className={`p-1 rounded text-xs transition ${
                viewMode === 'canvas'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Canvas Spatial Thumbnails"
            >
              <MapIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded text-xs transition ${
                viewMode === 'list'
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expand pane size toggle */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
            title={isExpanded ? 'Collapse pane size' : 'Expand pane size'}
          >
            {isExpanded ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
            title="Share presentation link"
          >
            {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Close navigation pane */}
          <button
            onClick={onToggleOpen}
            className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
            title="Close Canvas Navigation (])"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-neutral-800/80 bg-neutral-950/40 shrink-0 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search slides on canvas..."
            className="w-full pl-8 pr-7 py-1 bg-neutral-950/80 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {viewMode === 'canvas' && (
          <button
            onClick={handleFitAllOnCanvas}
            className="px-2 py-1 bg-neutral-800/90 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl text-[11px] font-medium transition flex items-center gap-1 border border-neutral-700/60"
            title="Fit all thumbnails on canvas"
          >
            <Maximize2 className="w-3 h-3 text-sky-400" />
            <span>Fit Canvas</span>
          </button>
        )}
      </div>

      {/* 
        MAIN CONTENT:
        VIEW MODE 1: THUMBNAILS ON CANVAS (Primary Default)
        VIEW MODE 2: COMPACT LIST OF THUMBNAILS
      */}
      {viewMode === 'canvas' ? (
        <div
          ref={canvasContainerRef}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerLeave={handleCanvasPointerUp}
          onDoubleClick={(e) => {
            if (e.target === canvasContainerRef.current) {
              handleFitAllOnCanvas();
            }
          }}
          className="canvas-bg-target relative flex-1 w-full h-full overflow-hidden bg-[#0a0a0f] cursor-grab active:cursor-grabbing select-none"
          style={{
            backgroundImage: `radial-gradient(#262626 1px, transparent 1px)`,
            backgroundSize: `${24 * (navZoom / 0.16)}px ${24 * (navZoom / 0.16)}px`,
            backgroundPosition: `${navPan.x}px ${navPan.y}px`,
          }}
        >
          {/* Spatial Branch & Adjacent Connecting Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
            <defs>
              <marker
                id="nav-arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="4"
                markerHeight="4"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" opacity="0.6" />
              </marker>
            </defs>
            {slides.map((sourceSlide) => {
              const rightAdj = getAdjacentSlide('right', sourceSlide.id, slides);
              const downAdj = getAdjacentSlide('down', sourceSlide.id, slides);

              const sw = (sourceSlide.width || 1100) * navZoom;
              const sh = (sourceSlide.height || 620) * navZoom;
              const sx = sourceSlide.x * navZoom + navPan.x;
              const sy = sourceSlide.y * navZoom + navPan.y;

              const lines: React.ReactNode[] = [];

              if (rightAdj) {
                const tx = rightAdj.x * navZoom + navPan.x;
                const ty = rightAdj.y * navZoom + navPan.y;
                const th = (rightAdj.height || 620) * navZoom;

                const startX = sx + sw;
                const startY = sy + sh / 2;
                const endX = tx;
                const endY = ty + th / 2;

                lines.push(
                  <path
                    key={`line-r-${sourceSlide.id}-${rightAdj.id}`}
                    d={`M ${startX} ${startY} C ${startX + 30} ${startY}, ${endX - 30} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.5"
                    markerEnd="url(#nav-arrow)"
                  />
                );
              }

              if (downAdj) {
                const tx = downAdj.x * navZoom + navPan.x;
                const ty = downAdj.y * navZoom + navPan.y;
                const tw = (downAdj.width || 1100) * navZoom;

                const startX = sx + sw / 2;
                const startY = sy + sh;
                const endX = tx + tw / 2;
                const endY = ty;

                lines.push(
                  <path
                    key={`line-d-${sourceSlide.id}-${downAdj.id}`}
                    d={`M ${startX} ${startY} C ${startX} ${startY + 30}, ${endX} ${endY - 30}, ${endX} ${endY}`}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.5"
                    markerEnd="url(#nav-arrow)"
                  />
                );
              }

              return lines;
            })}
          </svg>

          {/* Slide Thumbnails positioned on canvas */}
          {slides.map((slide, idx) => {
            const isSelected = selectedSlideId === slide.id;
            const isMatch = matchingSlideIds.has(slide.id);

            return (
              <SlideCanvasThumbnail
                key={slide.id}
                slide={slide}
                index={idx}
                isSelected={isSelected}
                isMatch={isMatch}
                navZoom={navZoom}
                navPan={navPan}
                onSelect={() => onSelectSlide(slide.id)}
                onDuplicate={() => onDuplicateSlide(slide.id)}
                onDelete={() => onDeleteSlide(slide.id)}
                onAddBranch={(dir) => onAddBranchSlide(dir, slide.id)}
                onDragStart={handleSlideDragStart}
                canDelete={slides.length > 1}
              />
            );
          })}

          {/* Floating Canvas Navigation Toolbar */}
          <div className="absolute bottom-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-auto">
            {/* Canvas Zoom & Pan Controls */}
            <div className="flex items-center gap-1 bg-neutral-900/90 border border-neutral-800/90 backdrop-blur-xl p-1 rounded-xl shadow-xl">
              <button
                onClick={() => setNavZoom((z) => Math.max(0.04, z * 0.85))}
                className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
                title="Zoom Out Navigation Canvas"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[10px] font-mono px-1 text-neutral-300">
                {Math.round(navZoom * 600)}%
              </span>
              <button
                onClick={() => setNavZoom((z) => Math.min(0.5, z * 1.15))}
                className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
                title="Zoom In Navigation Canvas"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
              <div className="w-[1px] h-3 bg-neutral-800 mx-0.5" />
              <button
                onClick={handleFitAllOnCanvas}
                className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
                title="Center & Fit All Slide Thumbnails"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Add Slide Button */}
            <button
              onClick={() => onAddBranchSlide('right', selectedSlideId || undefined)}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-950/50 transition flex items-center gap-1.5"
              title="Add a new slide next to current slide"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Slide</span>
            </button>
          </div>

          {/* Quick Helper Badge */}
          <div className="absolute top-2 left-2 text-[9px] text-neutral-500 bg-neutral-950/70 px-2 py-0.5 rounded-full border border-neutral-800/60 pointer-events-none">
            Drag to pan · Scroll to zoom · Click thumbnail to jump
          </div>
        </div>
      ) : (
        /* Alternative compact list view */
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-neutral-800 space-y-2">
          {slides.map((slide, idx) => {
            const isSelected = selectedSlideId === slide.id;
            const isMatch = matchingSlideIds.has(slide.id);
            if (!isMatch) return null;

            return (
              <div
                key={slide.id}
                onClick={() => onSelectSlide(slide.id)}
                className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-neutral-800/90 border-sky-500/70 shadow-lg'
                    : 'bg-neutral-950/40 border-neutral-800/80 hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded bg-black/60 text-[10px] font-mono flex items-center justify-center font-bold text-neutral-300 shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{slide.title}</p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {slide.elements.length} items · ({slide.x}, {slide.y})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(slide.id);
                    }}
                    className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(slide.id);
                      }}
                      className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer info */}
      <div className="px-3 py-1.5 border-t border-neutral-800/70 bg-neutral-950/70 shrink-0 flex items-center justify-between text-[10px] text-neutral-400">
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-sky-400" />
          <span>Active: #{slides.findIndex((s) => s.id === selectedSlideId) + 1}</span>
        </span>
        <button
          onClick={onZoomFitAll}
          className="hover:text-white transition underline underline-offset-2"
        >
          Reset Main Canvas
        </button>
      </div>
    </div>
  );
};
