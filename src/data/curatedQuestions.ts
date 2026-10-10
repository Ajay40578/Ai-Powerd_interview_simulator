import { QuestionBankItem } from '../types';

export const CURATED_QUESTIONS: QuestionBankItem[] = [
  // Python Developer / Technical
  {
    id: 'py_01',
    text: 'Explain the fundamental differences between Python lists and tuples. When would you choose one over the other in production?',
    category: 'Technical',
    skill: 'Python Internals',
    difficulty: 'beginner',
    experienceLevel: 'Fresher / Junior',
    hints: [
      'Think about mutability and memory allocation.',
      'Consider performance implications for iteration and dictionary keys.',
      'Mention syntax differences: [] vs ().',
    ],
    sampleAnswer:
      'In Python, lists are mutable (elements can be modified, appended, or removed in place), while tuples are immutable (once created, their contents cannot be changed). Because tuples have fixed size, Python allocates a single memory block with no overallocation overhead, making tuples slightly faster and more memory-efficient. Additionally, tuples containing only hashable objects can be used as dictionary keys or set elements, whereas lists cannot. In production, use tuples for fixed collections of heterogeneous data or constants, and lists when collection size changes dynamically.',
    source: 'curated',
  },
  {
    id: 'py_02',
    text: 'How does Python implement dictionaries under the hood? What gives them average O(1) time complexity for lookups, and how are hash collisions handled?',
    category: 'Technical',
    skill: 'Data Structures & Python Internals',
    difficulty: 'intermediate',
    experienceLevel: 'Junior / Mid-Level',
    hints: [
      'Reference hash tables, the hash() function, and open addressing.',
      'Explain what happens when two different keys generate the same hash value.',
      'Mention Python 3.6+ compact dictionary layout preserving insertion order.',
    ],
    sampleAnswer:
      'Python dictionaries are implemented as hash tables. When inserting a key-value pair, Python computes hash(key) and masks it to obtain an index into an array. If the slot is empty, it stores the entry. Hash collisions occur when two distinct keys yield the same index slot; Python resolves collisions using open addressing with a pseudo-random probing sequence. Since Python 3.6, dicts use a split compact array where an indices array maps to a dense entries table, preserving insertion order and reducing memory by ~20%. Average lookup, insertion, and deletion are O(1), degrading to O(n) only in pathological hash collision scenarios.',
    source: 'curated',
  },
  {
    id: 'py_03',
    text: 'Describe an optimal approach to identify all duplicate elements in an integer list with time and space complexity analysis.',
    category: 'Technical',
    skill: 'Algorithms',
    difficulty: 'beginner',
    experienceLevel: 'Fresher / Junior',
    hints: [
      'A brute force nested loop approach is O(n^2). How can a hash set help?',
      'Consider how to return duplicates only once even if an element appears 3+ times.',
    ],
    sampleAnswer:
      'The optimal approach uses a hash set to track seen elements in a single pass. We initialize an empty `seen` set and a `duplicates` set. As we iterate through the list, if the current number is already in `seen`, we add it to `duplicates`; otherwise, we add it to `seen`. This operates in O(n) time where n is the number of elements, and O(n) auxiliary space in the worst case where all elements are stored in sets. Alternatively, if auxiliary space must be O(1) and the list can be mutated with numbers within range [1..n], in-place index sign flipping can be applied.',
    source: 'curated',
  },
  {
    id: 'py_04',
    text: 'What is Python\'s Global Interpreter Lock (GIL), why does it exist, and how do you achieve true CPU parallelism in Python?',
    category: 'Technical',
    skill: 'Concurrency & Multithreading',
    difficulty: 'advanced',
    experienceLevel: 'Mid-Level / Senior',
    hints: [
      'Focus on CPython memory management and reference counting.',
      'Distinguish between CPU-bound tasks and I/O-bound tasks.',
      'Compare threading vs multiprocessing vs asyncio.',
    ],
    sampleAnswer:
      'The GIL is a mutex in CPython that prevents multiple native threads from executing Python bytecode simultaneously. It exists because CPython’s memory management is not thread-safe; reference counting requires synchronization to prevent race conditions on object destruction. For I/O-bound workloads (network, disk), Python threading or asyncio works well because the GIL is released during I/O waits. For CPU-bound parallel processing, true multi-core utilization is achieved using the `multiprocessing` module (which spawns separate OS processes with independent GILs and memory spaces) or C-extensions (like NumPy/Cython) that explicitly release the GIL during computation.',
    source: 'curated',
  },
  {
    id: 'py_05',
    text: 'Explain Python generators and the `yield` keyword. How do they enable memory-efficient processing of massive datasets?',
    category: 'Technical',
    skill: 'Python Advanced',
    difficulty: 'intermediate',
    experienceLevel: 'Junior / Mid-Level',
    hints: [
      'Contrast returning an entire list in memory vs yielding items on demand.',
      'Mention lazy evaluation and the iterator protocol (__iter__, __next__).',
    ],
    sampleAnswer:
      'A generator is a function containing one or more `yield` statements that produces an iterator implementing `__iter__()` and `__next__()`. Unlike regular functions that return a full collection in memory all at once (causing O(N) memory consumption), a generator suspends execution upon encountering `yield`, remembers its local state and instruction pointer, and resumes when the caller requests the next item via `next()`. This enables lazy evaluation and streaming, operating with O(1) memory overhead even when processing multi-gigabyte log files or infinite sequences.',
    source: 'curated',
  },

  // Frontend / React
  {
    id: 'fe_01',
    text: 'How does React\'s Virtual DOM and Reconciliation algorithm (Fiber) work, and how does React decide what to re-render?',
    category: 'Frontend',
    skill: 'React Architecture',
    difficulty: 'intermediate',
    experienceLevel: 'Junior / Mid-Level',
    hints: [
      'Explain the difference between real DOM manipulation and in-memory VDOM diffing.',
      'Mention the diffing heuristics: different types produce different trees, keys in lists.',
      'Discuss how React Fiber allows interruptible, prioritized rendering.',
    ],
    sampleAnswer:
      'React creates a lightweight in-memory JavaScript representation of the UI called the Virtual DOM. When state or props change, React constructs a new VDOM tree and runs a diffing algorithm against the previous tree. React uses heuristic O(n) assumptions: elements with different types tear down the old tree; stable keys allow matching children across renders. React Fiber reimagined this as a linked-list work loop of units of work called fibers, allowing rendering to be paused, prioritized, or aborted (concurrent mode). Once diffing finishes in the "render" phase, React applies minimum mutations to the real browser DOM in the synchronous "commit" phase.',
    source: 'curated',
  },
  {
    id: 'fe_02',
    text: 'What are the core differences between `useEffect`, `useLayoutEffect`, and standard event handlers regarding the browser paint cycle?',
    category: 'Frontend',
    skill: 'React Hooks',
    difficulty: 'advanced',
    experienceLevel: 'Mid-Level / Senior',
    hints: [
      'When are DOM mutations visible on screen?',
      'Which hook fires synchronously before browser paint to prevent visual flicker?',
    ],
    sampleAnswer:
      '`useEffect` runs asynchronously after the browser paints the screen, making it ideal for non-blocking side effects like data fetching, subscriptions, and logging. `useLayoutEffect` runs synchronously after React mutates the DOM but before the browser paints on screen; it blocks painting, which is crucial when reading layout dimensions (e.g., getBoundingClientRect) or adjusting scroll position to prevent visual flickers. Event handlers run in response to direct user interactions before state transitions trigger reconciliation.',
    source: 'curated',
  },

  // DSA / Coding
  {
    id: 'dsa_01',
    text: 'Given an array of integers and a target sum, describe the Two Sum problem solution. What are the time and space trade-offs between a hash map and a two-pointer approach?',
    category: 'DSA',
    skill: 'Hash Maps & Two Pointers',
    difficulty: 'beginner',
    experienceLevel: 'Fresher / Junior',
    hints: [
      'Single pass hash map checks `target - num`.',
      'Two pointers requires the array to be sorted first.',
    ],
    sampleAnswer:
      'With an unsorted array, the optimal solution uses a single-pass hash map: for each element `x`, we check if `target - x` exists in the map. If yes, we return both indices; otherwise, we store `x` with its index. Time complexity is O(n) and space complexity is O(n). If the array is already sorted, a two-pointer approach (left at 0, right at n-1) finds the pair in O(n) time with O(1) space by moving pointers inward. However, sorting an unsorted array takes O(n log n) time.',
    source: 'curated',
  },
  {
    id: 'dsa_02',
    text: 'Explain Breadth-First Search (BFS) vs Depth-First Search (DFS) on graphs. Which data structures back each, and when is BFS preferred for shortest paths?',
    category: 'DSA',
    skill: 'Graph Traversal',
    difficulty: 'intermediate',
    experienceLevel: 'Junior / Mid-Level',
    hints: [
      'BFS uses a Queue (FIFO); DFS uses a Stack (LIFO or recursion).',
      'In unweighted graphs, BFS explores nodes level by level.',
    ],
    sampleAnswer:
      'BFS explores all neighbors at distance d before moving to distance d+1, utilizing a FIFO Queue. DFS explores as deep as possible down a path before backtracking, utilizing a LIFO Stack or recursive call stack. In an unweighted graph, BFS guarantees finding the shortest path (minimum edge count) between two vertices because it visits nodes in non-decreasing order of distance from the source. Both algorithms run in O(V + E) time and O(V) space.',
    source: 'curated',
  },

  // SQL / DBMS
  {
    id: 'sql_01',
    text: 'Explain the difference between `WHERE` and `HAVING` in SQL. Can `HAVING` be used without a `GROUP BY` clause?',
    category: 'SQL / DBMS',
    skill: 'SQL Querying',
    difficulty: 'beginner',
    experienceLevel: 'Fresher / Junior',
    hints: [
      'WHERE filters individual rows before grouping.',
      'HAVING filters aggregated groups after GROUP BY.',
      'Consider aggregate functions like COUNT(), SUM(), AVG().',
    ],
    sampleAnswer:
      '`WHERE` filters individual rows from tables before grouping and before aggregate functions are computed; it cannot reference aggregate functions like `SUM()` or `COUNT()`. `HAVING` filters aggregated grouped results after `GROUP BY` has executed. `HAVING` can technically be used without `GROUP BY`, in which case the entire result set is treated as a single aggregate group (e.g., `SELECT SUM(salary) FROM employees HAVING SUM(salary) > 100000;`).',
    source: 'curated',
  },
  {
    id: 'sql_02',
    text: 'Explain B-Tree indexing in relational databases. How does a clustered index differ from a non-clustered index, and when can an index harm performance?',
    category: 'SQL / DBMS',
    skill: 'Database Indexing & Internals',
    difficulty: 'intermediate',
    experienceLevel: 'Junior / Mid-Level',
    hints: [
      'B-Trees keep data sorted with O(log n) lookups.',
      'Clustered index defines the physical order of table rows on disk.',
      'Non-clustered index stores pointers to rows.',
      'Indexes add overhead on INSERT, UPDATE, DELETE.',
    ],
    sampleAnswer:
      'A B-Tree index is a balanced search tree where all leaf nodes reside at equal depth, providing O(log n) lookups, range scans, and insertions. A clustered index defines the actual physical ordering of rows on disk; a table can have only one clustered index (usually the primary key). A non-clustered index is a separate structure containing the indexed column keys and pointers (row ID or clustered key) back to the actual data rows. Indexes accelerate SELECT queries, but degrade write performance (INSERT/UPDATE/DELETE) because the database must update each index tree upon every write and consumes additional disk storage.',
    source: 'curated',
  },

  // HR / Behavioral
  {
    id: 'hr_01',
    text: 'Tell me about a time you encountered a severe technical roadblock or bug that seemed unsolvable. How did you diagnose and resolve it?',
    category: 'HR / Behavioral',
    skill: 'Problem Solving & Resilience',
    difficulty: 'intermediate',
    experienceLevel: 'All Levels',
    hints: [
      'Use the STAR method: Situation, Task, Action, Result.',
      'Emphasize systematic debugging over random guessing.',
      'Conclude with what you learned or documented.',
    ],
    sampleAnswer:
      'Situation: During our final semester project, our API started returning intermittent 504 gateway timeouts under mock load. Task: As lead backend developer, I needed to locate the bottleneck before our deployment milestone. Action: Instead of guessing, I instrumented detailed request tracing and query timing logs. I discovered an N+1 query problem inside a nested loop where each user profile fetch triggered separate database roundtrips. I refactored the query to use an eager SQL JOIN with indexing on user_id, and added Redis caching for read-heavy profiles. Result: Latency dropped by 85%, timeouts vanished, and I documented the optimization patterns in our team wiki.',
    source: 'curated',
  },
  {
    id: 'hr_02',
    text: 'How do you handle disagreements with a teammate or tech lead regarding an architectural choice or code review feedback?',
    category: 'HR / Behavioral',
    skill: 'Collaboration & Communication',
    difficulty: 'beginner',
    experienceLevel: 'All Levels',
    hints: [
      'Show focus on product and technical trade-offs, not personal ego.',
      'Mention asking clarifying questions, evaluating evidence, and disagreeing and committing.',
    ],
    sampleAnswer:
      'I approach technical disagreements with curiosity and objective data rather than defensiveness. First, I seek to understand their perspective by asking questions about their concerns regarding scalability, maintainability, or timelines. Second, I frame the discussion around objective trade-offs (e.g., benchmarking performance, evaluating library maintenance, comparing complexity). If we still have differing opinions after laying out the facts, I trust the tech lead’s decision, disagree and commit fully to making the chosen approach successful, and reflect on the outcome afterwards.',
    source: 'curated',
  },

  // AI / Machine Learning
  {
    id: 'ai_01',
    text: 'Explain the bias-variance tradeoff in machine learning. How do you detect and mitigate high bias versus high variance in production models?',
    category: 'AI / Machine Learning',
    skill: 'ML Foundations',
    difficulty: 'intermediate',
    experienceLevel: 'Junior / Mid-Level',
    hints: [
      'High bias corresponds to underfitting; high variance to overfitting.',
      'Training loss vs validation loss curves indicate which problem exists.',
      'Techniques: regularization, data augmentation, model complexity adjustments.',
    ],
    sampleAnswer:
      'The bias-variance tradeoff describes the tension between model simplicity and flexibility. High bias (underfitting) occurs when a model makes erroneous assumptions and cannot capture data patterns; both training and validation errors are high. It is mitigated by increasing model complexity, adding relevant features, or reducing regularization. High variance (overfitting) occurs when the model memorizes noise in training data; training error is low but validation error is high. It is mitigated by adding more training data, applying regularization (L1/L2, dropout), pruning, early stopping, or using ensemble methods like Random Forests.',
    source: 'curated',
  },
];
