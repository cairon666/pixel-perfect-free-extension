import { cn } from 'src/lib/utils';

interface DrugButtonProps {
  handleMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}
export function DrugButton({ handleMouseDown, isDragging }: DrugButtonProps) {
  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'absolute -top-2 -right-2 w-5 h-5 bg-gray-600 rounded-full border-2 border-white cursor-grab hover:bg-gray-500 shadow-lg',
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
    >
      <div className='w-1.5 h-1.5 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' />
    </div>
  );
}
