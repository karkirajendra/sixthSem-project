import { Toaster } from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: '80px', // 30px below navbar
        right: '20px'
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#ffffff',
          color: '#1f2937', // gray-800
          padding: '16px 20px',
          borderRadius: '12px',
          fontSize: '14px',
          lineHeight: '1.5',
          maxWidth: '380px',
          border: '1px solid #e5e7eb', // gray-200
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        },
        success: {
          icon: <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />,
          style: {
            background: '#ffffff',
            border: '1px solid #10b981', // emerald-500
            color: '#065f46', // emerald-800
          },
        },
        error: {
          icon: <XCircle size={20} className="text-rose-500 flex-shrink-0" />,
          style: {
            background: '#ffffff',
            border: '1px solid #ef4444', // rose-500
            color: '#991b1b', // rose-800
          },
        },
        loading: {
          icon: <Loader2 size={20} className="text-blue-500 animate-spin flex-shrink-0" />,
          style: {
            background: '#ffffff',
            border: '1px solid #3b82f6', // blue-500
            color: '#1e40af', // blue-800
          },
        },
      }}
    />
  );
};

export default CustomToaster;