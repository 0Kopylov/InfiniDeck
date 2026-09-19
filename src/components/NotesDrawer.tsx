import React, { useState } from 'react';
import {
  X,
  Lock,
  Globe,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  FileText,
  Volume2,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Slide, VoiceNote } from '../types';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface NotesDrawerProps {
  slide: Slide | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNotes: (updatedNotes: Slide['notes']) => void;
  currentUserName: string;
}

export const NotesDrawer: React.FC<NotesDrawerProps> = ({
  slide,
  isOpen,
  onClose,
  onUpdateNotes,
  currentUserName,
}) => {
  const [activeTab, setActiveTab] = useState<'private' | 'public' | 'voice'>('private');
  const [newVoiceTitle, setNewVoiceTitle] = useState('');
  const [isVoicePublic, setIsVoicePublic] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const {
    isRecording,
    duration,
    audioLevel,
    error: recordError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  if (!isOpen || !slide) return null;

  const notes = slide.notes;

  const handlePrivateNotesChange = (text: string) => {
    onUpdateNotes({
      ...notes,
      privateNotes: text,
    });
  };

  const handlePublicNotesChange = (text: string) => {
    onUpdateNotes({
      ...notes,
      publicNotes: text,
    });
  };

  const handleFinishVoiceRecording = async () => {
    const result = await stopRecording();
    if (!result) return;

    const newNote: VoiceNote = {
      id: `vn-${Date.now()}`,
      title: newVoiceTitle.trim() || `Voice Note (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      audioUrl: result.blobUrl,
      audioData: result.base64,
      duration: result.duration,
      createdAt: new Date().toLocaleDateString(),
      isPublic: isVoicePublic,
      author: currentUserName,
    };

    onUpdateNotes({
      ...notes,
      voiceNotes: [...(notes.voiceNotes || []), newNote],
    });

    setNewVoiceTitle('');
  };

  const handleDeleteVoiceNote = (id: string) => {
    onUpdateNotes({
      ...notes,
      voiceNotes: notes.voiceNotes.filter((vn) => vn.id !== id),
    });
  };

  const togglePlayAudio = (note: VoiceNote) => {
    if (playingVoiceId === note.id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(note.id);
      const audio = new Audio(note.audioUrl || note.audioData);
      audio.onended = () => setPlayingVoiceId(null);
      audio.play().catch(() => setPlayingVoiceId(null));
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-96 z-50 bg-neutral-900/95 border-l border-neutral-800 backdrop-blur-2xl shadow-2xl flex flex-col text-neutral-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-sm text-white truncate max-w-[220px]">
            {slide.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-950/40 text-xs">
        <button
          onClick={() => setActiveTab('private')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition ${
            activeTab === 'private'
              ? 'border-amber-400 text-amber-300 bg-amber-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Private Notes</span>
        </button>

        <button
          onClick={() => setActiveTab('public')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition ${
            activeTab === 'public'
              ? 'border-sky-400 text-sky-300 bg-sky-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Public Minutes</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 font-medium border-b-2 transition ${
            activeTab === 'voice'
              ? 'border-red-400 text-red-300 bg-red-500/5'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Notes</span>
          {notes.voiceNotes?.length > 0 && (
            <span className="px-1 text-[10px] bg-red-500/20 text-red-300 rounded-full">
              {notes.voiceNotes.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {activeTab === 'private' && (
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-lg">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Only visible to you (the presenter). Never shown during presentation screen share.</span>
            </div>
            <textarea
              value={notes.privateNotes || ''}
              onChange={(e) => handlePrivateNotesChange(e.target.value)}
              placeholder="Type speaker cues, pacing reminders, key talking points, confidential Q&A answers..."
              className="flex-1 w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/80 leading-relaxed resize-none"
            />
          </div>
        )}

        {activeTab === 'public' && (
          <div className="flex flex-col h-full gap-2">
            <div className="flex items-center gap-1.5 text-xs text-sky-400/90 bg-sky-950/30 border border-sky-800/40 p-2.5 rounded-lg">
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span>Shared meeting notes, decisions, and action items visible to all collaborators.</span>
            </div>
            <textarea
              value={notes.publicNotes || ''}
              onChange={(e) => handlePublicNotesChange(e.target.value)}
              placeholder="Record shared decisions, action items, assignees, and key takeaways for attendees..."
              className="flex-1 w-full bg-neutral-950/80 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-sky-500/80 leading-relaxed resize-none"
            />
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="flex flex-col gap-4">
            {/* Recorder Card */}
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Record Voice Memo
                </span>
                {isRecording && (
                  <div className="flex items-center gap-2 text-xs text-red-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>{duration}s</span>
                  </div>
                )}
              </div>

              {recordError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800/50">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{recordError}</span>
                </div>
              )}

              {/* Title & Privacy toggle */}
              <input
                type="text"
                value={newVoiceTitle}
                onChange={(e) => setNewVoiceTitle(e.target.value)}
                placeholder="Note title / topic (e.g. Q4 Budget Consensus)..."
                disabled={isRecording}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
              />

              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Visibility</span>
                <div className="flex bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                  <button
                    onClick={() => setIsVoicePublic(false)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition ${
                      !isVoicePublic ? 'bg-amber-500/20 text-amber-300' : 'text-neutral-400'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    Private
                  </button>
                  <button
                    onClick={() => setIsVoicePublic(true)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition ${
                      isVoicePublic ? 'bg-sky-500/20 text-sky-300' : 'text-neutral-400'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    Public
                  </button>
                </div>
              </div>

              {/* Audio visualizer bar when recording */}
              {isRecording && (
                <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden flex items-center px-1">
                  <div
                    className="h-2 bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-75"
                    style={{ width: `${Math.max(8, audioLevel)}%` }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-lg shadow-red-950/50"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Start Recording</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={cancelRecording}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFinishVoiceRecording}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span>Finish & Save</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Existing Voice Notes List */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Recorded Notes ({notes.voiceNotes?.length || 0})
              </span>

              {(!notes.voiceNotes || notes.voiceNotes.length === 0) && (
                <p className="text-xs text-neutral-500 italic py-4 text-center">
                  No voice notes recorded for this slide yet.
                </p>
              )}

              {notes.voiceNotes?.map((vn) => {
                const isPlaying = playingVoiceId === vn.id;

                return (
                  <div
                    key={vn.id}
                    className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-3 flex flex-col gap-2 hover:border-neutral-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePlayAudio(vn)}
                          className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-sky-600 hover:text-white text-neutral-300 flex items-center justify-center transition"
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 ml-0.5" />
                          )}
                        </button>
                        <div>
                          <div className="text-xs font-medium text-white">{vn.title}</div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                            <span>{vn.duration}s</span>
                            <span>•</span>
                            <span>{vn.author}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                            vn.isPublic
                              ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {vn.isPublic ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          {vn.isPublic ? 'Public' : 'Private'}
                        </span>
                        <button
                          onClick={() => handleDeleteVoiceNote(vn.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {vn.transcript && (
                      <p className="text-[11px] text-neutral-400 bg-neutral-900/60 p-2 rounded border border-neutral-800/60 italic">
                        "{vn.transcript}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
