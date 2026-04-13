"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";

type SupportSearchArticle = {
  slug: string;
  title: string;
  description: string;
};

type SupportSearchFormProps = {
  initialQuery?: string;
  compact?: boolean;
  onQueryChange?: (value: string) => void;
  articles?: SupportSearchArticle[];
};

function normalizeSupportSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function SupportSearchForm({
  initialQuery = "",
  compact = false,
  onQueryChange,
  articles = [],
}: SupportSearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const normalizedQuery = normalizeSupportSearch(query);
  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return articles
      .filter((article) =>
        normalizeSupportSearch(`${article.title} ${article.description}`).includes(
          normalizedQuery
        )
      )
      .slice(0, 5);
  }, [articles, normalizedQuery]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    router.push(trimmedQuery ? `/soporte?q=${encodeURIComponent(trimmedQuery)}` : "/soporte");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div
        className={`rounded-[1.9rem] border border-[var(--color-border)] bg-white shadow-[0_18px_50px_rgba(39,24,13,0.08)] ${
          compact ? "p-1.5" : "p-2"
        }`}
      >
        <div className={`flex items-center gap-3 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
          <Search className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onQueryChange?.(event.target.value);
            }}
            placeholder="Buscá por pedidos, productos, horarios o pagos..."
            className={`w-full bg-transparent outline-none placeholder:text-[var(--color-muted)] ${
              compact ? "text-sm" : "text-base"
            }`}
          />
          <button
            type="submit"
            className={`shrink-0 rounded-full bg-[var(--color-accent)] font-semibold text-white transition hover:bg-[var(--color-accent-hover)] ${
              compact ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm"
            }`}
          >
            Buscar
          </button>
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-30 overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white shadow-[0_20px_60px_rgba(39,24,13,0.12)]">
          {suggestions.map((article) => (
            <Link
              key={article.slug}
              href={`/soporte/${article.slug}`}
              className="block border-b border-[var(--color-border)] px-4 py-3 transition hover:bg-[var(--color-surface-strong)] last:border-b-0"
            >
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                {article.title}
              </p>
              <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">
                {article.description}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
