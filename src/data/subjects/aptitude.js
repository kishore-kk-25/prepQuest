// Aptitude question bank. Every answer is hand-checked.
// Fields: section, topic, q, options (4), answer (index 0-3), explain.
export default {
  id: 'aptitude',
  name: 'Aptitude',
  badge: 'Apt',
  color: '#d9822b',
  blurb: 'Quantitative, logical reasoning and verbal ability, like placement tests.',
  practiceProvider: 'indiabix',
  resources: [
    { title: 'IndiaBix aptitude practice', url: 'https://www.indiabix.com/', kind: 'Practice' },
    { title: 'Khan Academy arithmetic', url: 'https://www.khanacademy.org/math/arithmetic', kind: 'Course' },
  ],
  questions: [
    { section: 'Quantitative', topic: 'Speed, time and distance', q: 'A train 150 m long passes a pole in 15 seconds. What is its speed in km/h?', options: ['30 km/h', '36 km/h', '40 km/h', '45 km/h'], answer: 1, explain: 'Speed = 150 ÷ 15 = 10 m/s. To convert m/s to km/h multiply by 18/5: 10 × 18/5 = 36 km/h.' },
    { section: 'Quantitative', topic: 'Profit and loss', q: 'An article costing ₹800 is sold at a 15% profit. What is the selling price?', options: ['₹900', '₹960', '₹940', '₹920'], answer: 3, explain: 'Profit = 15% of 800 = ₹120. Selling price = 800 + 120 = ₹920.' },
    { section: 'Quantitative', topic: 'Time and work', q: 'A can finish a job in 12 days and B in 18 days. Working together, how many days will they take?', options: ['7.2 days', '6 days', '7.5 days', '8 days'], answer: 0, explain: 'Per day together: 1/12 + 1/18 = 3/36 + 2/36 = 5/36 of the job. Days = 36 ÷ 5 = 7.2.' },
    { section: 'Quantitative', topic: 'Simple interest', q: 'What is the simple interest on ₹5,000 at 8% per year for 3 years?', options: ['₹1,000', '₹1,250', '₹1,200', '₹1,500'], answer: 2, explain: 'SI = P × R × T ÷ 100 = 5000 × 8 × 3 ÷ 100 = ₹1,200.' },
    { section: 'Quantitative', topic: 'Averages', q: 'The average of 5 numbers is 24. When one number is removed, the average of the rest is 22. Which number was removed?', options: ['28', '30', '32', '34'], answer: 2, explain: 'Total of 5 numbers = 5 × 24 = 120. Total of the 4 left = 4 × 22 = 88. Removed number = 120 − 88 = 32.' },
    { section: 'Logical reasoning', topic: 'Number series', q: 'Find the next number: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '48'], answer: 1, explain: 'The gaps are 4, 6, 8, 10, so the next gap is 12: 30 + 12 = 42. Another view: n × (n + 1), and 6 × 7 = 42.' },
    { section: 'Logical reasoning', topic: 'Coding-decoding', q: 'If CAT is coded as DBU, how is DOG coded?', options: ['DPH', 'EPH', 'EOH', 'FPI'], answer: 1, explain: 'Each letter moves one step forward: C→D, A→B, T→U. So D→E, O→P, G→H, giving EPH.' },
    { section: 'Logical reasoning', topic: 'Blood relations', q: 'Pointing to a man, Riya says, "He is the son of my grandfather\'s only son." How is the man related to Riya?', options: ['Cousin', 'Uncle', 'Brother', 'Father'], answer: 2, explain: 'Her grandfather\'s only son is Riya\'s father. Her father\'s son is her brother.' },
    { section: 'Logical reasoning', topic: 'Syllogisms', q: 'Statements: All pens are books. All books are bags. Conclusions: I. All pens are bags. II. Some bags are pens.', options: ['Only I follows', 'Only II follows', 'Neither follows', 'Both I and II follow'], answer: 3, explain: 'Pens sit inside books, which sit inside bags, so all pens are bags (I). If all pens are bags, then some bags are pens (II). Both follow.' },
    { section: 'Logical reasoning', topic: 'Direction sense', q: 'A man walks 5 km north, turns right and walks 3 km, then turns right and walks 5 km. Where is he from the start?', options: ['3 km East', '3 km West', '5 km North', '8 km East'], answer: 0, explain: 'North 5, then right = east 3, then right = south 5. North and south cancel out, leaving 3 km East.' },
    { section: 'Verbal', topic: 'Synonyms', q: 'Choose the word closest in meaning to ABUNDANT.', options: ['Scarce', 'Rare', 'Plentiful', 'Tiny'], answer: 2, explain: 'Abundant means existing in large quantities: plentiful. Scarce and rare are opposites.' },
    { section: 'Verbal', topic: 'Antonyms', q: 'Choose the word opposite in meaning to TRANSPARENT.', options: ['Opaque', 'Clear', 'Visible', 'Bright'], answer: 0, explain: 'Transparent lets light through; opaque does not. Clear is a synonym, not an antonym.' },
    { section: 'Verbal', topic: 'Subject-verb agreement', q: 'Which sentence is grammatically correct?', options: ['Neither of the boys have finished their homework.', 'Neither of the boy has finished his homework.', 'Neither of the boys are finished his homework.', 'Neither of the boys has finished his homework.'], answer: 3, explain: '"Neither" is singular, so it takes "has" and "his". The noun after "of the" stays plural: boys.' },
    { section: 'Verbal', topic: 'Prepositions', q: 'Fill in the blank: She is very good ___ mathematics.', options: ['in', 'at', 'on', 'with'], answer: 1, explain: 'The fixed phrase is "good at" a subject or skill.' },
    { section: 'Verbal', topic: 'One-word substitution', q: 'One word for "a person who can speak many languages":', options: ['Bilingual', 'Orator', 'Polyglot', 'Translator'], answer: 2, explain: 'Polyglot = many languages. Bilingual means two languages; an orator is a public speaker.' },
  ],
};
