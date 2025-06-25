// Типы для store
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SavedImage {
  id: string;
  dataUrl: string;
  created: number;
  name?: string;
  position?: Position;
  size?: Size;
}

// Движение overlay
export type MoveDirection = 'up' | 'down' | 'left' | 'right';
