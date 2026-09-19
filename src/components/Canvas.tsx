import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Slide, Viewport, CanvasElement, PaintStroke, PaintTool, Collaborator, ToolMode } from '../types';
import { SlideFrame } from './SlideFrame';
import { CollaborativeCursors } from './CollaborativeCursors';
import { getAdjacentSlide } from './NavigationPane';

interface CanvasProps {
  slides: Slide[];
  viewport: Viewport;
  onUpdateViewport: (viewport: Viewport) => void;
  selectedSlideId: string | null;
  navDirection?: 'up' | 'down' | 'left' | 'right' | null;
  selectedElementId: string | null;
  toolMode: ToolMode;
  isPaintingActive: boolean;
  paintTool: PaintTool;
  brushColor: string;
  brushSize: number;
  paintStrokes: PaintStroke[];
  collaborators: Collaborator[];
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  onSelectSlide: (id: string | null, direction?: 'up' | 'down' | 'left' | 'right') => void;
  onNavigateDirection: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAddBranchSlide: (direction: 'up' | 'down' | 'left' | 'right', referenceSlideId?: string) => void;
  onSelectElement: (id: string | null) => void;
  onUpdateSlide: (slideId: string, updated: Partial<Slide>) => void;
  onDeleteSlide: (slideId: string) => void;
  onDuplicateSlide: (slideId: string) => void;
  onAddStroke: (stroke: PaintStroke) => void;
  onAddElementToSlide: (slideId: string, element: CanvasElement) => void;
  onUpdateElementInSlide: (slideId: string, elId: string, updated: Partial<CanvasElement>) => void;
  onDeleteElementInSlide: (slideId: string, elId: string) => void;
  onOpenNotes: (slideId: string) => void;
  onCursorMove: (x: number, y: number, slideId?: string) => void;
}

// 2D Spatial Slide Transition Variants for AnimatePresence
const slideTransitionVariants = {
  enter: (direction: 'up' | 'down' | 'left' | 'right' | null | undefined) => {
    switch (direction) {
      case 'right':
        return { x: '100%', y: 0, opacity: 0, scale: 0.94 };
      case 'left':
        return { x: '-100%', y: 0, opacity: 0, scale: 0.94 };
      case 'down':
        return { y: '100%', x: 0, opacity: 0, scale: 0.94 };
      case 'up':
        return { y: '-100%', x: 0, opacity: 0, scale: 0.94 };
      default:
        return { opacity: 0, scale: 0.95 };
    }
  },
  center: {
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.36,
      ease: [0.16, 1, 0.3, 1] as const, // snappy ease-out-expo
    },
  },
  exit: (direction: 'up' | 'down' | 'left' | 'right' | null | undefined) => {
    switch (direction) {
      case 'right':
        return {
          x: '-100%',
          y: 0,
          opacity: 0,
          scale: 0.94,
          transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
        };
      case 'left':
        return {
          x: '100%',
          y: 0,
          opacity: 0,
          scale: 0.94,
          transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
        };
      case 'down':
        return {
          y: '-100%',
          x: 0,
          opacity: 0,
          scale: 0.94,
          transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
        };
      case 'up':
        return {
          y: '100%',
          x: 0,
          opacity: 0,
          scale: 0.94,
          transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
        };
      default:
        return {
          opacity: 0,
          scale: 0.95,
          transition: { duration: 0.2 },
        };
    }
  },
};

