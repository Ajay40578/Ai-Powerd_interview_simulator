import {
  AnswerEvaluation,
  Difficulty,
  InterviewCategory,
  InterviewConfig,
  InterviewQuestion,
} from '../types';
import { calculateTransparentAnswerScore } from './scoring';

// Standard 5-question curriculum for Python Developer Demo (as required by prompt)
export const PYTHON_FRESHER_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'demo_q1',
    text: 'Please introduce yourself, summarize your academic or technical background, and describe what sparked your interest in Python development.',
    category: 'Technical',
    skill: 'Technical Communication & Background',
    difficulty: 'beginner',
    type: 'behavioral',
    source: 'demo',
    expectedCompetencies: ['Clear background summary', 'Specific technical interests', 'Passion for Python ecosystem'],
    hints: ['Keep it under 2 minutes', 'Mention your strongest languages or frameworks', 'Connect your projects to your goals'],
    sampleAnswer:
      'Hello, I graduated with a degree in Computer Science where I developed a strong foundation in algorithms and software design. I was drawn to Python because of its expressive syntax and vast ecosystem—from building backend REST APIs with Flask and FastAPI to data processing with pandas. Recently, I built an automated data-scraping and reporting dashboard, which cemented my desire to pursue backend Python engineering.',
  },
  {
    id: 'demo_q2',
    text: 'Explain the fundamental differences between Python lists and tuples. Why are tuples immutable, and in what practical scenarios would you choose a tuple over a list?',
    category: 'Technical',
    skill: 'Python Internals & Memory Model',
    difficulty: 'beginner',
    type: 'conceptual',
    source: 'demo',
    expectedCompetencies: ['Mutability vs Immutability', 'Memory allocation efficiency', 'Hashability for dictionary keys'],
    hints: ['Mention syntax [] vs ()', 'Discuss modifying items in place', 'Explain why tuples can be dict keys'],
    sampleAnswer:
      'In Python, lists are mutable, meaning elements can be added, updated, or removed in place. Tuples are immutable; once allocated, their contents cannot change. Because of immutability, Python allocates exact memory without over-allocation headroom, making tuples slightly faster and lighter on memory. Additionally, tuples containing hashable elements can be used as dictionary keys or set members, whereas lists cannot. In production, use tuples for constant data or coordinates, and lists for dynamically expanding collections.',
  },
  {
    id: 'demo_q3',
    text: 'How does a Python dictionary work under the hood? Explain why key lookups are average O(1) time complexity, and describe how hash collisions are handled.',
    category: 'Technical',
    skill: 'Data Structures & Hashing',
    difficulty: 'beginner',
    type: 'conceptual',
    source: 'demo',
    expectedCompetencies: ['Hash table fundamentals', 'Open addressing collision resolution', 'Average O(1) vs worst-case O(n)'],
    hints: ['Mention hash() function and array indices', 'Discuss open addressing / probing', 'Reference Python 3.6 compact layout'],
    sampleAnswer:
      'Python dictionaries are backed by a hash table. When a key is inserted, Python computes hash(key) to calculate an index into an array. If the target bucket is already occupied by a different key (a hash collision), Python employs open addressing using a pseudo-random probing algorithm to find the next available slot. Python 3.6+ utilizes a compact array layout that stores keys and values in insertion order. Average lookup is O(1) because direct indexing avoids traversing items.',
  },
  {
    id: 'demo_q4',
    text: 'Describe an optimal approach to identify all duplicate elements in an integer list. Explain the time and space complexity of your solution.',
    category: 'Technical',
    skill: 'Algorithmic Problem Solving',
    difficulty: 'beginner',
    type: 'coding',
    source: 'demo',
    expectedCompetencies: ['O(n) time complexity using hash set', 'Space complexity awareness', 'Edge case handling'],
    hints: ['Nested loops take O(n^2) - can you do it in one pass?', 'Use a set to track already-seen numbers'],
    sampleAnswer:
      'The optimal approach uses a single-pass hash set. We maintain two sets: `seen` and `duplicates`. As we iterate through the list, if the current element is already in `seen`, we add it to `duplicates`; otherwise, we add it to `seen`. This completes in O(n) time because set lookups and insertions are O(1) on average. Auxiliary space complexity is O(n) in the worst case where most items are stored.',
  },
  {
    id: 'demo_q5',
    text: 'Explain a technical project you built recently. What was the most challenging engineering problem or bug you solved during that project?',
    category: 'Technical',
    skill: 'Project Experience & Troubleshooting',
    difficulty: 'beginner',
    type: 'scenario',
    source: 'demo',
    expectedCompetencies: ['Architecture explanation', 'Systematic debugging approach', 'Measurable outcome and lessons'],
    hints: ['Describe the goal and stack', 'Focus on the bug/bottleneck and how you discovered root cause', 'Share the outcome'],
    sampleAnswer:
      'In my recent project, I built an asynchronous web scraper and REST API to track product prices. The main challenge occurred when scrapers started getting rate-limited and memory grew exponentially over hours of runtime. Using Python memory profiling (tracemalloc), I realized I was accumulating open HTTP client sessions inside a loop rather than reusing a connection pool. I refactored the pipeline using an `aiohttp.ClientSession` context manager and implemented exponential backoff with retries. This stabilized memory usage at under 75MB and boosted throughput by 3x.',
  },
];

