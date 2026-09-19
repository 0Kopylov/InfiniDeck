import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, Type, Palette, Sparkles, Check } from 'lucide-react';
import { CanvasElement, ElementStyle } from '../types';

interface MarkdownEditorProps {
  element: CanvasElement;
  isSelected: boolean;
  onUpdate: (updated: Partial<CanvasElement>) => void;
  onDelete: () => void;
  isReadOnly?: boolean;
}

const COLOR_PALETTE = [
  '#f4f4f5', // white/zinc
  '#38bdf8', // sky blue
  '#34d399', // emerald green
  '#fbbf24', // amber yellow
  '#f87171', // red
  '#c084fc', // purple
  '#fb923c', // orange
  '#94a3b8', // slate gray
];

const FONTS = [
  { label: 'Sans', value: 'sans', style: 'font-sans' },
  { label: 'Serif', value: 'serif', style: 'font-serif' },
  { label: 'Mono', value: 'mono', style: 'font-mono' },
] as const;

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  element,
  isSelected,
  onUpdate,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(element.content || '');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const style: ElementStyle = element.style || {};
  const currentFont = style.fontFamily || 'sans';
  const currentColor = style.color || '#f4f4f5';
  const fontSize = style.fontSize || 16;

  useEffect(() => {
    setContent(element.content || '');
  }, [element.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate({ content });
  };

  const applyFormatting = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setContent(newText);
    onUpdate({ content: newText });
  };

  const fontClass =
    currentFont === 'serif' ? 'font-serif' : currentFont === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div
      className={`relative w-full h-full flex flex-col group ${
        isSelected ? 'ring-2 ring-sky-500/80 rounded-lg' : ''
      }`}
      style={{
        backgroundColor: style.backgroundColor || 'transparent',
        borderRadius: style.borderRadius || 8,
        borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
        borderColor: style.borderColor || 'transparent',
      }}
    >
      {/* Inline Formatting Toolbar on selection */}
      {isSelected && !isReadOnly && (
        <div
          className="absolute -top-12 left-0 z-30 flex items-center gap-1 px-2 py-1.5 bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-md rounded-lg shadow-xl text-neutral-200 text-xs"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Font Family */}
          <div className="flex bg-neutral-800 rounded p-0.5 border border-neutral-700">
            {FONTS.map((f) => (
              <button
                key={f.value}
                onClick={() =>
                  onUpdate({ style: { ...style, fontFamily: f.value } })
                }
                className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition ${
                  currentFont === f.value ? 'bg-neutral-700 text-sky-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-neutral-700 mx-0.5" />

          {/* Size */}
          <button
            onClick={() => onUpdate({ style: { ...style, fontSize: Math.max(12, fontSize - 2) } })}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Smaller text"
          >
            A-
          </button>
          <span className="text-[11px] font-mono px-1 text-neutral-400">{fontSize}px</span>
          <button
            onClick={() => onUpdate({ style: { ...style, fontSize: Math.min(48, fontSize + 2) } })}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Larger text"
          >
            A+
          </button>

          <div className="h-4 w-[1px] bg-neutral-700 mx-0.5" />

          {/* Markdown Quick Modifiers */}
          <button
            onClick={() => applyFormatting('**', '**')}
            className={`p-1 hover:bg-neutral-800 rounded ${style.bold ? 'text-sky-400' : 'text-neutral-300'}`}
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('*', '*')}
            className={`p-1 hover:bg-neutral-800 rounded ${style.italic ? 'text-sky-400' : 'text-neutral-300'}`}
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('~~', '~~')}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Strikethrough (~~text~~)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('### ')}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Heading 3 (### )"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => applyFormatting('* ')}
            className="p-1 hover:bg-neutral-800 rounded text-neutral-300"
            title="Bullet List (* )"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-neutral-700 mx-0.5" />

          {/* Color Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1 hover:bg-neutral-800 rounded flex items-center gap-1 text-neutral-300"
              title="Text Color"
            >
              <Palette className="w-3.5 h-3.5" />
              <div
                className="w-3 h-3 rounded-full border border-neutral-600"
                style={{ backgroundColor: currentColor }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute top-8 left-0 z-40 p-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl grid grid-cols-4 gap-1.5">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdate({ style: { ...style, color: c } });
                      setShowColorPicker(false);
                    }}
                    className="w-5 h-5 rounded-full border border-neutral-700 hover:scale-110 transition flex items-center justify-center"
                    style={{ backgroundColor: c }}
                  >
                    {currentColor === c && <Check className="w-3 h-3 text-neutral-950" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className="w-full h-full p-4 overflow-y-auto cursor-text select-text"
        onDoubleClick={() => !isReadOnly && setIsEditing(true)}
      >
        {isEditing && !isReadOnly ? (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleBlur();
            }}
            style={{
              fontSize: `${fontSize}px`,
              color: currentColor,
            }}
            className={`w-full h-full bg-transparent resize-none outline-none ${fontClass} leading-relaxed`}
            placeholder="Type markdown text here... (Double click to edit, Esc to save)"
          />
        ) : (
          <div
            style={{
              fontSize: `${fontSize}px`,
              color: currentColor,
            }}
            className={`prose prose-invert max-w-none ${fontClass} leading-relaxed`}
          >
            <ReactMarkdown>{content || '*Double click to edit markdown text*'}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
