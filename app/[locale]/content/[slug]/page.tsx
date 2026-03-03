import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import { getContentBySlug } from "@/lib/data/content-items";
import { getPublishedItemsByIds } from "@/lib/data/items-supabase";
import ItemCard from "@/components/ItemCard";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params;
  const item = await getContentBySlug(slug);
  if (!item) {
    const t = await getTranslations({ locale, namespace: "common" });
    return { title: t("contentNotFound") };
  }
  return {
    title: item.title,
    description: item.excerpt,
    openGraph: {
      title: `${item.title} | Verter`,
      description: item.excerpt,
    },
  };
}

export default async function ContentDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("content");

  const item = await getContentBySlug(slug);
  if (!item) notFound();

  const relatedItems = item.related_item_ids?.length
    ? await getPublishedItemsByIds(item.related_item_ids)
    : [];

  const typeLabels: Record<string, string> = {
    blog: t("blog"),
    review: t("review"),
    podcast: t("podcast"),
    comparison: t("comparison"),
  };

  return (
    <article className="px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/content"
          className="mb-6 inline-flex text-sm font-medium text-verter-muted hover:text-verter-graphite"
        >
          {t("backToContent")}
        </Link>

        {item.image_url && (
          <div className="mb-6 overflow-hidden rounded-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image_url}
              alt=""
              className="h-48 w-full object-cover sm:h-64"
            />
          </div>
        )}
        <span className="text-xs font-medium uppercase tracking-wider text-verter-muted">
          {typeLabels[item.type] || item.type}
        </span>
        <h1 className="mt-2 font-heading text-3xl font-bold text-verter-graphite">
          {item.title}
        </h1>
        {item.published_at && (
          <time
            dateTime={item.published_at}
            className="mt-2 block text-sm text-verter-muted"
          >
            {new Date(item.published_at).toLocaleDateString(locale, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </time>
        )}

        <div className="prose prose-zinc mt-8 max-w-none">
          <p className="text-lg text-verter-muted">{item.excerpt}</p>
          {item.body ? (
            <div className="mt-4 text-verter-graphite">
              <ReactMarkdown>{item.body}</ReactMarkdown>
            </div>
          ) : null}
          {item.episode_url && (
            <a
              href={item.episode_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-card bg-verter-forest px-4 py-2 text-sm font-medium text-white hover:bg-verter-forest/90"
            >
              {t("listenEpisode")}
            </a>
          )}
        </div>

        {relatedItems.length > 0 && (
          <section className="mt-12 border-t border-verter-border pt-12">
            <h2 className="font-heading text-xl font-semibold text-verter-graphite">
              {t("related")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {relatedItems.map((rel) => (
                <ItemCard key={rel.id} item={rel} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
