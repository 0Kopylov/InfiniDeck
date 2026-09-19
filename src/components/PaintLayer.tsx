import React, { useRef, useEffect, useCallback } from 'react';
import { PaintStroke, PaintTool, StrokePoint } from '../types';

interface PaintLayerProps {
  slideId?: string;
  width: number;
  height: number;
  strokes: PaintStroke[];
  currentTool: PaintTool;
  brushColor: string;
  brushSize: number;
  isPaintingActive: boolean;
  onAddStroke: (stroke: PaintStroke) => void;
  userId: string;
  userName: string;
  userColor: string;
}

export const PaintLayer: React.FC<PaintLayerProps> = ({
  slideId,
  width,
  height,
  strokes,
  currentTool,
  brushColor,
  brushSize,
  isPaintingActive,
  onAddStroke,
  userId,
  userName,
  userColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<StrokePoint[]>([]);

  // Filter strokes relevant to this layer (either this slideId or canvas-wide)
  const relevantStrokes = strokes.filter(
    (s) => s.slideId === slideId || (!slideId && !s.slideId)
  );

  // Redraw all strokes whenever strokes or size changes
  const renderStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of relevantStrokes) {
      if (stroke.points.length < 2) continue;

      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }

      ctx.lineWidth = stroke.size;

      if (stroke.tool === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = stroke.color;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      } else if (stroke.tool === 'laser') {
        ctx.shadowColor = stroke.color;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = stroke.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = stroke.color;
        ctx.stroke();
      }
    }
  }, [relevantStrokes, width, height]);

  useEffect(() => {
    renderStrokes();
  }, [renderStrokes]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPaintingActive) return;
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    isDrawingRef.current = true;
    currentPointsRef.current = [{ x, y }];

    // If laser or pen, draw immediate dot
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = brushColor;
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isPaintingActive) return;
    e.stopPropagation();

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const points = currentPointsRef.current;
    const prevPoint = points[points.length - 1];

    points.push({ x, y });

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && prevPoint) {
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;

      if (currentTool === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = brushColor;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      } else if (currentTool === 'laser') {
        ctx.shadowColor = brushColor;
        ctx.shadowBlur = 14;
        ctx.strokeStyle = brushColor;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = brushColor;
        ctx.stroke();
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !isPaintingActive) return;
    e.stopPropagation();
    isDrawingRef.current = false;

    if (currentPointsRef.current.length > 0) {
      const stroke: PaintStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        slideId,
        userId,
        userName,
        userColor,
        tool: currentTool,
        color: brushColor,
        size: brushSize,
        points: [...currentPointsRef.current],
        timestamp: Date.now(),
      };
      onAddStroke(stroke);
      currentPointsRef.current = [];
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`absolute inset-0 w-full h-full z-20 ${
        isPaintingActive ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
      }`}
    />
  );
};
