import { API_URL } from '@/config';

export interface BlogPost {
  _id: string;
  title: string;
  content: string;
  image: string;
  date: string;
}

export async function getBlogs(): Promise<BlogPost[]> {
  const res = await fetch(`${API_URL}/api/v1/blogs`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error('Failed to fetch blogs');

  const json = await res.json();
  return json.data;
}
