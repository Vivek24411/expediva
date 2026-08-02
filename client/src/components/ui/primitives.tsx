import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { imageAt, srcSet } from '@/lib/image';

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** Uppercase micro-label used as a section eyebrow. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx('eyebrow', className)}>{children}</p>;
}

/** Thin editorial separator. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cx('hairline', className)} />;
}

interface ImgProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Only the hero above the fold should be eager. */
  priority?: boolean;
  /**
   * Fallback width for the `src` attribute — browsers that ignore srcset get this.
   * Keep it near the real display size so a card doesn't download a 1920px file.
   */
  baseWidth?: number;
  width?: number;
  height?: number;
}

/** <img> with Cloudinary/Unsplash srcset and lazy loading by default. */
export function Img({
  src,
  alt,
  className,
  sizes,
  priority = false,
  baseWidth,
  width,
  height,
}: ImgProps) {
  // React 18 doesn't map camelCase `fetchPriority` to the DOM attribute and warns
  // about it, so pass the lowercase attribute the HTML spec actually defines.
  const priorityAttr = priority ? { fetchpriority: 'high' } : {};

  return (
    <img
      {...priorityAttr}
      src={imageAt(src, baseWidth ?? (priority ? 1600 : 1024))}
      srcSet={srcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
    />
  );
}

type ButtonTone = 'ember' | 'ink' | 'ghost' | 'invert';

const TONES: Record<ButtonTone, string> = {
  ember: 'bg-ember text-paper hover:bg-ember-deep',
  ink: 'bg-ink text-paper hover:bg-pitch',
  invert: 'bg-paper text-ink hover:bg-sand',
  ghost: 'border border-current bg-transparent hover:bg-ink hover:text-paper',
};

const BUTTON_BASE =
  'group/btn inline-flex items-center justify-center gap-2.5 px-7 py-4 text-sm font-medium tracking-wide transition-colors duration-300 ease-editorial disabled:cursor-not-allowed disabled:opacity-45';

interface ActionProps {
  children: ReactNode;
  tone?: ButtonTone;
  className?: string;
}

export function ButtonLink({
  to,
  children,
  tone = 'ember',
  className,
}: ActionProps & { to: string }) {
  return (
    <Link to={to} className={cx(BUTTON_BASE, TONES[tone], className)}>
      {children}
    </Link>
  );
}

export function ExternalButton({
  href,
  children,
  tone = 'ember',
  className,
}: ActionProps & { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx(BUTTON_BASE, TONES[tone], className)}
    >
      {children}
    </a>
  );
}

export function Button({
  children,
  tone = 'ember',
  className,
  ...rest
}: ActionProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cx(BUTTON_BASE, TONES[tone], className)} {...rest}>
      {children}
    </button>
  );
}

/** Shimmer placeholder used by every loading state. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx('relative overflow-hidden bg-sand/70', className)}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
}

/** Shared empty / error state so every page fails the same way. */
export function Notice({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-hairline bg-paper px-8 py-16 text-center">
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-prose text-sm leading-relaxed text-ink-soft">{body}</p>
      {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
    </div>
  );
}
