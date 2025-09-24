import axios from 'axios';
import Parser from 'rss-parser';

const parser = new Parser();

const RSS_BY_CATEGORY = {
  technology: [
    'https://www.theverge.com/rss/index.xml',
    'https://www.wired.com/feed/rss'
  ],
  sports: [
    'https://www.espn.com/espn/rss/news'
  ],
  business: [
    'https://www.cnbc.com/id/10001147/device/rss/rss.html'
  ],
  entertainment: [
    'https://www.rollingstone.com/music/music-news/feed/'
  ],
  science: [
    'https://www.sciencedaily.com/rss/top/science.xml'
  ],
  health: [
    'https://www.medicalnewstoday.com/rss'
  ],
  politics: [
    'https://www.politico.com/rss/politics-news.xml'
  ],
  general: [
    'https://feeds.bbci.co.uk/news/rss.xml'
  ]
};

export async function fetchLatestNews({ categories = [], query = '', pageSize = 40 }) {
  const sources = [];
  const cats = categories.length ? categories : ['general'];
  for (const c of cats) sources.push(...(RSS_BY_CATEGORY[c] || []));

  const rssPromises = sources.map((url) => parser.parseURL(url).catch(() => ({ items: [] })));
  const hnPromise = fetchHN(query);
  const results = await Promise.all([hnPromise, ...rssPromises]);

  let items = [];
  for (const res of results) {
    if (!res) continue;
    const list = res.items || res; // hn returns array
    for (const a of list) items.push(normalizeAny(a));
  }

  if (query) {
    const q = query.toLowerCase();
    items = items.filter((i) => `${i.title} ${i.description}`.toLowerCase().includes(q));
  }

  // Categorize simple
  for (const item of items) item.categories = categorize(item);

  // Dedupe by url
  const unique = new Map();
  for (const i of items) if (i.url && !unique.has(i.url)) unique.set(i.url, i);
  return Array.from(unique.values()).slice(0, pageSize);
}

async function fetchHN(query) {
  const url = 'https://hn.algolia.com/api/v1/search';
  const params = { query: query || '', tags: 'story', hitsPerPage: 30 };
  const resp = await axios.get(url, { params });
  return (resp.data.hits || []).map((h) => ({
    title: h.title,
    url: h.url,
    source: 'Hacker News',
    author: h.author,
    description: h.story_text || '',
    imageUrl: '',
    publishedAt: h.created_at,
  }));
}

function normalizeAny(a) {
  // RSS item fields: title, link, contentSnippet, isoDate, creator
  if (a.link && a.title !== undefined) {
    return {
      id: a.link,
      title: a.title || '',
      url: a.link || '',
      source: a.creator || a.source || '',
      author: a.creator || '',
      description: a.contentSnippet || '',
      imageUrl: '',
      publishedAt: a.isoDate ? new Date(a.isoDate) : null,
      categories: []
    };
  }
  // Already normalized from HN
  return {
    id: a.url,
    title: a.title || '',
    url: a.url || '',
    source: a.source || '',
    author: a.author || '',
    description: a.description || '',
    imageUrl: a.imageUrl || '',
    publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
    categories: []
  };
}

function categorize(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const map = [
    ['technology', ['tech', 'ai', 'software', 'startup', 'google', 'microsoft', 'apple']],
    ['sports', ['sport', 'match', 'league', 'football', 'nba', 'cricket']],
    ['business', ['market', 'stock', 'revenue', 'earnings', 'business']],
    ['entertainment', ['movie', 'music', 'celebrity', 'show']],
    ['science', ['research', 'study', 'space', 'nasa']],
    ['health', ['health', 'covid', 'vaccine', 'medical']],
    ['politics', ['election', 'government', 'policy', 'minister', 'congress']]
  ];
  const cats = [];
  for (const [category, keywords] of map) {
    if (keywords.some((k) => text.includes(k))) cats.push(category);
  }
  return cats.length ? cats : ['general'];
}


