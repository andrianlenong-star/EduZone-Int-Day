import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language: 'id' | 'en';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);
  const isEn = language === 'en';

  // Sembunyikan tombol jika sudah berjalan dalam mode PWA Standalone di HP/Desktop
  if (isInstalled) {
    return null;
  }

  // Alur instalasi Android / Chrome / Edge / Desktop
  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install App for Offline Use"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-xs hover:brightness-110 active:scale-95 transition shadow-md border border-amber-400"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isEn ? 'Install App (Offline)' : 'Pasang Aplikasi (Offline)'}</span>
      </button>
    );
  }

  // Alur panduan instalasi iOS Safari
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iPhone / iPad"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white font-semibold text-xs transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-400" />
          <span>{isEn ? 'Install on iOS' : 'Pasang di iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-5 text-stone-100 shadow-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-amber-400">
                    {isEn ? 'Install on iPhone / iPad' : 'Pasang di iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs space-y-2 text-stone-300">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">1.</span>
                  <span>
                    {isEn
                      ? 'Tap the Share button (box with upward arrow) in the Safari toolbar.'
                      : 'Ketuk tombol Bagikan (ikon kotak dengan panah ke atas) di menu Safari.'}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">2.</span>
                  <span>
                    {isEn
                      ? 'Scroll down and select "Add to Home Screen".'
                      : 'Gulir ke bawah dan pilih "Tambahkan ke Layar Utama" (Add to Home Screen).'}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-emerald-300">
                    {isEn
                      ? 'The app and videos can now run directly offline from your home screen!'
                      : 'Aplikasi dan video kini dapat langsung dijalankan offline dari layar utama HP!'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition"
              >
                {isEn ? 'Got it' : 'Mengerti'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