export const Canvas: React.FC<CanvasProps> = ({
  slides,
  viewport,
  onUpdateViewport,
  selectedSlideId,
  navDirection,
  selectedElementId,
  toolMode,
  isPaintingActive,
  paintTool,
  brushColor,
  brushSize,
  paintStrokes,
  collaborators,
  currentUserId,
  currentUserName,
  currentUserColor,
  onSelectSlide,
  onNavigateDirection,
  onAddBranchSlide,
  onSelectElement,
  onUpdateSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onAddStroke,
  onAddElementToSlide,
  onUpdateElementInSlide,
  onDeleteElementInSlide,
  onOpenNotes,
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; vpX: number; vpY: number } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Active slide - each slide is its own canvas!
  const currentSlide = useMemo(() => {
    return slides.find((s) => s.id === selectedSlideId) || slides[0] || null;
  }, [slides, selectedSlideId]);

  // Spatial direction finder for current slide
  const adjacentSlides = useMemo(() => {
    if (!currentSlide) {
      return { up: null, down: null, left: null, right: null };
    }
    return {
      up: getAdjacentSlide('up', currentSlide.id, slides),
      down: getAdjacentSlide('down', currentSlide.id, slides),
      left: getAdjacentSlide('left', currentSlide.id, slides),
      right: getAdjacentSlide('right', currentSlide.id, slides),
    };
  }, [slides, currentSlide]);

  // Keyboard spacebar listener for hand/pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        !e.repeat &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Global Clipboard paste listener for direct image insertion onto active slide canvas
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).tagName === 'INPUT'
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob && currentSlide) {
            const reader = new FileReader();
            reader.onload = () => {
              const newImgEl: CanvasElement = {
                id: `el-paste-${Date.now()}`,
                type: 'image',
                x: 80,
                y: 120,
                width: 420,
                height: 260,
                mediaUrl: reader.result as string,
                style: {
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#27272a',
                },
              };
              onAddElementToSlide(currentSlide.id, newImgEl);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [currentSlide, onAddElementToSlide]);

  // Wheel listener for slide canvas zoom and pan
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey || e.altKey) {
        // Zooming within this slide canvas centered on mouse
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const newZoom = Math.min(3.0, Math.max(0.3, viewport.zoom * zoomFactor));

        const worldX = (mouseX - viewport.x) / viewport.zoom;
        const worldY = (mouseY - viewport.y) / viewport.zoom;

        const newX = mouseX - worldX * newZoom;
        const newY = mouseY - worldY * newZoom;

        onUpdateViewport({ x: newX, y: newY, zoom: newZoom });
      } else {
        // Panning within this slide canvas
        onUpdateViewport({
          x: viewport.x - e.deltaX * 1.2,
          y: viewport.y - e.deltaY * 1.2,
          zoom: viewport.zoom,
        });
      }
    },
    [viewport, onUpdateViewport]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Pointer panning handlers for spacebar drag or Hand tool
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (
      e.button === 1 ||
      isSpacePressed ||
      toolMode === 'hand' ||
      e.target === containerRef.current
    ) {
      isPanningRef.current = true;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        vpX: viewport.x,
        vpY: viewport.y,
      };
      if (e.target === containerRef.current) {
        onSelectElement(null);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    // Collaboration cursor
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - viewport.x) / viewport.zoom;
    const worldY = (mouseY - viewport.y) / viewport.zoom;
    onCursorMove(worldX, worldY, currentSlide?.id);

    // Pan drag
    if (isPanningRef.current && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      onUpdateViewport({
        x: panStartRef.current.vpX + dx,
        y: panStartRef.current.vpY + dy,
        zoom: viewport.zoom,
      });
    }
  };

  const handlePointerUp = () => {
    isPanningRef.current = false;
    panStartRef.current = null;
  };

  const isPanningCursor = isSpacePressed || toolMode === 'hand';

  if (!currentSlide) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-neutral-950 text-neutral-400">
        <p className="text-sm">No slide selected.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDoubleClick={(e) => {
        if (e.target === containerRef.current) {
          // Double-click outside slide resets local pan
          onUpdateViewport({ x: 0, y: 0, zoom: 1.0 });
        }
      }}
      className={`relative w-full h-full overflow-hidden bg-neutral-950 select-none flex items-center justify-center ${
        isPanningCursor ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{
        // Subtle slide-canvas workspace grid
        backgroundImage: `radial-gradient(#27272a 1px, transparent 1px)`,
        backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
      }}
    >
      {/* 
        Dedicated Slide Canvas Stage:
        Only ONE slide canvas is rendered at a time.
        Directional animation transitions cleanly in 2D (Up, Down, Left, Right).
      */}
      <div
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: 'center center',
        }}
        className="relative flex items-center justify-center will-change-transform"
      >
        <AnimatePresence mode="wait" custom={navDirection}>
          <motion.div
            key={currentSlide.id}
            custom={navDirection}
            variants={slideTransitionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative flex items-center justify-center"
          >
            <SlideFrame
              slide={currentSlide}
              isSelected={true}
              selectedElementId={selectedElementId}
              paintStrokes={paintStrokes}
              currentPaintTool={paintTool}
              brushColor={brushColor}
              brushSize={brushSize}
              isPaintingActive={isPaintingActive}
              userId={currentUserId}
              userName={currentUserName}
              userColor={currentUserColor}
              onSelectSlide={() => onSelectSlide(currentSlide.id)}
              onSelectElement={onSelectElement}
              onUpdateSlide={(updated) => onUpdateSlide(currentSlide.id, updated)}
              onDeleteSlide={() => onDeleteSlide(currentSlide.id)}
              onDuplicateSlide={() => onDuplicateSlide(currentSlide.id)}
              onAddStroke={onAddStroke}
              onAddElement={(el) => onAddElementToSlide(currentSlide.id, el)}
              onUpdateElement={(elId, updated) =>
                onUpdateElementInSlide(currentSlide.id, elId, updated)
              }
              onDeleteElement={(elId) => onDeleteElementInSlide(currentSlide.id, elId)}
              onOpenNotes={onOpenNotes}
              adjacentSlides={adjacentSlides}
              onNavigateDirection={onNavigateDirection}
              onAddBranchSlide={(dir) => onAddBranchSlide(dir, currentSlide.id)}
              zoom={viewport.zoom}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Screen-space Collaborative Cursors */}
      <CollaborativeCursors
        collaborators={collaborators}
        currentUserId={currentUserId}
        viewport={viewport}
      />
    </div>
  );
};
