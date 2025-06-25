import { FiX } from "react-icons/fi";

interface CloseButtonProps {
  onClose: () => void;
}
export function CloseButton({ onClose }: CloseButtonProps) {
  return (
    <button
        onClick={onClose}
        className='cursor-pointer absolute -top-2 -left-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-colors'
        title='Закрыть меню'
      >
        <FiX size={12} />
      </button>
  );
}