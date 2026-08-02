import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { cx } from '@/components/ui/primitives';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';
import { imageAt } from '@/lib/image';

/**
 * Uploads to /api/upload and manages the ordered image list.
 * The first image is the hero — reordering is how you change it.
 */
export function ImageManager({
  heroImage,
  gallery,
  onChange,
  error,
}: {
  heroImage: string;
  gallery: string[];
  onChange: (next: { heroImage: string; gallery: string[] }) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [urlDraft, setUrlDraft] = useState('');

  // One flat ordered list; index 0 is always the hero.
  const images = heroImage ? [heroImage, ...gallery] : gallery;

  const commit = (next: string[]) => {
    onChange({ heroImage: next[0] ?? '', gallery: next.slice(1) });
  };

  const upload = useMutation({
    mutationFn: (files: File[]) => api.uploadImages(files),
    onSuccess: ({ urls }) => {
      commit([...images, ...urls]);
      toast.success(`${urls.length} image${urls.length === 1 ? '' : 's'} uploaded.`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const onPick = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    upload.mutate(Array.from(fileList));
    // Let the same file be picked again after a failed upload.
    if (inputRef.current) inputRef.current.value = '';
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next);
  };

  const addUrl = () => {
    const trimmed = urlDraft.trim();
    if (!trimmed) return;

    try {
      new URL(trimmed);
    } catch {
      toast.error('That does not look like a valid URL.');
      return;
    }

    commit([...images, trimmed]);
    setUrlDraft('');
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="eyebrow">Images</span>
        <span className="text-xs text-ink-muted">{images.length}</span>
      </div>
      <p className="mb-4 text-xs text-ink-muted">
        The first image is the hero. Reorder to change it.
      </p>

      {images.length > 0 ? (
        <ul className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((src, i) => (
            <li key={`${src}-${i}`} className="group relative border border-hairline bg-sand">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={imageAt(src, 400)}
                  alt={i === 0 ? 'Hero image' : `Gallery image ${i}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>

              {i === 0 ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 bg-ember px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-paper">
                  <Star size={10} strokeWidth={2} />
                  Hero
                </span>
              ) : null}

              <div className="flex items-center justify-between border-t border-hairline bg-paper px-1.5 py-1.5">
                <div className="flex gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0}
                    aria-label={`Move image ${i + 1} earlier`}
                    className="p-1.5 text-ink-muted transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <ArrowLeft size={13} strokeWidth={1.7} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, i + 1)}
                    disabled={i === images.length - 1}
                    aria-label={`Move image ${i + 1} later`}
                    className="p-1.5 text-ink-muted transition-colors hover:text-ink disabled:opacity-25"
                  >
                    <ArrowRight size={13} strokeWidth={1.7} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => commit(images.filter((_, idx) => idx !== i))}
                  aria-label={`Remove image ${i + 1}`}
                  className="p-1.5 text-ink-muted transition-colors hover:text-ember"
                >
                  <Trash2 size={13} strokeWidth={1.7} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
          className={cx(
            'inline-flex items-center gap-2 border border-hairline px-5 py-3 text-sm transition-colors',
            upload.isPending
              ? 'text-ink-muted'
              : 'text-ink-soft hover:border-ink hover:text-ink',
          )}
        >
          <ImagePlus size={15} strokeWidth={1.6} />
          {upload.isPending ? 'Uploading…' : 'Upload images'}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          hidden
          onChange={(e) => onPick(e.target.files)}
        />
      </div>

      {/* Escape hatch so trips can be created before Cloudinary is wired up. */}
      <div className="mt-4 flex gap-2">
        <input
          type="url"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="…or paste an image URL"
          className="w-full border border-hairline bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={addUrl}
          className="shrink-0 border border-hairline px-5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
        >
          Add
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-xs text-ember" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
