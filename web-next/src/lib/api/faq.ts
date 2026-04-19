import { API_URL } from '@/config';

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

export type GroupedFaqs = Record<string, Faq[]>;

export async function getFaqs(): Promise<GroupedFaqs> {
  const res = await fetch(`${API_URL}/api/v1/products/faqs`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error('Failed to fetch FAQs');

  const json: { success: boolean; data: Faq[] } = await res.json();

  // Group by category (mirrors backend EJS groupedFAQs)
  return json.data.reduce<GroupedFaqs>((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});
}
