import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SupportFooter } from "@/components/public/support-footer";
import { SupportHeader } from "@/components/public/support-header";
import { SupportSearchForm } from "@/components/public/support-search-form";
import {
  getSupportArticleBySlug,
  supportArticles,
  supportCategories,
} from "@/lib/support-content";

type SupportArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return supportArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: SupportArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getSupportArticleBySlug(slug);

  if (!article) {
    return {
      title: "Soporte | Restopickup",
    };
  }

  return {
    title: `${article.title} | Soporte Restopickup`,
    description: article.description,
  };
}

export default async function SupportArticlePage({
  params,
}: SupportArticlePageProps) {
  const { slug } = await params;
  const article = getSupportArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const category = supportCategories.find(
    (item) => item.slug === article.category
  );
  const relatedArticles = supportArticles
    .filter(
      (item) => item.category === article.category && item.slug !== article.slug
    )
    .slice(0, 3);
  const sectionsWithIds = article.sections.map((section) => ({
    ...section,
    id: section.title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
  }));

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <SupportHeader />
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:px-10 lg:px-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted)]">
            <Link href="/" className="transition hover:text-[var(--color-accent)]">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/soporte"
              className="transition hover:text-[var(--color-accent)]"
            >
              Soporte
            </Link>
            {category ? (
              <>
                <span>/</span>
                <span>{category.title}</span>
              </>
            ) : null}
          </div>

          <div className="max-w-5xl py-4 md:py-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              {category?.title ?? "Soporte"}
            </p>
            <h1 className="mt-5 max-w-5xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[0.98]">
              {article.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
              {article.description}
            </p>
            <p className="mt-5 text-sm font-medium text-[var(--color-secondary)]">
              Lectura estimada: {article.readTime}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 md:px-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-12">
        <article className="space-y-6">
          {sectionsWithIds.map((section) => (
            <section
              key={section.title}
              id={section.id}
              className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6 md:p-8"
            >
              <h2 className="text-2xl font-semibold tracking-tight">
                {section.title}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-base leading-8 text-[var(--color-muted)]"
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets?.length ? (
                <ul className="mt-5 space-y-3 text-base leading-8 text-[var(--color-muted)]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Buscar en soporte
            </p>
            <div className="mt-5">
              <SupportSearchForm compact articles={supportArticles} />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              En esta página
            </p>
            <div className="mt-5 space-y-3">
              {sectionsWithIds.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-sm leading-7 text-[var(--color-muted)] underline decoration-[rgba(31,26,23,0.16)] underline-offset-4 transition hover:text-[var(--color-accent)] hover:decoration-[var(--color-accent)]"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </section>

          {relatedArticles.length > 0 ? (
            <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Seguir leyendo
              </p>
              <div className="mt-5 space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/soporte/${relatedArticle.slug}`}
                    className="block rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 transition hover:border-[var(--color-accent)]"
                  >
                    <p className="text-base font-semibold text-[var(--color-foreground)]">
                      {relatedArticle.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                      {relatedArticle.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(198,90,46,0.08),rgba(255,255,255,0.95))] p-6">
            <p className="text-lg font-semibold tracking-tight">
              ¿Todavía no encontraste lo que necesitás?
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Seguimos armando ayuda específica para cada parte del dashboard. Si
              estás configurando tu local por primera vez, arrancá por onboarding,
              categorías y productos.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/soporte"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)]"
              >
                Ver más artículos
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Contacto comercial
              </Link>
            </div>
          </section>
        </aside>
      </section>

      <SupportFooter />
    </main>
  );
}
