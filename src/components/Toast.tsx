import { type FC, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: FC<ToastProps> = ({ id, type, title, message, duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          messageColor: 'text-green-700',
          progressColor: 'bg-green-500',
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700',
          progressColor: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700',
          progressColor: 'bg-yellow-500',
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700',
          progressColor: 'bg-blue-500',
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div
      className={`
      relative max-w-md w-full min-w-80 ${config.bgColor} ${config.borderColor} border-2 rounded-xl shadow-xl 
      transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-right-full
    `}
    >
      {/* Progress bar */}
      <div className='absolute top-0 left-0 h-1.5 w-full bg-gray-200 rounded-t-xl overflow-hidden'>
        <div
          className={`h-full ${config.progressColor} animate-progress`}
          style={{
            animation: `progress ${duration}ms linear forwards`,
          }}
        />
      </div>

      <div className='p-5'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
          </div>
          <div className='ml-4 w-0 flex-1'>
            <p className={`text-base font-semibold ${config.titleColor}`}>{title}</p>
            {message && <p className={`mt-2 text-sm ${config.messageColor} leading-relaxed`}>{message}</p>}
          </div>
          <div className='ml-4 flex-shrink-0 flex'>
            <button
              className={`inline-flex ${config.iconColor} hover:opacity-70 transition-opacity p-1 rounded-full hover:bg-black/5`}
              onClick={() => onClose(id)}
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
