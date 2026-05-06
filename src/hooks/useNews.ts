import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "Lok Sabha Session: Key Bills on Digital Transformation Introduced",
    description: "The current session of Lok Sabha saw the introduction of several landmark bills aimed at digitizing public services and enhancing data security for Indian citizens.",
    url: "https://sansad.in/ls",
    urlToImage: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=1200",
    publishedAt: new Date().toISOString(),
    source: { name: "Sansad TV" }
  },
  {
    title: "Parliamentary Committee Reviews New National Education Policy Progress",
    description: "A high-level committee today reviewed the implementation progress of the National Education Policy across various states and union territories.",
    url: "https://sansad.in/ls/business/ballot-list",
    urlToImage: "https://images.unsplash.com/photo-1589262804704-c5aa9e6f101b?auto=format&fit=crop&q=80&w=1200",
    publishedAt: new Date().toISOString(),
    source: { name: "Lok Sabha News" }
  },
  {
    title: "Speaker Highlights Importance of Youth Participation in Democracy",
    description: "Addressing a group of students, the Speaker emphasized that the future of Indian democracy depends on active and informed participation by the youth.",
    url: "https://sansad.in/ls/members",
    urlToImage: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200",
    publishedAt: new Date().toISOString(),
    source: { name: "SansadSaathi News" }
  }
];

const fetchNews = async (): Promise<NewsItem[]> => {
  try {
    const { data } = await axios.get('/api/news');
    // Ensure data is what we expect
    const articles = (data && Array.isArray(data.articles)) ? data.articles : [];
    
    // Filter out articles with broken data
    const validArticles = articles.filter((a: any) => a.title && a.url);
    
    return validArticles.length > 0 ? validArticles : FALLBACK_NEWS;
  } catch (error) {
    console.error('Failed to fetch news, using fallback:', error);
    return FALLBACK_NEWS;
  }
};

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
