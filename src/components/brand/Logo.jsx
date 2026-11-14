"use client";

import Link from "next/link";

/**
 * Where Did I Park? — Official Brand Logo
 * Features the signature Two-Wheeler Motorcycle location pin mark
 * with glowing neon green headlights, orbital sweep, and integrated wordmark.
 */

export function LogoMark({ size = 38, className = "" }) {
  const s = size;
  return (
    <img
      src="/images/logo-icon.png"
      alt="Where Did I Park Mark"
      width={s}
      height={s}
      className={`shrink-0 object-contain transition-transform duration-200 hover:scale-[1.05] ${className}`}
      style={{
        width: `${s}px`,
        height: `${s}px`,
      }}
    />
  );
}

/**
 * Full Brand Logo with Wordmark
 * Supports:
 * - variant: "light" (for light/beige pages) | "dark" (for dark footers/modals)
 * - href: optional link destination (defaults to "/")
 * - size: height in pixels (defaults to 38)
 */
export default function Logo({
  variant = "light",
  href = "/",
  size = 38,
  className = "",
}) {
  const isDark = variant === "dark";

  const content = (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{
        filter: isDark
          ? "brightness(1.25) drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
          : "none",
      }}
    >
      <img
        src="/images/logo.png"
        alt="Where Did I Park?"
        height={size}
        className="transition-transform duration-200 hover:scale-[1.02] object-contain"
        style={{
          height: `${size}px`,
          width: "auto",
          maxWidth: "none",
          display: "block",
        }}
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center text-decoration-none group">
        {content}
      </Link>
    );
  }

  return content;
}


