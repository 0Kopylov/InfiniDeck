import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  Code,
  Check,
  Loader2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Slide, PaintStroke } from '../types';
import { parsePPTXFile, parseDocumentFallback } from '../utils/pptxParser';
import { exportDeckToPDF, exportSlideToPNG, exportDeckToJSON, exportStandaloneHTML } from '../utils/pdfExporter';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  paintStrokes: PaintStroke[];
  selectedSlideId: string | null;
  onImportSlides: (newSlides: Slide[], appendMode: 'replace' | 'append') => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  slides,
  paintStrokes,
  selectedSlideId,
  onImportSlides,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);
    setStatusMessage(`Parsing ${file.name}...`);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'json' || ext === 'cdeck') {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.slides && Array.isArray(data.slides)) {
          onImportSlides(data.slides, 'replace');
          setStatusMessage(`Successfully imported ${data.slides.length} slides!`);
          setTimeout(() => {
            setIsProcessing(false);
            onClose();
          }, 800);
          return;
        }
      }

      // Calculate placement X coordinate to the right of current slides
      const maxX = slides.reduce((max, s) => Math.max(max, s.x + s.width), 0);
      const startX = slides.length > 0 ? maxX + 200 : 0;

      if (ext === 'pptx') {
        const result = await parsePPTXFile(file, startX);
        onImportSlides(result.slides, 'append');
        setStatusMessage(`Extracted ${result.slides.length} slides from PowerPoint deck!`);
      } else {
        // PDF, Keynote, or other presentations
        const result = await parseDocumentFallback(file, startX);
        onImportSlides(result.slides, 'append');
        setStatusMessage(`Imported ${result.slides.length} slides from ${file.name}!`);
      }

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error('Import error:', err);
      setStatusMessage(`Failed to import: ${err.message || 'Corrupted file'}`);
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleExportPDF = async () => {
    setIsProcessing(true);
    setStatusMessage('Generating multi-page presentation PDF...');
    try {
      await exportDeckToPDF(slides, 'Infinideck');
      setStatusMessage('PDF Downloaded!');
      setTimeout(() => setIsProcessing(false), 1000);
    } catch (err) {
      console.error(err);
      setStatusMessage('PDF export failed.');
      setIsProcessing(false);
    }
  };

  const handleExportPNG = async () => {
    if (!selectedSlideId) return;
    setIsProcessing(true);
    setStatusMessage('Rendering high-res PNG image...');
    try {
      await exportSlideToPNG(selectedSlideId, `infinideck-${selectedSlideId}`);
      setStatusMessage('PNG Downloaded!');
      setTimeout(() => setIsProcessing(false), 1000);
    } catch (err) {
      console.error(err);
      setStatusMessage('PNG export failed.');
      setIsProcessing(false);
    }
  };

  const handleExportJSON = () => {
    exportDeckToJSON(slides, paintStrokes, 'infinideck');
  };

  const handleExportHTML = () => {
    exportStandaloneHTML(slides, 'Infinideck Presentation');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-200">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h3 className="font-semibold text-sm text-white">Import & Export Presentations</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/20 text-xs font-medium">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'import'
                ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import Decks (PPTX, Keynote, PDF)</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
              activeTab === 'export'
                ? 'border-sky-400 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Multiple Formats</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {activeTab === 'import' && (
            <div className="flex flex-col gap-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-700 hover:border-sky-500/80 bg-neutral-950/40 hover:bg-neutral-950/70 p-8 rounded-xl flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-sky-400 shadow-inner">
                  {isProcessing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Click to browse or drop your presentation file
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Supports Microsoft PowerPoint (.pptx), Apple Keynote (.key), PDF decks, or .cdeck (.json)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pptx,.pdf,.key,.json,.cdeck"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>

              {statusMessage && (
                <div className="text-xs text-center p-2 rounded-lg bg-neutral-800 text-neutral-300 font-medium">
                  {statusMessage}
                </div>
              )}

              <div className="bg-neutral-950/60 p-3.5 rounded-xl border border-neutral-800/80 text-xs text-neutral-400 space-y-1">
                <span className="font-semibold text-neutral-200 block mb-1">
                  How Import Works:
                </span>
                <p>• PPTX files are parsed directly in-browser using JSZip to unpack XML slide text, images, and notes.</p>
                <p>• Slides are laid out horizontally along your spatial timeline.</p>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PDF Export */}
              <button
                onClick={handleExportPDF}
                disabled={isProcessing}
                className="p-4 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-left flex flex-col gap-2 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Presentation PDF</div>
                  <div className="text-[11px] text-neutral-400">
                    High-res multi-page document for client sharing
                  </div>
                </div>
              </button>

              {/* PNG Slide Snapshot */}
              <button
                onClick={handleExportPNG}
                disabled={isProcessing}
                className="p-4 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-left flex flex-col gap-2 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FileImage className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Slide PNG Snapshot</div>
                  <div className="text-[11px] text-neutral-400">
                    Export currently selected slide as image
                  </div>
                </div>
              </button>

              {/* Standalone HTML Deck */}
              <button
                onClick={handleExportHTML}
                className="p-4 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-left flex flex-col gap-2 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Standalone Web Deck</div>
                  <div className="text-[11px] text-neutral-400">
                    Self-contained single HTML file playable in any browser
                  </div>
                </div>
              </button>

              {/* JSON Deck Backup */}
              <button
                onClick={handleExportJSON}
                className="p-4 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-neutral-700 text-left flex flex-col gap-2 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Canvas Deck (.cdeck)</div>
                  <div className="text-[11px] text-neutral-400">
                    Full project bundle with voice notes and strokes
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
