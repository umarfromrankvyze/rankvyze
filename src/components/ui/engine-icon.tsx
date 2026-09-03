const ENGINE_META: Record<string, { name: string; color: string; short: string }> = {
  chatgpt: { name: "ChatGPT", color: "var(--color-engine-chatgpt)", short: "GPT" },
  perplexity: { name: "Perplexity", color: "var(--color-engine-perplexity)", short: "PX" },
  gemini: { name: "Gemini", color: "var(--color-engine-gemini)", short: "GM" },
  claude: { name: "Claude", color: "var(--color-engine-claude)", short: "CL" },
};

export function engineMeta(key: string) {
  return ENGINE_META[key] ?? { name: key, color: "var(--color-ink-muted)", short: key.slice(0, 2).toUpperCase() };
}

/**
 * Simple geometric glyphs per engine — deliberately not vendor logos.
 */
export function EngineIcon({ engine, size = 18, className }: { engine: string; size?: number; className?: string }) {
  const meta = engineMeta(engine);
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const };
  const stroke = { stroke: meta.color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (engine) {
    case "chatgpt":
      return (
        <svg {...common} className={className}>
          <circle cx="12" cy="12" r="8.5" {...stroke} />
          <path d="M8 12h8M12 8v8" {...stroke} />
        </svg>
      );
    case "perplexity":
      return (
        <svg {...common} className={className}>
          <path d="M5 9l7-4 7 4-7 4-7-4z" {...stroke} />
          <path d="M5 9v6l7 4 7-4V9" {...stroke} />
        </svg>
      );
    case "gemini":
      return (
        <svg {...common} className={className}>
          <path d="M12 3c0 5 4 9 9 9-5 0-9 4-9 9 0-5-4-9-9-9 5 0 9-4 9-9z" fill={meta.color} />
        </svg>
      );
    case "claude":
      return (
        <svg {...common} className={className}>
          <path d="M12 4v16M5 8l14 8M5 16l14-8" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg {...common} className={className}>
          <rect x="4" y="4" width="16" height="16" rx="4" {...stroke} />
        </svg>
      );
  }
}
