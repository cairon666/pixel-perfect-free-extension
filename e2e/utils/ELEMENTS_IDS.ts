export enum ElementsIds {
  Menu = 'ppe-menu',
  ImagePanel = 'ppe-image-panel',
  ToggleImagePanelButton = 'ppe-toggle-image-panel',
  InsertImageByCopyButton = 'ppe-insert-image-by-copy-button',
  OverlayImage = 'ppe-image-overlay',
}

export function toDataTesId(testId: string) {
  return `[data-testid="${testId}"]`;
}
