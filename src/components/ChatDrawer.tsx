import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Users, Sparkles } from 'lucide-react';
import { ChatMessage, Collaborator } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  collaborators: Collaborator[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  collaborators,
  onSendMessage,
  currentUserId,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed top-0 right-0 h-full w-84 z-50 bg-neutral-900/95 border-l border-neutral-800 backdrop-blur-2xl shadow-2xl flex flex-col text-neutral-200">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-sm text-white">Live Meeting Chat</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 text-neutral-400 font-mono">
            {collaborators.length} online
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Online Collaborators Stack */}
      <div className="px-4 py-2 bg-neutral-950/40 border-b border-neutral-800/80 flex items-center gap-1.5 overflow-x-auto">
        <Users className="w-3.5 h-3.5 text-neutral-500 mr-1 shrink-0" />
        {collaborators.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-neutral-800/70 border border-neutral-700/60 whitespace-nowrap"
            title={`${user.name} ${user.id === currentUserId ? '(You)' : ''}`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: user.color }}
            />
            <span className="text-neutral-300 truncate max-w-[80px]">
              {user.name.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: msg.senderColor }}
                />
                <span className="font-medium text-neutral-300">
                  {isMe ? 'You' : msg.senderName}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`px-3 py-2 rounded-xl text-xs max-w-[85%] leading-relaxed ${
                  isMe
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-neutral-800 border border-neutral-700/60 text-neutral-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a comment or feedback..."
          className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500"
        />
        <button
          type="submit"
          className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl transition disabled:opacity-50"
          disabled={!inputText.trim()}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
