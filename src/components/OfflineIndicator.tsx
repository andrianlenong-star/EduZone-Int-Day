import React from 'react';
import { WifiOff, HardDriveDownload } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  language: 'id' | 'en';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const isEn = language === 'en';

  if (isOnline) return null;

  return (
    <div
      data-testid="offline-mode-banner"
      className="fixed bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl border border-amber-300 animate-in fade-in"
    >
      <span className="p-1 rounded-lg bg-stone-950 text-amber-400">
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      </span>
      <div className="flex flex-col">
        <span className="font-extrabold flex items-center gap-1.5">
          <span>{isEn ? 'Offline Mode Active' : 'Mode Offline Aktif'}</span>
          <span className="px-1.5 py-0.2 rounded bg-stone-950/20 text-[10px] font-mono">100% STANDALONE</span>
        </span>
        <span className="text-[11px] font-normal text-stone-900 leading-tight">
          {isEn
            ? 'Running from local device storage & IndexedDB. Videos & lessons work without internet.'
            : 'Berjalan dari memori perangkat & IndexedDB. Video & materi dapat diputar tanpa internet.'}
        </span>
      </div>
      <HardDriveDownload className="w-4 h-4 ml-auto text-stone-950/70" />
    </div>
  );
};
