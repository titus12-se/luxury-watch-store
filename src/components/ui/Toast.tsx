import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-6 py-4 bg-white shadow-xl border border-gray-100 transition-all duration-300 min-w-[300px]',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}
    >
      {icons[type]}
      <span className="text-sm text-navy flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-navy">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

let toastId = 0;
const listeners = new Set<(toasts: ToastItem[]) => void>();
let toasts: ToastItem[] = [];

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = ++toastId;
  toasts = [...toasts, { id, message, type }];
  notify();
}

export function removeToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function useToasts() {
  const [state, setState] = useState<ToastItem[]>([]);
  useEffect(() => {
    setState([...toasts]);
    listeners.add(setState);
    return () => { listeners.delete(setState); };
  }, []);
  return state;
}
