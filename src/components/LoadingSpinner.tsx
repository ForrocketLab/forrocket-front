import { Loader2 } from 'lucide-react'; // Ícone de loading popular e elegante

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className = 'w-10 h-10' }: LoadingSpinnerProps) => {
  return <Loader2 className={`animate-spin text-blue-400 ${className}`} />;
};

export default LoadingSpinner;
