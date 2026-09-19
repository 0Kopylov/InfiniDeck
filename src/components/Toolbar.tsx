import React from 'react';
import {
  MousePointer,
  Hand,
  Type,
  Image as ImageIcon,
  Youtube,
  PenTool,
  FileText,
  MessageSquare,
  Play,
  Eye,
  EyeOff,
  Download,
  Upload,
  UserPlus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ToolMode, PaintTool, Collaborator } from '../types';

interface ToolbarProps {
  toolMode: ToolMode;
  onSetToolMode: (mode: ToolMode) => void;
  isPaintingActive: boolean;
  onTogglePaint: () => void;
  paintTool: PaintTool;
  onSetPaintTool: (tool: PaintTool) => void;
  brushColor: string;
  onSetBrushColor: (color: string) => void;
  brushSize: number;
  onSetBrushSize: (size: number) => void;
  onClearSlidePaint: () => void;
  onAddTextElement: () => void;
  onAddImageElement: () => void;
  onAddYouTubeElement: () => void;
  onOpenNotes: () => void;
  onOpenChat: () => void;
  onOpenImportExport: () => void;
  onStartPresentation: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  collaborators: Collaborator[];
  onSimulateCollaborator: () => void;
  notesCount: number;
  chatCount: number;
}

const BRUSH_COLORS = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#a855f7', '#ffffff'];

export const Toolbar: React.FC<ToolbarProps> = ({
  toolMode,
  onSetToolMode,
  isPaintingActive,
  onTogglePaint,
  paintTool,
  onSetPaintTool,
  brushColor,
  onSetBrushColor,
  brushSize,
  onSetBrushSize,
  onClearSlidePaint,
  onAddTextElement,
  onAddImageElement,
  onAddYouTubeElement,
  onOpenNotes,
  onOpenChat,
  onOpenImportExport,
  onStartPresentation,
  isZenMode,
  onToggleZenMode,
  collaborators,
  onSimulateCollaborator,
  notesCount,
  chatCount,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
      {/* Sub-toolbar for Paint Tools when active */}
      {isPaintingActive && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-xl rounded-full shadow-2xl text-xs text-neutral-200 animate-in fade-in slide-in-from-bottom-2">
          <span className="text-[10px] uppercase font-semibold text-neutral-400 tracking-wider pl-1">
            Draw:
          </span>
          <button
            onClick={() => onSetPaintTool('pen')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
              paintTool === 'pen' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => onSetPaintTool('highlighter')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
              paintTool === 'highlighter' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Highlighter
          </button>
          <button
            onClick={() => onSetPaintTool('laser')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
              paintTool === 'laser' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Laser
          </button>

          <div className="h-3.5 w-[1px] bg-neutral-700 mx-1" />

          {/* Color palette */}
          <div className="flex items-center gap-1.5">
            {BRUSH_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onSetBrushColor(c)}
                className={`w-4 h-4 rounded-full border border-neutral-700 transition ${
                  brushColor === c ? 'scale-125 ring-2 ring-white/60' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="h-3.5 w-[1px] bg-neutral-700 mx-1" />

          {/* Size */}
          <input
            type="range"
            min="2"
            max="20"
            value={brushSize}
            onChange={(e) => onSetBrushSize(Number(e.target.value))}
            className="w-16 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            title="Stroke Size"
          />

          <div className="h-3.5 w-[1px] bg-neutral-700 mx-1" />

          <button
            onClick={onClearSlidePaint}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 rounded-full transition"
            title="Clear Paint on Current Slide"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary Floating Minimalist Dock */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-900/90 border border-neutral-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl text-neutral-300">
        {/* Select Tool */}
        <button
          onClick={() => {
            onSetToolMode('select');
            if (isPaintingActive) onTogglePaint();
          }}
          className={`p-2 rounded-xl transition ${
            toolMode === 'select' && !isPaintingActive
              ? 'bg-neutral-800 text-sky-400 border border-neutral-700'
              : 'hover:bg-neutral-800/70 text-neutral-400 hover:text-white'
          }`}
          title="Select / Edit (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Hand / Pan Tool */}
        <button
          onClick={() => {
            onSetToolMode('hand');
            if (isPaintingActive) onTogglePaint();
          }}
          className={`p-2 rounded-xl transition ${
            toolMode === 'hand'
              ? 'bg-neutral-800 text-sky-400 border border-neutral-700'
              : 'hover:bg-neutral-800/70 text-neutral-400 hover:text-white'
          }`}
          title="Hand / Pan Tool (H or Spacebar)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

        {/* Insert Text */}
        <button
          onClick={onAddTextElement}
          className="p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-white rounded-xl transition"
          title="Insert Markdown Text Box (T)"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Insert Picture */}
        <button
          onClick={onAddImageElement}
          className="p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-white rounded-xl transition"
          title="Insert Picture from File or URL (I)"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Insert YouTube */}
        <button
          onClick={onAddYouTubeElement}
          className="p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-white rounded-xl transition"
          title="Insert YouTube Video (Y)"
        >
          <Youtube className="w-4 h-4 text-red-500/90" />
        </button>

        {/* Paint-Over */}
        <button
          onClick={onTogglePaint}
          className={`p-2 rounded-xl transition ${
            isPaintingActive
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
              : 'hover:bg-neutral-800/70 text-neutral-400 hover:text-white'
          }`}
          title="Collaborative Paint-Over (D)"
        >
          <PenTool className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

        {/* Present Button */}
        <button
          onClick={onStartPresentation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs shadow-lg shadow-sky-950/50 transition"
          title="Start Presentation (P)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Present</span>
        </button>

        <div className="h-4 w-[1px] bg-neutral-800 mx-1" />

        {/* Notes Button */}
        <button
          onClick={onOpenNotes}
          className="relative p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-white rounded-xl transition"
          title="Speaker & Public Notes"
        >
          <FileText className="w-4 h-4" />
          {notesCount > 0 && (
            <span className="absolute 1 top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Chat Button */}
        <button
          onClick={onOpenChat}
          className="relative p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-white rounded-xl transition"
          title="Live Collaboration Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {chatCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400" />
          )}
        </button>

        {/* Import/Export */}
        <button
          onClick={onOpenImportExport}
          className="p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-white rounded-xl transition"
          title="Import / Export PPTX, PDF, Standalone HTML"
        >
          <Upload className="w-4 h-4" />
        </button>

        {/* Simulate Collaborator */}
        <button
          onClick={onSimulateCollaborator}
          className="p-2 hover:bg-neutral-800/70 text-neutral-400 hover:text-emerald-400 rounded-xl transition"
          title="Invite / Simulate Collaborator Movement & Paint"
        >
          <UserPlus className="w-4 h-4" />
        </button>

        {/* Zen Mode Toggle */}
        <button
          onClick={onToggleZenMode}
          className={`p-2 rounded-xl transition ${
            isZenMode ? 'text-sky-400 bg-neutral-800' : 'text-neutral-400 hover:text-white'
          }`}
          title="Zen Mode: Hide Distractions (Z)"
        >
          {isZenMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
