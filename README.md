# PrepQuest

Take a **role-based interview** or a **subject-based test**, get every answer taught by an animated cartoon tutor (**Tuty**), then follow a **personal study roadmap** with links to YouTube, courses and practice sites.

**Live demo (GitHub Pages):** `https://<your-username>.github.io/prepquest/` · see [Hosting](#hosting)

> App name, tutor name and colours all live in one file: [`src/config.js`](src/config.js). See [docs/CUSTOMIZE.md](docs/CUSTOMIZE.md).

---

## Features

| | |
|---|---|
| **Two kinds of assessment** | *Role-based:* 15 interview questions written by AI for any role, level and round. Type or speak your answers. *Subject-based:* 15 multiple-choice questions each for Aptitude, DSA, DBMS & SQL, Operating Systems, Computer Networks, OOP and JavaScript. |
| **Answers known in advance** | Every subject question has a hand-checked answer key and explanation, so marks are always correct. The AI only writes the teaching. |
| **Cartoon tutor that teaches** | After you submit, each question gets a 4-scene video: verdict → concept → step-by-step solution on a chalkboard → common trap and what to practise. The tutor talks (voice), lip-syncs, changes expression and shows live subtitles. |
| **Interactive roadmap** | 4–5 stages, weakest areas first. Each stage has a goal, tasks to tick off, and "where to study" links. The tutor explains each stage, or gives a full narrated tour. |
| **Study links that never break** | Links open live searches on YouTube, Coursera, Class Central, Khan Academy, MDN, GeeksforGeeks, LeetCode, IndiaBix and more, plus hand-picked resources per subject. |
| **Easy to follow** | A 4-step progress bar (Choose → Answer → Review → Roadmap), a question palette, "review later" flags, keyboard shortcuts and auto-save. |
| **Works without AI** | With no AI connected, it still runs: subject tests are fully marked and explained from the answer key, and a roadmap is built from your weakest sections. |

## Quick start

No build step and no dependencies. You need Node 18 or newer.

```bash
# 1. Run the app on http://localhost:3000 (demo mode, no AI)
npm start

# 2. Run it with AI (role interviews, richer lessons and roadmaps)
cp .env.example .env        # then put your Anthropic API key in .env
npm run start:env

# 3. Run the tests
npm test
```

Inside **claude.ai** the app uses Claude automatically for AI, voice and dictation. No key needed. See [docs/DEPLOY.md](docs/DEPLOY.md) for GitHub Pages and other hosts.

## Hosting

| Where | AI marking & lessons | Tuty's voice | Subject tests | Role interviews | Cost |
|---|---|---|---|---|---|
| **GitHub Pages** (`github.io`) | Built-in lessons from the answer key | Browser voice | ✅ Full | 15 general questions, simple scoring | Free |
| **Node host + API key** (Render, Railway…) | ✅ Full AI | Browser voice | ✅ Full | ✅ AI-written and AI-scored | API usage |
| **claude.ai artifact** | ✅ Full AI (Claude) | Claude voice + dictation | ✅ Full | ✅ Full | Included |

GitHub Pages only serves files and can't run a server, so it can't safely keep an AI key. Any key placed in front-end code is visible to every visitor. The app detects this and switches to demo mode by itself. See [docs/DEPLOY.md](docs/DEPLOY.md).

## Folder structure

```
prepquest/
├── index.html                 # page shell: top bar, stepper, <main id="view">
├── src/
│   ├── config.js              # ★ app name, tutor name, voice, AI provider
│   ├── main.js                # starts services, owns the current plan, switches views
│   ├── data/
│   │   ├── roles.js           # role presets, levels, rounds, fallback questions
│   │   └── subjects/          # ★ one file per subject: questions + answers + resources
│   │       ├── index.js       #   list of subjects
│   │       ├── aptitude.js  dsa.js  dbms.js  os.js  networks.js  oop.js  javascript.js
│   ├── services/              # logic, no UI
│   │   ├── ai.js              # AI adapter: Claude, your own proxy, or demo
│   │   ├── prompts.js         # ★ every AI prompt (tune the teaching style here)
│   │   ├── assess.js          # marks answers, builds a lesson per question
│   │   ├── roadmap.js         # builds the study roadmap
│   │   ├── session.js         # a "plan" (one test attempt) and its scores
│   │   ├── resources.js       # study-link providers (YouTube, Coursera, …)
│   │   ├── speech.js          # voice + dictation (Claude or browser Web Speech)
│   │   └── storage.js         # saves plans in the browser
│   ├── ui/
│   │   ├── coach.js           # the animated cartoon tutor (SVG)
│   │   ├── player.js          # the "video" player: stage, slides, chalkboard, subtitles
│   │   ├── scenes.js          # turns results / roadmap stages into video scenes
│   │   ├── dom.js             # small helpers (escaping, colours, link cards)
│   │   └── views/             # one file per screen
│   │       ├── home.js  test.js  assessing.js  results.js  roadmap.js
│   └── styles/
│       ├── base.css           # ★ colours, fonts, buttons, top bar
│       ├── components.css     # cards, test, results, roadmap
│       └── player.css         # video stage and tutor animation
├── server/server.js           # optional: serves the app + AI proxy (keeps your key secret)
├── tests/                     # node --test: question banks + services
└── docs/                      # architecture, customising, adding questions, deploying
```

★ = the files you are most likely to edit.

## How it works

```
Choose ──▶ Answer 15 ──▶ Assess (AI, in batches of 5) ──▶ Review lessons ──▶ Roadmap
            auto-saved      subject: answer key + AI teaching
                            role:    AI scores + AI teaching
```

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data flow and the scene format.

## Docs

- [docs/CUSTOMIZE.md](docs/CUSTOMIZE.md): rename the app and tutor, change colours, voice and teaching style
- [docs/ADDING_QUESTIONS.md](docs/ADDING_QUESTIONS.md): add a subject or edit questions
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): how the pieces fit together
- [docs/DEPLOY.md](docs/DEPLOY.md): claude.ai, GitHub Pages, your own server

## Tech

Plain HTML, CSS and JavaScript ES modules. No framework and no build. The optional server is Node's built-in `http`. The tutor is a hand-drawn SVG animated with CSS and JavaScript.

## License

MIT
