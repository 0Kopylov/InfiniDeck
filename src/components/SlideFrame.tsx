import React, { useState, useRef } from 'react';
import {
  Calendar,
  Users,
  Mic,
  FileText,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Globe,
  Edit3,
} from 'lucide-react';
import { Slide, CanvasElement, PaintStroke, PaintTool } from '../types';
import { MarkdownEditor } from './MarkdownEditor';
import { YouTubeEmbed } from './YouTubeEmbed';
import { PaintLayer } from './PaintLayer';

interface SlideFrameProps {
  slide: Slide;
  isSelected?: boolean;
  isCurrentInPresentation?: boolean;
  selectedElementId: string | null;
  paintStrokes: PaintStroke[];
  currentPaintTool: PaintTool;
  brushColor: string;
  brushSize: number;
  isPaintingActive: boolean;
  userId: string;
  userName: string;
  userColor: string;
  onSelectSlide?: () => void;
  onSelectElement: (id: string | null) => void;
  onUpdateSlide: (updated: Partial<Slide>) => void;
  onDeleteSlide: () => void;
  onDuplicateSlide: () => void;
  onAddStroke: (stroke: PaintStroke) => void;
  onAddElement: (element: CanvasElement) => void;
  onUpdateElement: (elId: string, updated: Partial<CanvasElement>) => void;
  onDeleteElement: (elId: string) => void;
  onOpenNotes: (slideId: string) => void;
  adjacentSlides?: {
    up: Slide | null;
    down: Slide | null;
    left: Slide | null;
    right: Slide | null;
  };
  onNavigateDirection?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onAddBranchSlide?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  zoom: number;
}