// Adaptive branch follow-up questions
export const ADAPTIVE_FOLLOW_UPS: Record<string, { strong: InterviewQuestion; weak: InterviewQuestion }> = {
  demo_q2: {
    strong: {
      id: 'demo_q2_strong',
      text: 'Great explanation on immutability. How does Python handle tuple caching (small tuple freelists) internally, and can an immutable tuple contain a mutable object like a list? What happens if you try to mutate that inner list?',
      category: 'Technical',
      skill: 'Python Memory & Object References',
      difficulty: 'intermediate',
      type: 'conceptual',
      source: 'demo',
      followUpTo: 'demo_q2',
      expectedCompetencies: ['Tuple containing mutable items', 'Object references vs container immutability', 'Tuple freelist reuse'],
      hints: ['A tuple stores references to objects, not copies.', 'Can you do `my_tuple[0].append(5)`?'],
      sampleAnswer:
        'A tuple holds references to objects rather than the objects themselves. While the tuple’s reference container cannot be reassigned, if an element inside the tuple is mutable (like a list), that inner list can still be modified in place (e.g., `t[0].append(42)` succeeds). The tuple remains pointing to the same object ID. Furthermore, CPython optimizes memory by caching small tuples (up to 20 elements) in freelists to avoid OS heap allocation on frequent tuple creation.',
    },
    weak: {
      id: 'demo_q2_weak',
      text: 'Let us take a step back and look at syntax: In Python code, how do you declare a list versus a tuple? If you have `my_var = [1, 2, 3]`, how would you append a new number to it?',
      category: 'Technical',
      skill: 'Python Basics & Syntax',
      difficulty: 'beginner',
      type: 'conceptual',
      source: 'demo',
      followUpTo: 'demo_q2',
      expectedCompetencies: ['List syntax [] and tuple syntax ()', 'list.append() method', 'Basic syntax mechanics'],
      hints: ['Square brackets [] for list, parentheses () for tuple', 'Use the `.append()` method'],
      sampleAnswer:
        'A list is declared with square brackets `my_list = [1, 2, 3]`, whereas a tuple uses parentheses `my_tuple = (1, 2, 3)`. To append a new number to the list, use `my_list.append(4)`. This modifies `my_list` in place to `[1, 2, 3, 4]`. Tuples do not have an append method because their size is permanently fixed.',
    },
  },
  demo_q3: {
    strong: {
      id: 'demo_q3_strong',
      text: 'You clearly understand hash tables. What happens in Python when you define a custom class? What two dunder methods must you implement so instances can be used as dictionary keys safely?',
      category: 'Technical',
      skill: 'Object-Oriented Python & Hash Contracts',
      difficulty: 'intermediate',
      type: 'conceptual',
      source: 'demo',
      followUpTo: 'demo_q3',
      expectedCompetencies: ['__hash__ and __eq__ methods', 'Hash contract consistency', 'Immutability requirement'],
      hints: ['If two objects compare equal with __eq__, their hashes must match.', 'Mention __hash__'],
      sampleAnswer:
        'To use instances of a custom class as dictionary keys, you must implement both `__hash__(self)` and `__eq__(self, other)`. The fundamental hash contract requires that if `obj1 == obj2`, then `hash(obj1) == hash(obj2)` must be true. Additionally, the attributes contributing to the hash must remain immutable throughout the object lifetime, otherwise the object could get lost in the wrong hash bucket after mutation.',
    },
    weak: {
      id: 'demo_q3_weak',
      text: 'Let us clarify the basics of dictionaries: What is the difference between a list index (like `my_list[0]`) and a dictionary key (like `my_dict["name"]`)? Can a list be used as a key in a dictionary?',
      category: 'Technical',
      skill: 'Dictionary Fundamentals',
      difficulty: 'beginner',
      type: 'conceptual',
      source: 'demo',
      followUpTo: 'demo_q3',
      expectedCompetencies: ['Index-based vs key-based lookup', 'Keys must be hashable/immutable', 'Why lists cannot be keys'],
      hints: ['Lists are indexed by contiguous integers 0, 1, 2...', 'Dict keys can be strings, numbers, or tuples', 'Lists are mutable so unhashable'],
      sampleAnswer:
        'Lists are indexed by sequential zero-based integers (`my_list[0]`), while dictionaries are associative maps that pair arbitrary keys with values (`my_dict["name"] = "Alice"`). A list CANNOT be used as a dictionary key because lists are mutable; mutable objects are unhashable and would raise a `TypeError: unhashable type: list`.',
    },
  },
};

