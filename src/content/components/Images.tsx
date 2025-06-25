import { FiTrash2 } from 'react-icons/fi';
import { SavedImage } from 'src/store';

interface ImagesProps {
  images: SavedImage[];
  handleSelect: (img: SavedImage) => void;
  handleDelete: (id: string) => void;
}
export function Images({ images, handleSelect, handleDelete }: ImagesProps) {
  return (
    <div className='space-y-2'>
      <h4 className='text-xs font-medium text-gray-700'>
        Сохранённые изображения ({images.length}/20)
      </h4>

      {images.length === 0 ? (
        <p className='text-xs text-gray-500 text-center py-2'>Пока нет изображений</p>
      ) : (
        <div className='space-y-1 max-h-32 overflow-y-auto'>
          {images.map(img => (
            <div
              key={img.id}
              className='flex items-center gap-2 p-1 rounded border border-gray-200 hover:bg-gray-100'
            >
              <img
                src={img.dataUrl}
                alt='Saved screenshot'
                className='w-6 h-6 object-cover rounded border cursor-pointer hover:opacity-80'
                onClick={() => handleSelect(img)}
              />
              <div className='flex-1 min-w-0'>
                <p className='text-xs font-medium truncate'>{img.name || 'Без названия'}</p>
                <p className='text-xs text-gray-500'>
                  {new Date(img.created).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleSelect(img)}
                className='px-1 py-0.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100'
              >
                Показать
              </button>
              <button
                onClick={() => handleDelete(img.id)}
                className='w-5 h-5 flex items-center justify-center text-gray-500 hover:text-red-600'
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
