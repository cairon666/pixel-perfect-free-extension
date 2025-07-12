export enum ElementsIds {
  Menu = 'ppe-menu',
  ImagePanel = 'ppe-image-panel',
  ToggleImagePanelButton = 'ppe-toggle-image-panel',
  InsertImageByCopyButton = 'ppe-insert-image-by-copy-button',
  OverlayImage = 'ppe-image-overlay',
  DragButton = 'ppe-drag-button',
  OverlayContainer = 'ppe-overlay-container',
  ResizeHandleTopLeft = 'ppe-resize-handle-top-left',
  ResizeHandleTopRight = 'ppe-resize-handle-top-right',
  ResizeHandleBottomRight = 'ppe-resize-handle-bottom-right',
  ResizeHandleBottomLeft = 'ppe-resize-handle-bottom-left',
}

export function toDataTesId(testId: string) {
  return `[data-testid="${testId}"]`;
}
