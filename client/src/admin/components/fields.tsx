import { GripVertical, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cx } from '@/components/ui/primitives';

/* ------------------------------------------------------------ scaffolding */

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-hairline bg-paper p-6 sm:p-8">
      <h2 className="font-display text-xl tracking-tight text-ink">{title}</h2>
      {hint ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
      <div className="mt-7 space-y-5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="eyebrow mb-2 block">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-ink-muted">{hint}</p> : null}
      {error ? (
        <p className="mt-1.5 text-xs text-ember" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const INPUT =
  'w-full border border-hairline bg-transparent px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none disabled:opacity-50';

export function Input({
  invalid,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...rest}
      aria-invalid={invalid}
      className={cx(INPUT, invalid && 'border-ember', className)}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...rest}
      aria-invalid={invalid}
      className={cx(INPUT, 'min-h-[5.5rem] resize-y', invalid && 'border-ember', className)}
    />
  );
}

export function Select({
  invalid,
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select
      {...rest}
      aria-invalid={invalid}
      className={cx(INPUT, 'appearance-none', invalid && 'border-ember', className)}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#B8501F]"
      />
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span> : null}
      </span>
    </label>
  );
}

/* ---------------------------------------------------------- array editors */

/** Editor for a plain list of strings (highlights, inclusions, packing list…). */
export function StringListEditor({
  label,
  hint,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const update = (index: number, value: string) => {
    onChange(values.map((v, i) => (i === index ? value : v)));
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="text-xs text-ink-muted">{values.length}</span>
      </div>
      {hint ? <p className="mb-3 text-xs text-ink-muted">{hint}</p> : null}

      <div className="space-y-2">
        {values.map((value, i) => (
          <div key={i} className="flex gap-2">
            <span className="mt-2.5 w-5 shrink-0 text-xs text-ink-muted">
              {String(i + 1).padStart(2, '0')}
            </span>
            <Input
              value={value}
              placeholder={placeholder}
              onChange={(e) => update(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              aria-label={`Remove item ${i + 1}`}
              className="flex h-[42px] w-10 shrink-0 items-center justify-center border border-hairline text-ink-muted transition-colors hover:border-ember hover:text-ember"
            >
              <Trash2 size={14} strokeWidth={1.6} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...values, ''])}
        className="mt-3 inline-flex items-center gap-2 border border-hairline px-4 py-2 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <Plus size={13} strokeWidth={1.8} />
        Add {label.toLowerCase().replace(/s$/, '')}
      </button>
    </div>
  );
}

/** Generic editor for arrays of objects — itinerary days and FAQs. */
export function ObjectListEditor<T>({
  label,
  values,
  onChange,
  blank,
  renderRow,
  addLabel,
}: {
  label: string;
  values: T[];
  onChange: (next: T[]) => void;
  blank: (index: number) => T;
  renderRow: (item: T, index: number, patch: (changes: Partial<T>) => void) => ReactNode;
  addLabel: string;
}) {
  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <span className="eyebrow">{label}</span>
        <span className="text-xs text-ink-muted">{values.length}</span>
      </div>

      <div className="space-y-3">
        {values.map((item, i) => (
          <div key={i} className="border border-hairline p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-ink-muted">
                {String(i + 1).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                aria-label={`Remove ${label} entry ${i + 1}`}
                className="p-1 text-ink-muted transition-colors hover:text-ember"
              >
                <Trash2 size={14} strokeWidth={1.6} />
              </button>
            </div>

            {renderRow(item, i, (changes) =>
              onChange(values.map((v, idx) => (idx === i ? { ...v, ...changes } : v))),
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...values, blank(values.length)])}
        className="mt-3 inline-flex items-center gap-2 border border-hairline px-4 py-2 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <Plus size={13} strokeWidth={1.8} />
        {addLabel}
      </button>
    </div>
  );
}

/** Drag handle used by the gallery reorder UI. */
export function DragHandle({ className }: { className?: string }) {
  return <GripVertical size={14} strokeWidth={1.6} className={cx('text-ink-muted', className)} />;
}
