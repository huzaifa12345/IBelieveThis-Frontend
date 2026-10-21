import { Link } from 'react-router-dom';
import { toFaqPageSchema } from '../content/faqs';
import { injectJsonLd, removeJsonLd } from '../utils/seo';
import { useEffect } from 'react';

const LINK_MAP = [
  { re: /Size Guide/gi, to: '/size-guide', label: 'Size Guide' },
  { re: /Shipping Policy/gi, to: '/shipping-policy', label: 'Shipping Policy' },
  { re: /Return & Exchange Policy/gi, to: '/return-policy', label: 'Return & Exchange Policy' },
  { re: /Return Policy/gi, to: '/return-policy', label: 'Return Policy' },
  { re: /Contact page/gi, to: '/contact', label: 'Contact page' },
  { re: /\bContact us\b/gi, to: '/contact', label: 'Contact us' },
  { re: /\bFAQ\b/g, to: '/faq', label: 'FAQ' },
];

/** Turn plain FAQ answers into paragraphs with internal links (AEO). */
export function FaqAnswerText({ text }) {
  if (!text) return null;
  const nodes = [];
  let remaining = String(text);
  let key = 0;

  while (remaining.length) {
    let earliest = null;
    let earliestIdx = Infinity;
    let matchLen = 0;

    for (const rule of LINK_MAP) {
      rule.re.lastIndex = 0;
      const m = rule.re.exec(remaining);
      if (m && m.index < earliestIdx) {
        earliestIdx = m.index;
        earliest = rule;
        matchLen = m[0].length;
      }
    }

    if (!earliest) {
      nodes.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliestIdx > 0) {
      nodes.push(<span key={key++}>{remaining.slice(0, earliestIdx)}</span>);
    }
    nodes.push(
      <Link key={key++} to={earliest.to} className="info-link">
        {earliest.label}
      </Link>
    );
    remaining = remaining.slice(earliestIdx + matchLen);
  }

  return <p className="info-body">{nodes}</p>;
}

/**
 * Visible FAQ block + optional FAQPage JSON-LD.
 * @param {{ faqs: Array<{q:string,a:string}>, title?: string, jsonLdId?: string, withSchema?: boolean }} props
 */
export default function FaqSection({
  faqs = [],
  title = 'Frequently asked questions',
  jsonLdId = 'seo-faq-jsonld',
  withSchema = true,
}) {
  useEffect(() => {
    if (!withSchema) return undefined;
    if (!faqs.length) {
      removeJsonLd(jsonLdId);
      return undefined;
    }
    injectJsonLd(jsonLdId, toFaqPageSchema(faqs));
    return () => removeJsonLd(jsonLdId);
  }, [faqs, jsonLdId, withSchema]);

  if (!faqs.length) return null;

  return (
    <section className="faq-section container py-4" aria-labelledby="faq-section-heading">
      <p id="faq-section-heading" className="info-eyebrow mb-3">
        {title}
      </p>
      {faqs.map((f) => (
        <article key={f.q} className="faq-item mb-4">
          <h2 className="h5 text-white fw-bold mb-2">{f.q}</h2>
          <FaqAnswerText text={f.a} />
        </article>
      ))}
    </section>
  );
}
