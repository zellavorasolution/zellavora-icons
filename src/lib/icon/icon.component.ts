import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  isDevMode,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ZvIconRegistry } from '../core/icon-registry.service';
import type { ZvIconVariant } from '../core/icon-definition';

export type ZvIconFlip = 'horizontal' | 'vertical' | 'both';
export type ZvIconSize = number | string;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toCssLength(value: ZvIconSize): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * `<zv-icon>` — the single rendering surface of the ecosystem.
 *
 * - Signal-first: every input is a signal, all derived state is `computed`.
 * - SSR/hydration-safe: renders synchronously from the in-memory registry, no HTTP.
 * - Themeable: the body uses `currentColor`, so CSS `color` (or the `color` input)
 *   drives fill/stroke. Stroke width, rotation, flip, and animations are CSS-driven.
 * - Accessible: decorative by default (`aria-hidden`), promoted to `role="img"`
 *   with a `<title>` the moment a `title`/`ariaLabel` is supplied.
 */
@Component({
  selector: 'zv-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `<svg
    xmlns="http://www.w3.org/2000/svg"
    [attr.viewBox]="viewBox()"
    [attr.width]="resolvedWidth()"
    [attr.height]="resolvedHeight()"
    [attr.fill]="fillAttr()"
    [attr.stroke]="strokeAttr()"
    [attr.stroke-width]="strokeAttr() ? effectiveStrokeWidth() : null"
    [attr.stroke-linecap]="strokeAttr() ? lineCap() : null"
    [attr.stroke-linejoin]="strokeAttr() ? lineJoin() : null"
    [attr.role]="labelled() ? 'img' : null"
    [attr.aria-label]="labelled() ? label() : null"
    [attr.aria-hidden]="labelled() ? null : 'true'"
    [attr.focusable]="'false'"
    [style.transform]="transform()"
    [innerHTML]="safeBody()"
  ></svg>`,
  host: {
    class: 'zv-icon',
    '[style.color]': 'color() ?? null',
    '[class.zv-icon--spin]': 'spin()',
    '[class.zv-icon--pulse]': 'pulse()',
  },
  styles: [
    `
      .zv-icon {
        display: inline-flex;
        line-height: 0;
        vertical-align: middle;
      }
      .zv-icon > svg {
        display: block;
        transition: transform 120ms ease;
      }
      .zv-icon--spin > svg {
        animation: zv-icon-spin 1s linear infinite;
      }
      .zv-icon--pulse > svg {
        animation: zv-icon-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      @keyframes zv-icon-spin {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes zv-icon-pulse {
        50% {
          opacity: 0.4;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .zv-icon--spin > svg,
        .zv-icon--pulse > svg {
          animation: none;
        }
      }
    `,
  ],
})
export class ZvIconComponent {
  private readonly registry = inject(ZvIconRegistry);
  private readonly sanitizer = inject(DomSanitizer);

  /** Registered icon name, e.g. "home". */
  readonly name = input.required<string>();
  /** Icon variant. Overridden by `filled`/`rounded` convenience inputs. */
  readonly variant = input<ZvIconVariant>('outline');
  /** Shorthand for both width and height. Accepts px number or CSS length. */
  readonly size = input<ZvIconSize>('1em');
  readonly width = input<ZvIconSize | undefined>(undefined);
  readonly height = input<ZvIconSize | undefined>(undefined);
  /** Drives `currentColor` on the rendered SVG. */
  readonly color = input<string | undefined>(undefined);
  readonly strokeWidth = input<number | string | undefined>(undefined);
  readonly filled = input(false);
  readonly rounded = input(false);
  /** Rotation in degrees. */
  readonly rotate = input(0);
  readonly flip = input<ZvIconFlip | undefined>(undefined);
  readonly spin = input(false);
  readonly pulse = input(false);
  /** Accessible title; also rendered as an SVG `<title>`. */
  readonly title = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);

  /** The variant actually resolved, honoring the `filled`/`rounded` shortcuts. */
  readonly effectiveVariant = computed<ZvIconVariant>(() =>
    this.filled() ? 'filled' : this.rounded() ? 'rounded' : this.variant(),
  );

  private readonly definition = computed(() => {
    const def = this.registry.resolve(this.name(), this.effectiveVariant());
    if (!def && isDevMode()) {
      console.warn(
        `[zv-icon] Icon "${this.effectiveVariant()}/${this.name()}" is not registered. ` +
          `Did you pass it to provideZvIcons()?`,
      );
    }
    return def;
  });

  readonly viewBox = computed(() => this.definition()?.viewBox ?? '0 0 24 24');

  /** Variants whose geometry is drawn with strokes rather than fills. */
  private readonly strokeBased = computed(() =>
    (['outline', 'rounded', 'sharp'] as ZvIconVariant[]).includes(this.effectiveVariant()),
  );

  readonly fillAttr = computed(() => (this.strokeBased() ? 'none' : 'currentColor'));
  readonly strokeAttr = computed(() => (this.strokeBased() ? 'currentColor' : null));
  readonly effectiveStrokeWidth = computed(() => this.strokeWidth() ?? 2);
  readonly lineCap = computed(() => (this.effectiveVariant() === 'sharp' ? 'butt' : 'round'));
  readonly lineJoin = computed(() => (this.effectiveVariant() === 'sharp' ? 'miter' : 'round'));

  readonly label = computed(() => this.ariaLabel() ?? this.title());
  readonly labelled = computed(() => !!this.label());

  readonly resolvedWidth = computed(() => toCssLength(this.width() ?? this.size()));
  readonly resolvedHeight = computed(() => toCssLength(this.height() ?? this.size()));

  readonly transform = computed(() => {
    const parts: string[] = [];
    const rotate = this.rotate();
    if (rotate) parts.push(`rotate(${rotate}deg)`);
    const flip = this.flip();
    if (flip === 'horizontal' || flip === 'both') parts.push('scaleX(-1)');
    if (flip === 'vertical' || flip === 'both') parts.push('scaleY(-1)');
    return parts.length ? parts.join(' ') : null;
  });

  readonly safeBody = computed<SafeHtml>(() => {
    const body = this.definition()?.body ?? '';
    const title = this.title();
    const markup = title ? `<title>${escapeXml(title)}</title>${body}` : body;
    // Body originates from our own deterministic pipeline, which rejects
    // <script> and inline handlers during validation — it is trusted markup.
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}
