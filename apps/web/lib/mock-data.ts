// Static content shown in place of real API responses now that the backend
// is disconnected. Shapes must match the corresponding hooks in hooks/queries/*.

const MOCK_COURSES = [
  {
    id: "mock-course-1",
    title: "Foundations of Web Development",
    slug: "foundations-of-web-development",
    description:
      "HTML, CSS, and JavaScript fundamentals for building modern websites from scratch.",
    thumbnailUrl: null,
    thumbnailKey: null,
    status: "published" as const,
    createdAt: "2025-01-10T00:00:00.000Z",
    tag: "popular" as const,
    moduleCount: 6,
    modules: [
      "Getting started with HTML",
      "Styling with CSS",
      "JavaScript basics",
      "Working with the DOM",
      "Responsive layouts",
      "Deploying your first site",
    ],
  },
  {
    id: "mock-course-2",
    title: "Python for Data Analysis",
    slug: "python-for-data-analysis",
    description:
      "Learn to wrangle, visualize, and draw insight from real-world datasets using Python.",
    thumbnailUrl: null,
    thumbnailKey: null,
    status: "published" as const,
    createdAt: "2025-02-14T00:00:00.000Z",
    tag: "new" as const,
    moduleCount: 5,
    modules: [
      "Python essentials",
      "Working with pandas",
      "Data cleaning",
      "Visualization with matplotlib",
      "A capstone analysis",
    ],
  },
  {
    id: "mock-course-3",
    title: "Introduction to Cloud Computing",
    slug: "introduction-to-cloud-computing",
    description:
      "Understand core cloud concepts and get hands-on with deploying real applications.",
    thumbnailUrl: null,
    thumbnailKey: null,
    status: "published" as const,
    createdAt: "2025-03-01T00:00:00.000Z",
    tag: null,
    moduleCount: 4,
    modules: [
      "What is the cloud?",
      "Compute and storage basics",
      "Networking fundamentals",
      "Deploying your first app",
    ],
  },
] as const;

const MOCK_CHALLENGES = [
  {
    id: "mock-challenge-1",
    number: 1,
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "easy" as const,
    descriptionExcerpt:
      "Given an array of integers, return indices of the two numbers that add up to a target.",
    description:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution.",
    testCount: 6,
    functionParams: [
      { name: "nums", type: "int[]" },
      { name: "target", type: "int" },
    ],
    returnType: "int[]",
    timeLimit: 2000,
    visibleTestCases: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    starterCode: {
      python: "def two_sum(nums, target):\n    pass\n",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n",
      javascript: "function twoSum(nums, target) {\n  \n}\n",
      c: "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}\n",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) {\n    \n}\n",
      go: "func twoSum(nums []int, target int) []int {\n\t\n}\n",
    },
  },
  {
    id: "mock-challenge-2",
    number: 2,
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "easy" as const,
    descriptionExcerpt:
      "Determine if a string of brackets is valid using a stack-based approach.",
    description:
      "Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.",
    testCount: 8,
    functionParams: [{ name: "s", type: "string" }],
    returnType: "boolean",
    timeLimit: 2000,
    visibleTestCases: [
      { input: 's = "()"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    starterCode: {
      python: "def is_valid(s):\n    pass\n",
      java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}\n",
      javascript: "function isValid(s) {\n  \n}\n",
      c: "bool isValid(char* s) {\n    \n}\n",
      cpp: "bool isValid(string s) {\n    \n}\n",
      go: "func isValid(s string) bool {\n\t\n}\n",
    },
  },
  {
    id: "mock-challenge-3",
    number: 3,
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "medium" as const,
    descriptionExcerpt:
      "Merge all overlapping intervals in a list and return the resulting non-overlapping intervals.",
    description:
      "Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    testCount: 7,
    functionParams: [{ name: "intervals", type: "int[][]" }],
    returnType: "int[][]",
    timeLimit: 2000,
    visibleTestCases: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
    ],
    starterCode: {
      python: "def merge(intervals):\n    pass\n",
      java: "class Solution {\n    public int[][] merge(int[][] intervals) {\n        \n    }\n}\n",
      javascript: "function merge(intervals) {\n  \n}\n",
      c: "int** merge(int** intervals, int intervalsSize, int* intervalsColSize, int* returnSize, int** returnColumnSizes) {\n    \n}\n",
      cpp: "vector<vector<int>> merge(vector<vector<int>>& intervals) {\n    \n}\n",
      go: "func merge(intervals [][]int) [][]int {\n\t\n}\n",
    },
  },
] as const;

const MOCK_STATS = {
  students: 1240,
  courses: MOCK_COURSES.length,
  certificatesIssued: 386,
  challengeSolvers: 512,
};

type Mock = (match: RegExpMatchArray) => unknown;

export const MOCK_ROUTES: [RegExp, Mock][] = [
  [
    /^\/public\/courses\/all$/,
    () =>
      MOCK_COURSES.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        createdAt: c.createdAt,
        moduleCount: c.moduleCount,
      })),
  ],
  [
    /^\/public\/courses$/,
    () =>
      MOCK_COURSES.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        thumbnailKey: c.thumbnailKey,
        status: c.status,
        createdAt: c.createdAt,
        tag: c.tag,
      })),
  ],
  [
    /^\/public\/courses\/([^/]+)$/,
    (m) => {
      const course = MOCK_COURSES.find((c) => c.slug === m[1]) ?? MOCK_COURSES[0];
      return {
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        modules: course.modules,
      };
    },
  ],
  [
    /^\/public\/challenges$/,
    () =>
      MOCK_CHALLENGES.map((c) => ({
        id: c.id,
        number: c.number,
        title: c.title,
        slug: c.slug,
        difficulty: c.difficulty,
        descriptionExcerpt: c.descriptionExcerpt,
        testCount: c.testCount,
      })),
  ],
  [
    /^\/public\/challenges\/([^/]+)$/,
    (m) => {
      const challenge =
        MOCK_CHALLENGES.find((c) => c.slug === m[1]) ?? MOCK_CHALLENGES[0];
      return {
        id: challenge.id,
        title: challenge.title,
        slug: challenge.slug,
        description: challenge.description,
        difficulty: challenge.difficulty,
        starterCode: challenge.starterCode,
        functionParams: challenge.functionParams,
        returnType: challenge.returnType,
        timeLimit: challenge.timeLimit,
        visibleTestCases: challenge.visibleTestCases,
      };
    },
  ],
  [/^\/public\/stats$/, () => MOCK_STATS],
];
