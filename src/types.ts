export type SlideType = 'meeting' | 'slide' | 'milestone';

export type TimelineCategory = 'past' | 'current' | 'future';

export interface MeetingContext {
  date: string;
  time?: string;
  attendees?: string[];
  status: 'past' | 'present' | 'future';
  summary?: string;
  agendaItem?: string;
}

export interface VoiceNote {
  id: string;
  title: string;
  audioUrl?: string;
  audioData?: string; // base64 or blob
  duration: number; // in seconds
  createdAt: string;
  isPublic: boolean;
  author: string;
  transcript?: string;
}

export interface SlideNotes {
  privateNotes: string; // Speaker-only cues & confidential points
  publicNotes: string;  // Shared meeting minutes & attendee summary
  voiceNotes: VoiceNote[];
}

export type CanvasElementType = 'markdown' | 'image' | 'youtube' | 'shape';

export interface ElementStyle {
  fontSize?: number;
  fontFamily?: 'sans' | 'serif' | 'mono';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  strikethrough?: boolean;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  opacity?: number;
  headingLevel?: 1 | 2 | 3 | 0; // 0 for normal
}

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number; // relative to slide origin (0..width)
  y: number; // relative to slide origin (0..height)
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
  content?: string; // markdown content or text
  mediaUrl?: string; // image source or youtube link
  youtubeId?: string;
  style?: ElementStyle;
}

export interface SlideTheme {
  bg: string;
  text: string;
  accent: string;
  border?: string;
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  type: SlideType;
  timelineCategory: TimelineCategory;
  meetingContext?: MeetingContext;
  x: number; // World canvas coordinates
  y: number;
  width: number;
  height: number;
  theme: SlideTheme;
  elements: CanvasElement[];
  notes: SlideNotes;
  orderIndex: number;
}

export type PaintTool = 'pen' | 'highlighter' | 'laser' | 'eraser';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface PaintStroke {
  id: string;
  slideId?: string; // if attached to slide, relative to slide, else canvas world
  userId: string;
  userName: string;
  userColor: string;
  tool: PaintTool;
  color: string;
  size: number;
  points: StrokePoint[];
  timestamp?: number;
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: {
    x: number; // Canvas world coordinate
    y: number;
    slideId?: string;
  };
  lastActive: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type ToolMode = 'select' | 'hand' | 'text' | 'image' | 'youtube' | 'paint';
