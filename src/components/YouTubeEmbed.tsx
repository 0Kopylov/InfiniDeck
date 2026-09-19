import React, { useState } from 'react';
import { Youtube, ExternalLink, Edit2, Play } from 'lucide-react';
import { CanvasElement } from '../types';

interface YouTubeEmbedProps {
  element: CanvasElement;
  isSelected: boolean;
  onUpdate: (updated: Partial<CanvasElement>) => void;
  isReadOnly?: boolean;
}

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) {
    return urlOrId;
  }
  const match = urlOrId.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : '';
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  element,
  isSelected,
  onUpdate,
  isReadOnly = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputUrl, setInputUrl] = useState(element.mediaUrl || '');

  const videoId = element.youtubeId || extractYouTubeId(element.mediaUrl || '');

  const handleSave = () => {
    const id = extractYouTubeId(inputUrl);
    onUpdate({
      mediaUrl: inputUrl,
      youtubeId: id || undefined,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`relative w-full h-full rounded-lg overflow-hidden bg-neutral-900 border flex flex-col group ${
        isSelected ? 'ring-2 ring-sky-500 border-transparent' : 'border-neutral-800'
      }`}
    >
      {/* Control overlay on hover / selection */}
      {isSelected && !isReadOnly && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-neutral-700 text-xs text-neutral-200">
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 hover:text-sky-400 transition"
            title="Change video URL"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit URL</span>
          </button>
          {videoId && (
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-sky-400 p-0.5 ml-1"
              title="Open on YouTube"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Edit URL Modal / Form */}
      {isEditing && (
        <div
          className="absolute inset-0 z-30 bg-neutral-950/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center gap-3 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Youtube className="w-8 h-8 text-red-500" />
          <h4 className="text-sm font-semibold text-white">Embed YouTube Video</h4>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste YouTube URL or video ID..."
            className="w-full max-w-sm px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-neutral-400 hover:text-white rounded bg-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded transition"
            >
              Apply Video
            </button>
          </div>
        </div>
      )}

      {/* Video Player */}
      {videoId ? (
        <div className="w-full h-full relative">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="YouTube video player"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          onClick={() => !isReadOnly && setIsEditing(true)}
          className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-neutral-200 cursor-pointer bg-neutral-900/50"
        >
          <Youtube className="w-10 h-10 text-neutral-600 group-hover:text-red-500 transition" />
          <span className="text-xs font-medium">Click to set YouTube Video URL</span>
        </div>
      )}
    </div>
  );
};
