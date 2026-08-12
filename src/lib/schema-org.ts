export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "TheNahj",
    "url": "https://thenahj.live",
    "logo": "https://thenahj.live/TheNahj%20Logo.jpeg",
    "description": "Wisdom for the distracted generation. Navigate modern life through the wisdom of Imam Ali (AS).",
    "sameAs": [
      "https://www.instagram.com/paigham_e_husayn_a.s",
      "https://t.me/thenahj",
      "https://youtube.com/@thenahj"
    ]
  };
}

export function generateWisdomQuoteSchema(wisdom: {
  arabicText: string;
  englishTranslation: string;
  source: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Quotation",
    "creator": {
      "@type": "Person",
      "name": "Imam Ali (AS)"
    },
    "text": wisdom.englishTranslation,
    "inLanguage": "en",
    "citation": wisdom.source,
    "url": `https://thenahj.live/wisdom/${wisdom.slug}`,
    "spokenByCharacter": {
      "@type": "Person",
      "name": "Imam Ali (AS)"
    }
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
