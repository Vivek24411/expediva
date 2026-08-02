import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { imageAt } from '@/lib/image';

export interface LightboxPhoto {
  src: string;
  tripTitle: string;
  destination: string;
}

export function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: LightboxPhoto[];
  /** null closes the lightbox. */
  index: number | null;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onNavigate((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, step]);

  const photo = index !== null ? photos[index] : null;

  return (
    <AnimatePresence>
      {open && photo ? (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-pitch/97"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${photo.tripTitle} — photo ${index + 1} of ${photos.length}`}
        >
          <div className="flex items-center justify-between px-5 py-4 text-paper sm:px-8">
            <div className="min-w-0">
              <p className="truncate font-display text-lg tracking-tight">{photo.tripTitle}</p>
              <p className="mt-0.5 text-xs text-paper/50">
                {photo.destination} · {index + 1} / {photos.length}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close gallery"
              className="-mr-2 shrink-0 p-2 text-paper/70 hover:text-paper"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6 sm:px-16">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={photo.src}
                src={imageAt(photo.src, 1600)}
                alt={`${photo.tripTitle} — ${photo.destination}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                className="max-h-full max-w-full object-contain"
              />
            </AnimatePresence>

            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-paper/60 transition-colors hover:text-paper sm:left-4"
                >
                  <ArrowLeft size={22} strokeWidth={1.4} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center text-paper/60 transition-colors hover:text-paper sm:right-4"
                >
                  <ArrowRight size={22} strokeWidth={1.4} />
                </button>
              </>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
