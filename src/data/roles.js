// Options for role-based interviews.
export const ROLE_PRESETS = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Analyst',
  'Data Scientist', 'Product Manager', 'UI/UX Designer', 'DevOps Engineer',
  'QA / Test Engineer', 'Business Analyst', 'Digital Marketing',
];

export const LEVELS = ['Intern / Fresher', 'Junior (1–3 yrs)', 'Mid (3–6 yrs)', 'Senior (6+ yrs)'];

export const ROUNDS = ['Mixed', 'Technical', 'Behavioural (HR)', 'System design'];

// Categories the AI is asked to use when it writes role questions.
export const ROLE_CATEGORIES = ['Introduction', 'Technical', 'Behavioural', 'Problem solving', 'Role fit'];

// Used when no AI is available (demo mode).
export const FALLBACK_ROLE_QUESTIONS = [
  ['Introduction', 'Tell me about yourself and why you want this role.'],
  ['Introduction', 'Walk me through a project you are proud of.'],
  ['Behavioural', 'Describe a time you missed a deadline. What happened?'],
  ['Behavioural', 'Tell me about a disagreement with a teammate and how you handled it.'],
  ['Problem solving', 'How do you prioritise when everything is urgent?'],
  ['Technical', 'Explain a technical concept from your field to a non-expert.'],
  ['Problem solving', 'How do you debug a problem you have never seen before?'],
  ['Role fit', 'How do you keep your skills up to date?'],
  ['Behavioural', 'Describe a time you received tough feedback.'],
  ['Technical', 'What tools do you use every day, and why?'],
  ['Problem solving', 'How would you improve a product you use every day?'],
  ['Behavioural', 'Tell me about a mistake you made and what you learnt.'],
  ['Technical', 'How do you make sure your work is good quality?'],
  ['Role fit', 'Where do you see yourself in three years?'],
  ['Role fit', 'What questions do you have for us?'],
].map(([section, q]) => ({ section, topic: section, q, hint: 'Use a concrete example and end with a result.' }));
