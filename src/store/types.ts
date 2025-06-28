import { UUID } from 'crypto';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SavedImage {
  id: UUID;
  dataUrl: string;
  created: number;
  position: Position;
  size: Size;
}

// Движение overlay
export type MoveDirection = 'up' | 'down' | 'left' | 'right';
