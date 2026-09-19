import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  Lock,
  Maximize,
  Minimize,
  Sparkles,
  Layers,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { Slide, PaintStroke, PaintTool } from '../types';
import { MarkdownEditor } from './MarkdownEditor';
import { YouTubeEmbed } from './YouTubeEmbed';
import { PaintLayer } from './PaintLayer';

interface PresentationModeProps {
  slides: Slide[];
  currentSlideIndex: number;
  paintStrokes: PaintStroke[];
  onSlideChange: (newIndex: number) => void;
  onExit: () => void;
  onAddStroke: (stroke: PaintStroke) => void;
  userId: string;
  userName: string;
  userColor: string;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  currentSlideIndex,
  paintStrokes,
  onSlideChange,
  onExit,
  onAddStroke,
  userId,
  userName,
  userColor,
}) => {
  const [showPresenterNotes, setShowPresenterNotes] = useState(false);
  const [showPaintControls, setShowPaintControls] = useState(false);
  const [paintTool, setPaintTool] = useState<PaintTool>('laser');
  const [brushColor, setBrushColor] = useState('#38bdf8');
  const [timerSeconds, setTimerSeconds] = useState(0);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Presentation Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        if (currentSlideIndex < slides.length - 1) {
          onSlideChange(currentSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        if (currentSlideIndex > 0) {
          onSlideChange(currentSlideIndex - 1);
        }
      } else if (e.key === 'Escape') {
        onExit();
      } else if (e.key === 'n' || e.key === 'N') {
        setShowPresenterNotes((prev) => !prev);
      } else if (e.key === 'l' || e.key === 'L') {
        setPaintTool('laser');
        setShowPaintControls(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, slides.length, onSlideChange, onExit]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Top Floating Distraction-Free Presenter HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-full shadow-2xl text-xs text-neutral-300">
        {/* Timer */}
        <div className="flex items-center gap-1.5 font-mono text-neutral-400">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>{formatTimer(timerSeconds)}</span>
        </div>

        <div className="h-3.5 w-[1px] bg-neutral-800" />

        {/* Slide Counter */}
        <span className="font-semibold text-white">
          {currentSlideIndex + 1} / {slides.length}
        </span>

        <div className="h-3.5 w-[1px] bg-neutral-800" />

        {/* Private Speaker Notes Toggle */}
        <button
          onClick={() => setShowPresenterNotes(!showPresenterNotes)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition ${
            showPresenterNotes
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Toggle Private Speaker Notes (Press 'N')"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Notes (N)</span>
        </button>

        {/* Paint / Laser Pointer Toggle */}
        <button
          onClick={() => setShowPaintControls(!showPaintControls)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition ${
            showPaintControls
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
          }`}
          title="Toggle Laser Pointer / Paint Overlay (Press 'L')"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Annotate (L)</span>
        </button>

        <div className="h-3.5 w-[1px] bg-neutral-800" />

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition"
          title="Exit Presentation Mode (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Paint Tool Options Bar (when active) */}
      {showPaintControls && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 border border-neutral-700/80 rounded-full shadow-2xl text-xs">
          <button
            onClick={() => setPaintTool('laser')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paintTool === 'laser' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-neutral-400'
            }`}
          >
            Laser Pointer
          </button>
          <button
            onClick={() => setPaintTool('pen')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paintTool === 'pen' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-neutral-400'
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => setPaintTool('highlighter')}
            className={`px-2.5 py-1 rounded-full font-medium ${
              paintTool === 'highlighter' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-neutral-400'
            }`}
          >
            Highlighter
          </button>
          <div className="h-3 w-[1px] bg-neutral-700" />
          {['#38bdf8', '#ef4444', '#10b981', '#f59e0b', '#a855f7'].map((c) => (
            <button
              key={c}
              onClick={() => setBrushColor(c)}
              className="w-4 h-4 rounded-full border border-neutral-700 hover:scale-110 transition"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {/* Main Slide Viewer Frame */}
      <div className="relative w-full max-w-6xl aspect-[16/9] max-h-[82vh] p-4 flex items-center justify-center">
        <div
          style={{
            backgroundColor: currentSlide.theme.bg || '#111216',
          }}
          className="relative w-full h-full rounded-2xl border border-neutral-800/80 shadow-2xl overflow-hidden flex flex-col p-8"
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between border-b border-neutral-800/80 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  {currentSlide.timelineCategory} meeting
                </span>
                {currentSlide.meetingContext?.date && (
                  <span className="text-xs text-neutral-400">
                    {currentSlide.meetingContext.date}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {currentSlide.title}
              </h1>
              {currentSlide.subtitle && (
                <h2 className="text-base text-neutral-400 mt-0.5">
                  {currentSlide.subtitle}
                </h2>
              )}
            </div>
          </div>

          {/* Slide Elements Layout */}
          <div className="relative flex-1 w-full h-full">
            {currentSlide.elements.map((el) => (
              <div
                key={el.id}
                style={{
                  transform: `translate(${el.x * 0.9}px, ${el.y * 0.9}px)`,
                  width: `${el.width * 0.9}px`,
                  height: `${el.height * 0.9}px`,
                }}
                className="absolute top-0 left-0"
              >
                {el.type === 'markdown' && (
                  <MarkdownEditor
                    element={el}
                    isSelected={false}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    isReadOnly={true}
                  />
                )}
                {el.type === 'image' && (
                  <img
                    src={el.mediaUrl}
                    alt="Slide visual"
                    className="w-full h-full object-cover rounded-lg border border-neutral-800"
                    referrerPolicy="no-referrer"
                  />
                )}
                {el.type === 'youtube' && (
                  <YouTubeEmbed
                    element={el}
                    isSelected={false}
                    onUpdate={() => {}}
                    isReadOnly={true}
                  />
                )}
              </div>
            ))}

            {/* Paint Layer in Presenter View */}
            <PaintLayer
              slideId={currentSlide.id}
              width={1100}
              height={620}
              strokes={paintStrokes}
              currentTool={paintTool}
              brushColor={brushColor}
              brushSize={paintTool === 'laser' ? 6 : 4}
              isPaintingActive={showPaintControls}
              onAddStroke={onAddStroke}
              userId={userId}
              userName={userName}
              userColor={userColor}
            />
          </div>
        </div>
      </div>

      {/* Floating Speaker Notes Teleprompter Window */}
      {showPresenterNotes && (
        <div className="absolute bottom-20 left-10 z-40 w-96 bg-neutral-900/95 border border-amber-500/40 rounded-2xl shadow-2xl p-4 backdrop-blur-xl text-neutral-200">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Speaker Notes</span>
            </div>
            <button
              onClick={() => setShowPresenterNotes(false)}
              className="text-neutral-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xs leading-relaxed max-h-48 overflow-y-auto text-neutral-300">
            {currentSlide.notes.privateNotes || (
              <span className="italic text-neutral-500">No private speaker cues written for this slide.</span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Buttons */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-40">
        <button
          onClick={() => onSlideChange(Math.max(0, currentSlideIndex - 1))}
          disabled={currentSlideIndex === 0}
          className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full border border-neutral-800 transition disabled:opacity-30"
          title="Previous Slide (Left Arrow)"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Slide Thumbnail Dots */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900/60 rounded-full border border-neutral-800/80">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => onSlideChange(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentSlideIndex
                  ? 'bg-sky-400 w-6'
                  : 'bg-neutral-700 hover:bg-neutral-500'
              }`}
              title={s.title}
            />
          ))}
        </div>

        <button
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlideIndex + 1))}
          disabled={currentSlideIndex === slides.length - 1}
          className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full border border-neutral-800 transition disabled:opacity-30"
          title="Next Slide (Right Arrow or Space)"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
