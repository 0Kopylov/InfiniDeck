import React, { useRef } from 'react';
import { Slide, Viewport } from '../types';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';

interface MinimapProps {
  slides: Slide[];
  viewport: Viewport;
  selectedSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomReset: () => void;
}

export const Minimap: React.FC<MinimapProps> = ({
  slides,
  viewport,
  selectedSlideId,
  onSelectSlide,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomReset,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine spatial bounding box of all slides
  let minX = -1000;
  let maxX = 2000;
  let minY = -600;
  let maxY = 800;

  for (const s of slides) {
    if (s.x < minX) minX = s.x - 200;
    if (s.x + s.width > maxX) maxX = s.x + s.width + 200;
    if (s.y < minY) minY = s.y - 200;
    if (s.y + s.height > maxY) maxY = s.y + s.height + 200;
  }

  const mapWidth = 200;
  const mapHeight = 120;
  const worldWidth = Math.max(2000, maxX - minX);
  const worldHeight = Math.max(1200, maxY - minY);

  const scaleX = mapWidth / worldWidth;
  const scaleY = mapHeight / worldHeight;
  const minimapScale = Math.min(scaleX, scaleY);

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = clickX / minimapScale + minX;
    const targetWorldY = clickY / minimapScale + minY;

    // Find closest slide to click
    let closestSlide = slides[0];
    let minDistance = Infinity;

    slides.forEach((s) => {
      const centerX = s.x + s.width / 2;
      const centerY = s.y + s.height / 2;
      const dist = Math.hypot(centerX - targetWorldX, centerY - targetWorldY);
      if (dist < minDistance) {
        minDistance = dist;
        closestSlide = s;
      }
    });

    if (closestSlide) {
      onSelectSlide(closestSlide.id);
    }
  };

  return (
    <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      {/* Slide Canvas Zoom & Reset Controls */}
      <div className="flex items-center gap-1 p-1 bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl rounded-xl shadow-xl text-neutral-300 text-xs">
        <button
          onClick={onZoomOut}
          className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
          title="Zoom Out Canvas"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[11px] px-1.5 font-medium text-neutral-300">
          {Math.round(viewport.zoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
          title="Zoom In Canvas"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="h-3.5 w-[1px] bg-neutral-800 mx-0.5" />
        <button
          onClick={onZoomReset}
          className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
          title="Reset Zoom to 100%"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onZoomFit}
          className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition"
          title="Center & Fit Current Slide Canvas"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2D Spatial Slide Radar Minimap */}
      <div
        ref={containerRef}
        onClick={handleMinimapClick}
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
        className="relative bg-neutral-950/90 border border-neutral-800/90 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md cursor-pointer hover:border-neutral-700 transition"
        title="2D Spatial Deck Radar: Click any slide to switch canvas"
      >
        {/* Spatial Grid guide lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        {/* Slides on Minimap */}
        {slides.map((s) => {
          const left = (s.x - minX) * minimapScale;
          const top = (s.y - minY) * minimapScale;
          const w = s.width * minimapScale;
          const h = s.height * minimapScale;
          const isSelected = selectedSlideId === s.id;

          const color =
            s.timelineCategory === 'past'
              ? '#6366f1'
              : s.timelineCategory === 'current'
              ? '#38bdf8'
              : '#a855f7';

          return (
            <div
              key={s.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSlide(s.id);
              }}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${w}px`,
                height: `${h}px`,
                backgroundColor: isSelected ? color : '#1e1e24',
                borderColor: color,
              }}
              className={`absolute rounded-[3px] border transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-white shadow-lg shadow-sky-500/40 z-10'
                  : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              title={`${s.title} (${s.timelineCategory})`}
            />
          );
        })}
      </div>
    </div>
  );
};
