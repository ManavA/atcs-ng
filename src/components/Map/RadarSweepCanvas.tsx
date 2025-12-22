import { useRef } from 'react';
import { useAnimationFrame } from '../../animation';

interface RadarSweepCanvasProps {
  width: number;
  height: number;
  sweepSpeed?: number; // Seconds per rotation
  color?: string;
}

export function RadarSweepCanvas({
  width,
  height,
  sweepSpeed = 4,
  color = '#00ff88',
}: RadarSweepCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  useAnimationFrame(({ deltaTime }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.95;

    // Update sweep angle
    angleRef.current += (deltaTime / sweepSpeed) * Math.PI * 2;
    if (angleRef.current >= Math.PI * 2) angleRef.current -= Math.PI * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw phosphor decay trail
    const trailSegments = 60;
    for (let i = 0; i < trailSegments; i++) {
      const trailAngle = angleRef.current - (i / trailSegments) * Math.PI * 2;
      const decay = Math.exp(-2 * (i / trailSegments) * 3);

      if (decay < 0.01) continue;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        trailAngle - 0.02,
        trailAngle + 0.02
      );
      ctx.closePath();

      const [r, g, b] = hexToRgb(color);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${decay * 0.3})`;
      ctx.fill();
    }

    // Draw main sweep line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angleRef.current) * radius,
      centerY + Math.sin(angleRef.current) * radius
    );

    const gradient = ctx.createLinearGradient(
      centerX,
      centerY,
      centerX + Math.cos(angleRef.current) * radius,
      centerY + Math.sin(angleRef.current) * radius
    );
    gradient.addColorStop(0, `${color}00`);
    gradient.addColorStop(0.3, `${color}88`);
    gradient.addColorStop(1, color);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw glow at tip
    ctx.beginPath();
    ctx.arc(
      centerX + Math.cos(angleRef.current) * radius,
      centerY + Math.sin(angleRef.current) * radius,
      4,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw range rings
    ctx.strokeStyle = `${color}20`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 8]);
    [0.25, 0.5, 0.75, 1].forEach((r) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 400,
      }}
    />
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 255, 136];
}