/**
 * Deterministic Answer Evaluator for Demo Mode.
 * Analyzes candidate's actual answer against expected competencies and keywords.
 * NEVER returns random or fabricated values. Clearly labeled as deterministic demonstration.
 */
export function evaluateDemoAnswer(
  question: InterviewQuestion,
  answerText: string,
  category: InterviewCategory = 'Technical'
): AnswerEvaluation {
  const trimmed = answerText.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Question-specific keyword checks
  let matchedKeywords = 0;
  let keyTopicsPresent: string[] = [];
  let keyTopicsMissing: string[] = [];

  const checks: Record<string, { required: string[]; optional: string[]; concepts: string[] }> = {
    demo_q1: {
      required: ['python', 'project', 'interest'],
      optional: ['backend', 'flask', 'fastapi', 'data', 'django', 'course', 'college', 'degree'],
      concepts: ['Academic or practical background', 'Specific Python passion', 'Concrete projects or goals'],
    },
    demo_q2: {
      required: ['mutable', 'immutable'],
      optional: ['memory', 'hash', 'key', 'dict', 'change', 'faster', 'tuple', 'list'],
      concepts: ['Lists are mutable, tuples are immutable', 'Memory efficiency of tuples', 'Tuples as dictionary keys'],
    },
    demo_q3: {
      required: ['hash', 'table', 'collision'],
      optional: ['o(1)', 'constant', 'index', 'open addressing', 'bucket', 'key', 'array'],
      concepts: ['Hash table backend', 'Hash collisions and resolution', 'O(1) average lookup time'],
    },
    demo_q4: {
      required: ['set', 'time', 'space'],
      optional: ['o(n)', 'seen', 'hash', 'loop', 'iterate', 'duplicate', 'linear'],
      concepts: ['O(n) single pass hash set', 'Tracking seen elements', 'Space complexity analysis'],
    },
    demo_q5: {
      required: ['challenge', 'solved'],
      optional: ['bug', 'error', 'debug', 'database', 'api', 'result', 'performance', 'refactor'],
      concepts: ['Specific technical problem description', 'Methodical debugging steps', 'Measurable resolution'],
    },
  };

  const currentCheck = checks[question.id] || {
    required: ['algorithm', 'code', 'function'],
    optional: ['complexity', 'test', 'efficiency', 'design'],
    concepts: ['Direct answer to question prompt', 'Clear technical rationale', 'Concise explanation'],
  };

  currentCheck.required.forEach((term) => {
    if (lower.includes(term)) {
      matchedKeywords += 2;
      keyTopicsPresent.push(`Mentioned core concept: "${term}"`);
    } else {
      keyTopicsMissing.push(`Omitted core term: "${term}"`);
    }
  });

  currentCheck.optional.forEach((term) => {
    if (lower.includes(term)) {
      matchedKeywords += 1;
    }
  });

  // Base score calculation from candidate's genuine response properties
  // Relevance: did they address the question?
  let relevanceScore = 40;
  if (wordCount >= 20) relevanceScore += 30;
  if (matchedKeywords >= 2) relevanceScore += 30;
  relevanceScore = Math.min(95, Math.max(25, relevanceScore));

  // Correctness: did they get technical facts right?
  let correctnessScore = 35;
  if (lower.includes('immutable') && lower.includes('mutable')) correctnessScore += 45;
  else if (matchedKeywords >= 3) correctnessScore += 40;
  else if (matchedKeywords >= 1) correctnessScore += 20;

  if (wordCount < 15) correctnessScore = Math.min(correctnessScore, 40);
  correctnessScore = Math.min(95, Math.max(20, correctnessScore));

  // Depth: detailed explanation vs one-liner
  let depthScore = 30;
  if (wordCount > 60) depthScore += 35;
  else if (wordCount > 35) depthScore += 20;
  if (matchedKeywords >= 4) depthScore += 25;
  depthScore = Math.min(95, Math.max(20, depthScore));

  // Clarity: structure and readability
  let clarityScore = 40;
  if (trimmed.includes('.') || trimmed.includes(',')) clarityScore += 25;
  if (wordCount >= 25 && wordCount <= 120) clarityScore += 25; // Good conciseness
  clarityScore = Math.min(95, Math.max(30, clarityScore));

  // Reasoning: complexity, trade-offs, examples
  let reasoningScore = 30;
  if (lower.includes('because') || lower.includes('therefore') || lower.includes('o(') || lower.includes('trade-off')) {
    reasoningScore += 40;
  }
  if (lower.includes('for example') || lower.includes('such as')) {
    reasoningScore += 20;
  }
  reasoningScore = Math.min(95, Math.max(20, reasoningScore));

  // Compute transparent rubric score
  const overallScore = calculateTransparentAnswerScore(
    {
      relevanceScore,
      correctnessScore,
      depthScore,
      clarityScore,
      reasoningScore,
    },
    category
  );

  // 5 Questions test point rule:
  // If answer looks correct -> mark isCorrect=true and add 20 points!
  // If wrong/incomplete -> mark isCorrect=false and 0 points (no score).
  const isCorrect = overallScore >= 55 && correctnessScore >= 50 && wordCount >= 8;
  const pointsEarned = isCorrect ? 20 : 0;
  const maxPoints = 20;

  // Generate realistic, honest strengths
  const strengths: string[] = [];
  if (isCorrect) {
    strengths.push('Answer is correct! Awarded +20 points for this question.');
  }
  if (wordCount >= 30) {
    strengths.push('Provided a thorough explanation with good contextual detail.');
  } else {
    strengths.push('Gave a direct and concise response.');
  }

  if (keyTopicsPresent.length > 0) {
    strengths.push(`Accurately addressed key technical keywords (${keyTopicsPresent.slice(0, 2).map(s => s.replace('Mentioned core concept: ', '')).join(', ')}).`);
  }

  if (reasoningScore >= 70) {
    strengths.push('Effectively explained underlying technical reasons and trade-offs.');
  }

  // Generate missing concepts & improvement tips
  const missingConcepts: string[] = [];
  if (!isCorrect) {
    missingConcepts.push('Answer did not meet the criteria for full points (0 points awarded). Review the model answer.');
  }
  if (keyTopicsMissing.length > 0) {
    missingConcepts.push(...keyTopicsMissing.slice(0, 2).map((s) => s.replace('Omitted core term: ', 'Expected coverage of ')));
  }
  if (depthScore < 60) {
    missingConcepts.push('Could expand further on internal runtime mechanics and edge-case behavior.');
  }
  if (missingConcepts.length === 0) {
    missingConcepts.push('Consider elaborating on real-world production performance trade-offs.');
  }

  const corrections: string[] = [];
  if (!isCorrect) {
    corrections.push('Incorrect or incomplete: No points awarded for this question.');
  }
  if (wordCount < 15) {
    corrections.push('The answer was very brief. In technical interviews, provide supporting evidence and reasoning.');
  }

  const improvementSuggestions: string[] = [
    'Use technical terminology (e.g., mutability, hash table, O(n) complexity) explicitly.',
    'Structure your answer by stating the direct answer first, followed by internal mechanics, then practical examples.',
  ];

  return {
    overallScore,
    isCorrect,
    pointsEarned,
    maxPoints,
    relevanceScore,
    correctnessScore,
    depthScore,
    clarityScore,
    reasoningScore,
    strengths,
    missingConcepts,
    corrections,
    improvementSuggestions,
    exampleAnswer: question.sampleAnswer,
    communicationFeedback: {
      clarity: wordCount > 25 ? 'Well-formed sentences and direct structure.' : 'Somewhat concise; elaborate more on rationale.',
      conciseness: wordCount > 150 ? 'Slightly wordy; aim to keep verbal answers under 90 seconds.' : 'Appropriate length for an interview response.',
      structure: 'Good focus on the core prompt. Follow the Point-Explain-Example pattern.',
    },
    confidenceOrLimitations: 'Evaluated using deterministic rule engine (Demo Mode). For dynamic AI grading, enable Gemini API.',
  };
}

/**
 * Gets the next question in Demo Mode, supporting adaptive branching.
 */
export function getNextDemoQuestion(
  currentIndex: number,
  lastAnswerEvaluation?: AnswerEvaluation
): InterviewQuestion | null {
  const currentQ = PYTHON_FRESHER_QUESTIONS[currentIndex];

  // Check if adaptive branching applies
  if (currentQ && ADAPTIVE_FOLLOW_UPS[currentQ.id] && lastAnswerEvaluation) {
    if (lastAnswerEvaluation.overallScore >= 75) {
      return ADAPTIVE_FOLLOW_UPS[currentQ.id].strong;
    } else if (lastAnswerEvaluation.overallScore < 50) {
      return ADAPTIVE_FOLLOW_UPS[currentQ.id].weak;
    }
  }

  // Otherwise progress through standard sequence
  const nextIdx = currentIndex + 1;
  if (nextIdx < PYTHON_FRESHER_QUESTIONS.length) {
    return PYTHON_FRESHER_QUESTIONS[nextIdx];
  }

  return null;
}
