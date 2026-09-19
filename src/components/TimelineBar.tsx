import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar, Clock, History, Compass, ArrowRight } from 'lucide-react';
import { Slide, TimelineCategory } from '../types';

interface TimelineBarProps {
  slides: Slide[];
  selectedSlideId: string | null;
  onSelectSlide: (slideId: string) => void;
  onAddPastMeeting: () => void;
  onAddFutureMeeting: () => void;
  onZoomFitAll: () => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  slides,
  selectedSlideId,
  onSelectSlide,
  onAddPastMeeting,
  onAddFutureMeeting,
  onZoomFitAll,
}) => {
  // Sort slides horizontally by their canvas X coordinate
  const sortedSlides = [...slides].sort((a, b) => a.x - b.x);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-5xl w-auto flex items-center gap-2 px-3 py-2 bg-neutral-900/90 border border-neutral-800/90 backdrop-blur-xl rounded-2xl shadow-2xl text-xs text-neutral-300">
      {/* Overview Button */}
      <button
        onClick={onZoomFitAll}
        className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition flex items-center gap-1.5 pr-2"
        title="Bird's-Eye Canvas Overview (Fit All)"
      >
        <Compass className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-medium hidden sm:inline">Overview</span>
      </button>

      <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

      {/* Add Past Meeting Button (Left) */}
      <button
        onClick={onAddPastMeeting}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 text-indigo-300 transition text-[11px] font-medium"
        title="Add Past Meeting / Context to the Left"
      >
        <Plus className="w-3 h-3" />
        <span>Past Meeting</span>
      </button>

      {/* Timeline Slide Nodes */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-0.5 px-1 scrollbar-none">
        {sortedSlides.map((slide, idx) => {
          const isSelected = selectedSlideId === slide.id;
          const isPast = slide.timelineCategory === 'past';
          const isCurrent = slide.timelineCategory === 'current';
          const isFuture = slide.timelineCategory === 'future';

          const tagColor = isPast
            ? 'bg-indigo-500'
            : isCurrent
            ? 'bg-sky-400'
            : 'bg-purple-500';

          return (
            <React.Fragment key={slide.id}>
              {idx > 0 && (
                <div className="w-4 h-[1px] bg-neutral-700/70 shrink-0" />
              )}
              <button
                onClick={() => onSelectSlide(slide.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? 'bg-neutral-800 border-sky-500 text-white shadow-lg'
                    : 'bg-neutral-900/60 border-neutral-800/80 hover:bg-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${tagColor} ${
                    isSelected ? 'ring-2 ring-sky-400/50 scale-110' : ''
                  }`}
                />
                <span className="font-medium text-xs truncate max-w-[130px]">
                  {slide.title}
                </span>
                {slide.meetingContext?.date && (
                  <span className="text-[10px] text-neutral-500 hidden md:inline">
                    {slide.meetingContext.date}
                  </span>
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Add Future Meeting Button (Right) */}
      <button
        onClick={onAddFutureMeeting}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/50 text-purple-300 transition text-[11px] font-medium"
        title="Add Future Meeting / Roadmap to the Right"
      >
        <span>Future Meeting</span>
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );
};
