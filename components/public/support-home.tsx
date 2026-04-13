"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import type { SupportArticle, SupportCategory } from "@/lib/support-content";
import { SupportFooter } from "@/components/public/support-footer";
import { SupportSearchForm } from "@/components/public/support-search-form";

type SupportHomeProps = {
  categories: SupportCategory[];
  articles: SupportArticle[];
  initialQuery?: string;
};

function normalizeSupportSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function SupportHome({
  categories,
  articles,
  initialQuery = "",
}: SupportHomeProps) {
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = normalizeSupportSearch(deferredQuery);

  const filteredArticles = useMemo(() => {
    if (!normalizedQuery) {
      return articles;
    }

    return articles.filter((article) => {
      const haystack = normalizeSupportSearch(
        `${article.title} ${article.description} ${article.sections
          .map((section) => `${section.title} ${(section.paragraphs ?? []).join(" ")} ${(section.bullets ?? []).join(" ")}`)
          .join(" ")}`
      );

      return haystack.includes(normalizedQuery);
    });
  }, [articles, normalizedQuery]);

  const groupedArticles = useMemo(
    () =>
      categories.map((category) => ({
        category,
        articles: filteredArticles.filter((article) => article.category === category.slug),
      })),
    [categories, filteredArticles]
  );

  const featuredArticles = filteredArticles.slice(0, 4);

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 md:px-10 md:py-14 lg:px-12 lg:py-16">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[var(--color-accent)]">
              Centro de ayuda
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
              Guías pensadas para el dashboard real del local: pedidos, menú,
              horarios, pagos, modo admin y operación diaria.
            </p>
          </div>

          <div className="mx-auto w-full max-w-5xl">
            <SupportSearchForm
              initialQuery={query}
              onQueryChange={setQuery}
              articles={articles}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 lg:px-12">
        <div className="rounded-[2.25rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,#cb6d39_0%,#9e3f1f_100%)] p-8 text-white shadow-[0_24px_80px_rgba(39,24,13,0.12)] md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
            Empezar rápido
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
            <div>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
                Encontrá respuestas concretas para operar tu local todos los días.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/75">
                Desde cómo recibir pedidos hasta cómo cerrar temporalmente el menú
                o conectar cobros con Mercado Pago.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {featuredArticles.slice(0, 2).map((article) => (
                <Link
                  key={article.slug}
                  href={`/soporte/${article.slug}`}
                  className="rounded-[1.4rem] border border-white/14 bg-white/10 px-4 py-4 transition hover:bg-white/14"
                >
                  <p className="text-base font-semibold">{article.title}</p>
                  <p className="mt-2 text-sm leading-7 text-white/70">
                    {article.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 md:px-10 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              Explorar por tema
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              {normalizedQuery ? "Resultados de ayuda" : "Temas de soporte"}
            </h2>
          </div>
          {normalizedQuery ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-sm font-semibold text-[var(--color-accent)] transition hover:text-[var(--color-accent-hover)]"
            >
              Limpiar búsqueda
            </button>
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          {groupedArticles
            .filter((item) => item.articles.length > 0)
            .map(({ category, articles: categoryArticles }) => (
              <section
                key={category.slug}
                className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white"
              >
                <div className="border-b border-[var(--color-border)] px-6 py-5 md:px-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                    {category.title}
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                    {category.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3">
                  {categoryArticles.map((article) => (
                    <Link
                      key={article.slug}
                      href={`/soporte/${article.slug}`}
                      className="border-b border-[var(--color-border)] px-6 py-5 transition hover:bg-[var(--color-surface-strong)] md:border-r xl:min-h-[190px] [&:nth-child(2n)]:md:border-r-0 [&:last-child]:border-b-0 [&:nth-last-child(2)]:md:border-b-0 [&:nth-child(3n)]:xl:border-r-0 [&:nth-last-child(-n+3)]:xl:border-b-0"
                    >
                      <h3 className="text-xl font-semibold tracking-tight">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                        {article.description}
                      </p>
                      <p className="mt-5 text-sm font-medium text-[var(--color-secondary)]">
                        {article.readTime}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}

          {filteredArticles.length === 0 ? (
            <section className="rounded-[2rem] border border-[var(--color-border)] bg-white px-6 py-10 text-center">
              <h3 className="text-2xl font-semibold tracking-tight">
                No encontramos artículos para esa búsqueda
              </h3>
              <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">
                Probá con palabras como pedidos, horarios, productos, categorías o pagos.
              </p>
            </section>
          ) : null}
        </div>
      </section>

      <SupportFooter />
    </>
  );
}
