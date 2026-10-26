export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-button";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 hover:bg-brand-600 text-white shadow-sm focus:ring-brand-500",
    secondary:
      "bg-white hover:bg-surface-subtle text-ink-primary border border-border-subtle shadow-sm focus:ring-brand-500",
    danger:
      "bg-status-occupied hover:bg-red-700 text-white shadow-sm focus:ring-red-500",
    outline:
      "border border-brand-500 text-brand-500 hover:bg-brand-50 focus:ring-brand-500",
    ghost:
      "text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle focus:ring-brand-500",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
