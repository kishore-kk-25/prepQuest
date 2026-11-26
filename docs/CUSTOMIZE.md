# Customising the app

Almost everything you'll want to change is in three files.

## 1. App name and tutor name: `src/config.js`

```js
export const CONFIG = {
  appName: 'PrepQuest',   // shown in the top bar, page title and hero
  tagline: '…',                         // line under the hero title
  coach: {
    name: 'Tuty',                       // the cartoon tutor's name, used in the UI AND the AI prompts
    personality: 'a friendly, patient cartoon tutor who teaches like a great school teacher',
    voice: 'buttery',                   // Claude voices: buttery | airy | glassy | rounded
  },
  questionsPerTest: 15,
  ai: { provider: 'auto', proxyUrl: '/api/ai' },
};
```

Also change the `<title>` in `index.html` (it is replaced at runtime, but search engines and link previews read the static one) and the heading in `README.md`.

## 2. Colours and fonts: `src/styles/base.css`

The tokens at the top control the whole look:

| Token | Used for |
|---|---|
| `--brand` | top bar, hero, main buttons, video stage |
| `--brand-2` | highlights on the brand colour |
| `--coral` | play buttons, current step, weak scores |
| `--ok` / `--amber` | good / middling scores and done states |
| `--display`, `--font`, `--mono` | headline, body and chalkboard fonts (loaded in `index.html`) |

Light and dark mode are both handled by `light-dark(lightValue, darkValue)`.

## 3. How the tutor teaches: `src/services/prompts.js`

- `SCENE_SPEC` sets the shape and tone of every scene (length of speech, board lines, mood).
- `subjectBatchPrompt` sets the 4-scene lesson for multiple-choice questions.
- `roleBatchPrompt` sets how interview answers are scored and taught.
- `roadmapPrompt` sets the roadmap stages and which study sites the AI may pick.

## Changing the cartoon itself

The tutor is an SVG in `src/ui/coach.js`. Change the fill colours in the `SVG()` template, or swap the whole drawing. Keep these class names so the animation still works:

| Class | Animation |
|---|---|
| `c-body` | bobs while talking |
| `c-arm` | waves while talking (pivot set in `player.css`) |
| `c-eyes` | blinks |
| `c-pupils` | looks up or down with the mood |
| `c-brows`, `c-mouth` | paths swapped for each mood and for lip-sync |
| `c-bulb` | glows while talking |

## Adding a study-link provider

In `src/services/resources.js` add an entry to `PROVIDERS`:

```js
w3schools: { name: 'W3Schools', color: '#04aa6d', badge: 'W3', url: (q) => `https://www.google.com/search?q=${E('site:w3schools.com ' + q)}` },
```

The AI is told about every provider key automatically (see `roadmapPrompt`).
