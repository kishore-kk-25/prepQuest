// Study-link builders. Links open a live search on each site, so they never
// break (AI-invented video URLs often don't exist). Add a provider here and
// the AI can start recommending it — see docs/CUSTOMIZE.md.
const E = encodeURIComponent;

export const PROVIDERS = {
  youtube:       { name: 'YouTube',                color: '#e0302b', badge: '▶',   url: (q) => `https://www.youtube.com/results?search_query=${E(q)}` },
  coursera:      { name: 'Coursera',               color: '#0056d2', badge: 'C',   url: (q) => `https://www.coursera.org/search?query=${E(q)}` },
  classcentral:  { name: 'Class Central (free courses)', color: '#7b3fe4', badge: 'CC', url: (q) => `https://www.classcentral.com/search?q=${E(q)}` },
  khan:          { name: 'Khan Academy',           color: '#14bf96', badge: 'K',   url: (q) => `https://www.khanacademy.org/search?page_search_query=${E(q)}` },
  freecodecamp:  { name: 'freeCodeCamp',           color: '#0a0a23', badge: 'fCC', url: (q) => `https://www.freecodecamp.org/news/search/?query=${E(q)}` },
  mdn:           { name: 'MDN Web Docs',           color: '#1b1b1b', badge: 'MDN', url: (q) => `https://developer.mozilla.org/en-US/search?q=${E(q)}` },
  geeksforgeeks: { name: 'GeeksforGeeks',          color: '#2f8d46', badge: 'GfG', url: (q) => `https://www.google.com/search?q=${E('site:geeksforgeeks.org ' + q)}` },
  indiabix:      { name: 'IndiaBix practice',      color: '#d9822b', badge: 'IB',  url: () => 'https://www.indiabix.com/' },
  leetcode:      { name: 'LeetCode',               color: '#f89f1b', badge: 'LC',  url: (q) => `https://leetcode.com/problemset/?search=${E(q)}` },
  hackerrank:    { name: 'HackerRank',             color: '#1ba94c', badge: 'HR',  url: () => 'https://www.hackerrank.com/dashboard' },
  google:        { name: 'Web search',             color: '#4d615a', badge: 'Go',  url: (q) => `https://www.google.com/search?q=${E(q)}` },
};

export const PROVIDER_KEYS = Object.keys(PROVIDERS);

/** Build a link object: { label, url, provider, color, badge } */
export function studyLink(provider, query, label) {
  const p = PROVIDERS[provider] || PROVIDERS.google;
  return { label: label || query, url: p.url(query), provider: p.name, color: p.color, badge: p.badge };
}

/** Only allow https links into the page. */
export const safeUrl = (u) => (/^https:\/\//.test(String(u)) ? String(u) : '#');
