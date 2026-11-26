// ─────────────────────────────────────────────────────────────
//  App settings. Rename the app and the cartoon tutor here.
//  Everything in the UI and in the AI prompts reads from this file.
// ─────────────────────────────────────────────────────────────
export const CONFIG = {
  appName: 'PrepQuest',
  tagline: 'Your interview prep, turned into a quest: take a test, learn every answer from Tuty, then level up with your personal roadmap.',

  coach: {
    name: 'Tuty',                  // the cartoon tutor's name
    personality: 'a friendly, patient cartoon tutor who teaches like a great school teacher',
    voice: 'buttery',              // Claude voices: buttery | airy | glassy | rounded
  },

  questionsPerTest: 15,

  ai: {
    // 'auto'   → Claude inside claude.ai, else the proxy below, else demo mode
    // 'claude' → only Claude (artifact runtime)
    // 'proxy'  → only your own server (see server/ and docs/DEPLOY.md)
    // 'demo'   → no AI, built-in feedback only
    provider: 'auto',
    proxyUrl: '/api/ai',
  },

  storageKey: 'prepquest',               // prefix for data saved in the browser
  maxSavedPlans: 10,
};
