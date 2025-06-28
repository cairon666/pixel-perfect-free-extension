import { ErrorBoundary } from 'src/components/ErrorBoundar';
import { ReatomProvider, ctx } from 'src/store';

import { Menu } from './components/Menu';
import { Overlay } from './components/Overlay';

export function PixelPerfectApp() {
  return (
    <ErrorBoundary>
      <ReatomProvider value={ctx}>
        <Menu />
        <Overlay />
      </ReatomProvider>
    </ErrorBoundary>
  );
}
