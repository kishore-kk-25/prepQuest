# Adding subjects and questions

Each subject is one file in `src/data/subjects/`. The answer key lives with the question, so marking never depends on the AI.

## Question format

```js
{
  section: 'Algorithms',            // groups questions in the score bars (aim for 3 sections)
  topic: 'Binary search',           // what to study if they get it wrong
  q: 'What is the time complexity of binary search?',
  options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],   // exactly 4, all different
  answer: 1,                        // index of the correct option (0 = A … 3 = D)
  explain: 'Each step halves the range, so about log₂ n steps.',  // the verified explanation
}
```

`explain` matters: the AI is told it is the truth and builds its lesson from it. With no AI, it becomes the lesson. Write it as 1–3 short sentences, one step per sentence.

## Add a new subject

1. Copy `src/data/subjects/dsa.js` to, say, `python.js` and edit it:

   ```js
   export default {
     id: 'python',                  // unique, lowercase
     name: 'Python',
     badge: 'Py',                   // 2–3 letters shown on the card
     color: '#3776ab',
     blurb: 'Data types, comprehensions, generators and OOP in Python.',
     practiceProvider: 'hackerrank',// a key from src/services/resources.js
     resources: [                   // hand-picked links (https only)
       { title: 'Official Python tutorial', url: 'https://docs.python.org/3/tutorial/', kind: 'Docs' },
     ],
     questions: [ /* 15 questions */ ],
   };
   ```

2. Register it in `src/data/subjects/index.js`:

   ```js
   import python from './python.js';
   export const SUBJECTS = [aptitude, dsa, dbms, os, networks, oop, javascript, python];
   ```

3. Run `npm test`. It checks every question has 4 different options, a valid answer and an explanation.

## Tips

- Spread correct answers across A–D, so guessing the same letter doesn't score well.
- Keep a subject at 15 or more questions. `CONFIG.questionsPerTest` decides how many are used.
- Double-check every answer yourself. The tests catch typos, not wrong facts.
