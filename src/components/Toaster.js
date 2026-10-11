'use client';
import { useState, useEffect } from 'react';
import { subscribeToast } from '@/lib/toast';

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast((t) => {
      setToasts(prev => [...prev, t]);
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id));
      }, 3500);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '28px',
      display: 'flex', flexDirection: 'column', gap: '10px',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#2A3F4F' : t.type === 'warning' ? '#FF6B00' : '#0B2F4B',
          color: 'white',
          borderRadius: '14px',
          padding: '14px 20px',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '260px',
          maxWidth: '400px',
          animation: 'slideUp 0.25s ease',
          borderLeft: `4px solid ${t.type === 'error' ? '#EF5350' : t.type === 'warning' ? '#FFB300' : '#A5C9B9'}`,
        }}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>
            {t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : '✓'}
          </span>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