export const SlideFrame: React.FC<SlideFrameProps> = ({
  slide,
  isSelected = true,
  selectedElementId,
  paintStrokes,
  currentPaintTool,
  brushColor,
  brushSize,
  isPaintingActive,
  userId,
  userName,
  userColor,
  onSelectSlide,
  onSelectElement,
  onUpdateSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onAddStroke,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onOpenNotes,
  adjacentSlides,
  onNavigateDirection,
  onAddBranchSlide,
  zoom,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggingElement, setIsDraggingElement] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number; elX: number; elY: number } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(slide.title);

  // File drop handler for images directly onto slide
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const rect = e.currentTarget.getBoundingClientRect();
          const dropX = (e.clientX - rect.left) / zoom;
          const dropY = (e.clientY - rect.top) / zoom;

          const newEl: CanvasElement = {
            id: `el-img-${Date.now()}`,
            type: 'image',
            x: Math.round(dropX),
            y: Math.round(dropY),
            width: 380,
            height: 240,
            mediaUrl: reader.result as string,
            style: {
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#3f3f46',
            }
          };
          onAddElement(newEl);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Element dragging logic: free positioning anywhere on canvas inside or outside slide box
  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    e.stopPropagation();
    onSelectElement(el.id);
    setIsDraggingElement(el.id);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elX: el.x,
      elY: el.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartPos.current) return;
      const dx = (moveEvent.clientX - dragStartPos.current.x) / zoom;
      const dy = (moveEvent.clientY - dragStartPos.current.y) / zoom;

      // Free movement anywhere on canvas (both inside and outside slide boundaries)
      const newX = dragStartPos.current.elX + dx;
      const newY = dragStartPos.current.elY + dy;

      onUpdateElement(el.id, { x: Math.round(newX), y: Math.round(newY) });
    };

    const handleMouseUp = () => {
      setIsDraggingElement(null);
      dragStartPos.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const categoryColor =
    slide.timelineCategory === 'past'
      ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
      : slide.timelineCategory === 'current'
      ? 'border-sky-500/50 bg-sky-500/10 text-sky-400'
      : 'border-purple-500/40 bg-purple-500/10 text-purple-400';

  const categoryLabel =
    slide.timelineCategory === 'past'
      ? 'PAST MEETING'
      : slide.timelineCategory === 'current'
      ? 'ACTIVE MEETING'
      : 'FUTURE MEETING';

  const totalNotesCount =
    (slide.notes.privateNotes ? 1 : 0) +
    (slide.notes.publicNotes ? 1 : 0) +
    (slide.notes.voiceNotes?.length || 0);

  return (
    <div
      id={`slide-frame-${slide.id}`}
      style={{
        width: `${slide.width}px`,
        height: `${slide.height}px`,
        backgroundColor: slide.theme.bg || '#111216',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectSlide?.();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`relative rounded-2xl shadow-2xl transition-shadow select-none flex flex-col border ${
        isSelected
          ? 'border-sky-400 ring-2 ring-sky-400/20 shadow-sky-950/40'
          : 'border-neutral-800/90 hover:border-neutral-700'
      }`}
    >
      {/* 4-Directional Spatial Edge Connectors & Navigation Buttons */}
      {/* Top Handle: Navigate Up or Add Branch Up */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 transition-opacity duration-200 z-30 ${
          isHovered ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (adjacentSlides?.up && onNavigateDirection) onNavigateDirection('up');
            else if (onAddBranchSlide) onAddBranchSlide('up');
          }}
          className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-sky-950/90 text-neutral-300 hover:text-sky-300 border border-neutral-700/80 hover:border-sky-500 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md transition-all text-xs font-medium whitespace-nowrap"
          title={adjacentSlides?.up ? `Navigate Up: ${adjacentSlides.up.title}` : 'Add technical sub-topic branch Up (+)'}
        >
          <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
          <span className="max-w-[200px] truncate">
            {adjacentSlides?.up ? adjacentSlides.up.title : '+ Sub-Topic (Up)'}
          </span>
        </button>
      </div>

      {/* Bottom Handle: Navigate Down or Add Branch Down */}
      <div
        className={`absolute -bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-200 z-30 ${
          isHovered ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (adjacentSlides?.down && onNavigateDirection) onNavigateDirection('down');
            else if (onAddBranchSlide) onAddBranchSlide('down');
          }}
          className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-emerald-950/90 text-neutral-300 hover:text-emerald-300 border border-neutral-700/80 hover:border-emerald-500 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md transition-all text-xs font-medium whitespace-nowrap"
          title={adjacentSlides?.down ? `Navigate Down: ${adjacentSlides.down.title}` : 'Add appendix & telemetry branch Down (+)'}
        >
          <ChevronDown className="w-3.5 h-3.5 text-emerald-400" />
          <span className="max-w-[200px] truncate">
            {adjacentSlides?.down ? adjacentSlides.down.title : '+ Appendix (Down)'}
          </span>
        </button>
      </div>

      {/* Left Handle: Navigate Left or Add Past Meeting */}
      <div
        className={`absolute -left-12 top-1/2 -translate-y-1/2 -translate-x-full transition-opacity duration-200 z-30 ${
          isHovered ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (adjacentSlides?.left && onNavigateDirection) onNavigateDirection('left');
            else if (onAddBranchSlide) onAddBranchSlide('left');
          }}
          className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-indigo-950/90 text-neutral-300 hover:text-indigo-300 border border-neutral-700/80 hover:border-indigo-500 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md transition-all text-xs font-medium whitespace-nowrap"
          title={adjacentSlides?.left ? `Navigate Left: ${adjacentSlides.left.title}` : 'Add past meeting context Left (+)'}
        >
          <ChevronLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span className="max-w-[180px] truncate">
            {adjacentSlides?.left ? adjacentSlides.left.title : '+ Past Meeting'}
          </span>
        </button>
      </div>

      {/* Right Handle: Navigate Right or Add Future Meeting */}
      <div
        className={`absolute -right-12 top-1/2 -translate-y-1/2 translate-x-full transition-opacity duration-200 z-30 ${
          isHovered ? 'opacity-100' : 'opacity-70 hover:opacity-100'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (adjacentSlides?.right && onNavigateDirection) onNavigateDirection('right');
            else if (onAddBranchSlide) onAddBranchSlide('right');
          }}
          className="flex items-center gap-1.5 bg-neutral-900/90 hover:bg-purple-950/90 text-neutral-300 hover:text-purple-300 border border-neutral-700/80 hover:border-purple-500 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md transition-all text-xs font-medium whitespace-nowrap"
          title={adjacentSlides?.right ? `Navigate Right: ${adjacentSlides.right.title}` : 'Add future roadmap meeting Right (+)'}
        >
          <span className="max-w-[180px] truncate">
            {adjacentSlides?.right ? adjacentSlides.right.title : '+ Future Meeting'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
        </button>
      </div>

      {/* Slide Top Header Bar */}
      <div className="h-16 px-6 border-b border-neutral-800/80 flex items-center justify-between relative z-20 bg-neutral-950/40 rounded-t-2xl">
        <div className="flex items-center gap-3 min-w-0">
          {/* Timeline Category Pill */}
          <span
            className={`px-2.5 py-0.5 text-[11px] font-semibold tracking-wider rounded-md border shrink-0 ${categoryColor}`}
          >
            {categoryLabel}
          </span>

          {/* Branch Type Badge (if vertical branch) */}
          {slide.y < -300 && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-sky-500/40 bg-sky-500/10 text-sky-300 shrink-0 flex items-center gap-1">
              <ChevronUp className="w-3 h-3" /> Sub-Topic Branch
            </span>
          )}
          {slide.y > 300 && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shrink-0 flex items-center gap-1">
              <ChevronDown className="w-3 h-3" /> Appendix Branch
            </span>
          )}

          {/* Editable Slide Title */}
          {isEditingTitle ? (
            <input
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                if (titleDraft.trim() && titleDraft !== slide.title) {
                  onUpdateSlide({ title: titleDraft.trim() });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  if (titleDraft.trim() && titleDraft !== slide.title) {
                    onUpdateSlide({ title: titleDraft.trim() });
                  }
                } else if (e.key === 'Escape') {
                  setTitleDraft(slide.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="bg-neutral-800 border border-sky-500 rounded px-2 py-0.5 text-xs text-white focus:outline-none w-52"
            />
          ) : (
            <button
              onClick={() => {
                setTitleDraft(slide.title);
                setIsEditingTitle(true);
              }}
              className="group/title flex items-center gap-1.5 text-xs font-semibold text-white truncate max-w-sm hover:text-sky-300 transition"
              title="Click to rename slide title"
            >
              <span className="truncate">{slide.title}</span>
              <Edit3 className="w-3 h-3 text-neutral-500 group-hover/title:text-sky-400 shrink-0" />
            </button>
          )}

          {/* Date & Attendees */}
          {slide.meetingContext && (
            <div className="hidden lg:flex items-center gap-3 text-xs text-neutral-400 shrink-0">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {slide.meetingContext.date}
              </span>
              {slide.meetingContext.attendees && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  {slide.meetingContext.attendees.length} Attendees
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Notes Drawer Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenNotes(slide.id);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              totalNotesCount > 0
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
            title="Open Speaker and Public Notes"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            {totalNotesCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-amber-500/20 rounded-full font-mono text-amber-200">
                {totalNotesCount}
              </span>
            )}
            {slide.notes.voiceNotes?.length > 0 && (
              <Mic className="w-3 h-3 text-red-400 animate-pulse" />
            )}
          </button>

          {/* Duplicate Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateSlide();
            }}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition"
            title="Duplicate Slide"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSlide();
            }}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition"
            title="Delete Slide"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Slide Workspace Area: overflow-visible allows elements to be placed and visible outside the slide boundaries */}
      <div className="relative flex-1 w-full h-full overflow-visible p-6">
        {/* Render Slide Elements */}
        {slide.elements.map((el) => {
          const isElSelected = selectedElementId === el.id;

          return (
            <div
              key={el.id}
              style={{
                transform: `translate(${el.x}px, ${el.y}px)`,
                width: `${el.width}px`,
                height: `${el.height}px`,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, el)}
              className={`absolute top-0 left-0 group/el cursor-move ${isElSelected ? 'z-20' : 'z-10'}`}
            >
              {el.type === 'markdown' && (
                <MarkdownEditor
                  element={el}
                  isSelected={isElSelected}
                  onUpdate={(updated) => onUpdateElement(el.id, updated)}
                  onDelete={() => onDeleteElement(el.id)}
                />
              )}

              {el.type === 'image' && (
                <div
                  className={`relative w-full h-full rounded-lg overflow-hidden border ${
                    isElSelected ? 'ring-2 ring-sky-500 border-transparent' : 'border-neutral-800'
                  }`}
                  style={{ borderRadius: el.style?.borderRadius || 8 }}
                >
                  <img
                    src={el.mediaUrl}
                    alt="Slide visual"
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                    referrerPolicy="no-referrer"
                  />
                  {isElSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement(el.id);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600/80 hover:bg-red-600 text-white rounded text-xs"
                      title="Remove Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {el.type === 'youtube' && (
                <YouTubeEmbed
                  element={el}
                  isSelected={isElSelected}
                  onUpdate={(updated) => onUpdateElement(el.id, updated)}
                />
              )}
            </div>
          );
        })}

        {/* Slide-Specific Paint-Over Overlay */}
        <PaintLayer
          slideId={slide.id}
          width={slide.width}
          height={slide.height - 64} // minus header
          strokes={paintStrokes}
          currentTool={currentPaintTool}
          brushColor={brushColor}
          brushSize={brushSize}
          isPaintingActive={isPaintingActive && isSelected}
          onAddStroke={onAddStroke}
          userId={userId}
          userName={userName}
          userColor={userColor}
        />
      </div>
    </div>
  );
};
