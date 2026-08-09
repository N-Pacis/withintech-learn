import type { Quiz } from "./types";

// The course-level quiz. Passing it marks the enrollment PASSED and issues the
// certificate (see submitQuiz in student/quiz.service.ts), so it is the last
// gate of the course. Two questions per module, drawn across the whole course.
export const finalExam: Quiz = {
  title: "Final Exam: Python for Beginners",
  passingScore: 70,
  maxAttempts: 3,
  questions: [
    // ── Module 1: getting started ──
    {
      text: "What does it mean that Python is an interpreted language?",
      options: [
        "The interpreter runs your code directly, with no separate compile step",
        "The code is turned into an .exe before it can run",
        "The code only runs inside a web browser",
        "The code is checked for errors but never executed",
      ],
      correct: [0],
    },
    {
      text: 'What is printed by print("Total:", 25)?',
      options: ["Total: 25", "Total:25", "Total: , 25", "Total 25"],
      correct: [0],
    },

    // ── Module 2: syntax ──
    {
      text: "What does indentation do in Python?",
      options: [
        "It groups statements into blocks, so it changes what the code does",
        "It only makes the code easier to read",
        "It marks the end of a statement",
        "It is ignored by the interpreter",
      ],
      correct: [0],
    },
    {
      text: "A SyntaxError is reported in your file. How much of the file has run?",
      options: [
        "None of it",
        "Everything before the bad line",
        "The whole file",
        "Only the import lines",
      ],
      correct: [0],
    },

    // ── Module 3: variables and types ──
    {
      text: "What is the type of the result of 10 / 2?",
      options: ["float", "int", "str", "bool"],
      correct: [0],
    },
    {
      text: 'What happens with print("age: " + 36)?',
      options: [
        "A TypeError, because a string and an int cannot be joined with +",
        "It prints age: 36",
        "A ValueError",
        "It prints age: 36.0",
      ],
      correct: [0],
    },

    // ── Module 4: strings ──
    {
      text: 'What does "programming"[0:4] give?',
      options: ["prog", "progr", "rogr", "gram"],
      correct: [0],
    },
    {
      text: 'With name = "Ada", which produces "Hello, Ada!"?',
      options: [
        'f"Hello, {name}!"',
        '"Hello, {name}!"',
        'f"Hello, name!"',
        '"Hello, " + name + 1',
      ],
      correct: [0],
    },

    // ── Module 5: operators and input ──
    {
      text: "What is 17 % 5?",
      options: ["2", "3", "3.4", "0"],
      correct: [0],
    },
    {
      text: "What type does input() return?",
      options: [
        "str, every time",
        "int when the user types digits",
        "float when the user types a decimal",
        "It depends on the prompt",
      ],
      correct: [0],
    },

    // ── Module 6: conditionals ──
    {
      text: "In an if / elif / elif / else chain, how many blocks run?",
      options: ["Exactly one", "All that match", "At most two", "None"],
      correct: [0],
    },
    {
      text: 'Why is day == "Saturday" or "Sunday" a bug?',
      options: [
        'Python reads it as (day == "Saturday") or ("Sunday"), and a non-empty string is always truthy',
        "or cannot be used with strings",
        "It raises a SyntaxError",
        "It checks Sunday but ignores Saturday",
      ],
      correct: [0],
    },

    // ── Module 7: loops ──
    {
      text: "What numbers does range(1, 5) produce?",
      options: ["1, 2, 3, 4", "1, 2, 3, 4, 5", "0, 1, 2, 3, 4", "1 and 5"],
      correct: [0],
    },
    {
      text: "What is printed by: for n in range(1, 6): if n == 3: continue; print(n)",
      options: ["1, 2, 4, 5", "1, 2", "1, 2, 3, 4, 5", "3"],
      correct: [0],
    },

    // ── Module 8: collections ──
    {
      text: "After a = [1, 2]; b = a; b.append(3), what does a hold?",
      options: ["[1, 2, 3]", "[1, 2]", "[3]", "None"],
      correct: [0],
    },
    {
      text: 'What does {"name": "Ada"}.get("email", "none") return?',
      options: ['"none"', "None", "A KeyError", '"Ada"'],
      correct: [0],
    },
    {
      text: "You need a collection with no duplicate values, where order does not matter. Which type fits?",
      options: ["Set", "List", "Tuple", "Dictionary"],
      correct: [0],
    },

    // ── Module 9: functions ──
    {
      text: "def f(): print(1) — what does x = f() put in x?",
      options: ["None", "1", "The function itself", "An empty string"],
      correct: [0],
    },
    {
      text: "What is wrong with def add(item, basket=[])?",
      options: [
        "The default list is created once and shared by every call",
        "Lists cannot be used as parameters",
        "The parameter order is invalid",
        "Nothing is wrong",
      ],
      correct: [0],
    },
    {
      text: "A function assigns to a name that also exists outside it. What is affected?",
      options: [
        "Only a new local variable — the outer one is unchanged",
        "The outer variable is changed",
        "Both are set to None",
        "A NameError is raised",
      ],
      correct: [0],
    },

    // ── Module 10: errors, files, modules ──
    {
      text: "Which line of a traceback states the actual error?",
      options: [
        "The last line",
        "The first line",
        "The line saying Traceback",
        "The line with the file name",
      ],
      correct: [0],
    },
    {
      text: 'What happens to an existing file opened with mode "w"?',
      options: [
        "Its contents are erased",
        "New text is added to the end",
        "It is opened read-only",
        "A FileExistsError is raised",
      ],
      correct: [0],
    },
    {
      text: "Why should you use with open(...) as file:?",
      options: [
        "The file is closed automatically, even if an error happens",
        "It reads the file faster",
        "It is the only way to write to a file",
        "It prevents FileNotFoundError",
      ],
      correct: [0],
    },

    // ── Cross-module questions ──
    {
      text: "Select every statement that is true about Python.",
      options: [
        "Strings are immutable, but lists are mutable",
        "A function with no return statement gives back None",
        "input() always returns a string",
        "Indentation is only for readability",
      ],
      correct: [0, 1, 2],
    },
    {
      text: "Which of these raise an error rather than returning a value?",
      options: [
        'int("hello")',
        '["a"][3]',
        '{"a": 1}["b"]',
        '{"a": 1}.get("b")',
      ],
      correct: [0, 1, 2],
    },
    {
      text: "You must sum every number in a list. Where does total = 0 belong?",
      options: [
        "Before the loop",
        "As the first line inside the loop",
        "As the last line inside the loop",
        "After the loop",
      ],
      correct: [0],
    },
  ],
};
