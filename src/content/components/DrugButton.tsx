import { cn } from 'src/lib/utils';

interface DrugButtonProps {
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  isDragging: boolean;
}
export function DrugButton({ handleMouseDown, handleTouchStart, isDragging }: DrugButtonProps) {
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        'absolute -top-2 -right-2 w-5 h-5 bg-gray-600 rounded-full border-2 border-white cursor-grab hover:bg-gray-500 shadow-lg touch-none',
        {
          'cursor-grabbing bg-gray-500': isDragging,
        }
      )}
      title='Перетащить меню'
      style={{
        background: isDragging
          ? 'radial-gradient(circle, #374151 30%, #1f2937 70%)'
          : 'radial-gradient(circle, #4b5563 30%, #374151 70%)',
      }}
      data-testid='ppe-drag-button'
    >
      <div className='w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
    </div>
  );
}
