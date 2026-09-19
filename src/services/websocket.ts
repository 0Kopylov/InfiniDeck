import { Collaborator, ChatMessage, PaintStroke } from '../types';

type MessageHandler = {
  onInit?: (data: { users: Collaborator[]; messages: ChatMessage[]; paintStrokes: PaintStroke[] }) => void;
  onUserJoined?: (user: Collaborator) => void;
  onUserLeft?: (userId: string) => void;
  onCursorUpdate?: (userId: string, cursor: { x: number; y: number; slideId?: string }) => void;
  onPaintStroke?: (stroke: PaintStroke) => void;
  onPaintClear?: (slideId?: string) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onSlideSync?: (slideId: string) => void;
};

export class CollaborationService {
  private ws: WebSocket | null = null;
  private handlers: MessageHandler = {};
  private reconnectTimer: any = null;
  private currentUser: Collaborator;
  private isConnected = false;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor(currentUser: Collaborator) {
    this.currentUser = currentUser;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('canvas-presentation-collab');
      this.broadcastChannel.onmessage = (event) => {
        this.handleEvent(event.data);
      };
    }
  }

  public connect(handlers: MessageHandler) {
    this.handlers = handlers;

    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.send({
          type: 'user:join',
          payload: this.currentUser,
        });
      };

      this.ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          this.handleEvent(data);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(this.handlers);
    }, 3000);
  }

  private handleEvent(data: any) {
    switch (data.type) {
      case 'init':
        this.handlers.onInit?.(data.payload);
        break;
      case 'user:joined':
        this.handlers.onUserJoined?.(data.payload.user);
        break;
      case 'user:left':
        this.handlers.onUserLeft?.(data.payload.userId);
        break;
      case 'cursor:update':
        this.handlers.onCursorUpdate?.(data.payload.userId, data.payload.cursor);
        break;
      case 'paint:stroke':
        this.handlers.onPaintStroke?.(data.payload);
        break;
      case 'paint:clear':
        this.handlers.onPaintClear?.(data.payload.slideId);
        break;
      case 'chat:message':
        this.handlers.onChatMessage?.(data.payload);
        break;
      case 'slide:sync':
        this.handlers.onSlideSync?.(data.payload.slideId);
        break;
      default:
        break;
    }
  }

  public send(data: any) {
    // Send via WebSocket if open
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
    // Also broadcast cross-tab locally
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch {
        // ignore
      }
    }
  }

  public sendCursor(x: number, y: number, slideId?: string) {
    this.send({
      type: 'cursor:move',
      payload: { x, y, slideId },
    });
  }

  public sendStroke(stroke: PaintStroke) {
    this.send({
      type: 'paint:stroke',
      payload: stroke,
    });
  }

  public sendPaintClear(slideId?: string) {
    this.send({
      type: 'paint:clear',
      payload: { slideId },
    });
  }

  public sendChat(text: string) {
    this.send({
      type: 'chat:send',
      payload: {
        senderId: this.currentUser.id,
        senderName: this.currentUser.name,
        senderColor: this.currentUser.color,
        text,
      },
    });
  }

  public sendSlideSync(slideId: string) {
    this.send({
      type: 'slide:sync',
      payload: { slideId },
    });
  }

  public disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
    if (this.broadcastChannel) this.broadcastChannel.close();
  }
}
