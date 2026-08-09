import type { Module } from "../types";
import { text, py, out } from "../types";

export const syntax: Module = {
  title: "Syntax, Statements and Comments",
  lessons: [
    {
      title: "Statements and Line Structure",
      blocks: [
        text(
          "<h2>A program is a list of statements</h2><p>A <strong>statement</strong> is one instruction for the computer to carry out. A program is a list of statements, run in order.</p><p>This program has three statements:</p>",
        ),
        py(
          'print("Opening the file")\nprint("Reading the data")\nprint("Done")',
        ),
        out("Opening the file\nReading the data\nDone"),
        text(
          "<p>Python ran the first statement, then the second, then the third. It never skips ahead and never reorders them.</p>",
        ),
        text(
          "<h3>One statement per line</h3><p>In Python a statement normally ends when the line ends. You do <em>not</em> write a semicolon at the end, unlike Java, C or JavaScript.</p><p>Python does allow a semicolon to put two statements on one line:</p>",
        ),
        py('print("Hello"); print("Goodbye")'),
        out("Hello\nGoodbye"),
        text(
          "<p>It works, but almost no Python programmer writes this way. One statement per line is easier to read and easier to debug, because an error message can point at exactly one instruction.</p>",
        ),
        text(
          "<h3>What happens with no separator</h3><p>Two statements on one line with neither a newline nor a semicolon is an error:</p>",
        ),
        py('print("Python is fun!") print("Really!")'),
        out("SyntaxError: invalid syntax"),
        text(
          "<p>A <strong>SyntaxError</strong> means Python could not even understand the code, so it did not run any of it. This is different from an error that happens while the program is running — a syntax error stops the file before the first line executes.</p>",
        ),
        text(
          "<h3>Splitting a long statement over several lines</h3><p>Sometimes one statement is too long to read comfortably. Anything inside brackets can be spread over several lines:</p>",
        ),
        py(
          'print(\n    "Name:", "Ada",\n    "Role:", "Engineer"\n)',
        ),
        out("Name: Ada Role: Engineer"),
        text(
          "<p>Python sees the open bracket and keeps reading until it finds the matching close bracket. This is the normal way to break up long lines.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A statement is one instruction; a program is a list of them.</p></li><li><p>Statements run in order, top to bottom.</p></li><li><p>A statement ends at the end of the line. No semicolon needed.</p></li><li><p>Two statements on one line need a semicolon between them, but this is bad style.</p></li><li><p>A <code>SyntaxError</code> stops the file before anything runs.</p></li><li><p>Code inside brackets may span several lines.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Statements",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "How does a Python statement normally end?",
            options: [
              "At the end of the line, with no semicolon",
              "With a semicolon",
              "With a full stop",
              "With a closing curly brace",
            ],
            correct: [0],
          },
          {
            text: 'What is the result of: print("a") print("b") on a single line?',
            options: [
              "A SyntaxError, and no line of the file runs",
              "It prints a then b",
              "It prints only a",
              "It prints ab",
            ],
            correct: [0],
          },
          {
            text: "Why is a SyntaxError different from an error that happens while running?",
            options: [
              "Python cannot understand the code, so it does not execute any of the file",
              "It only appears after the program finishes",
              "It can be safely ignored",
              "It always points to the last line of the file",
            ],
            correct: [0],
          },
          {
            text: "How can you spread one long statement over several lines?",
            options: [
              "Break it inside brackets — Python keeps reading to the matching close bracket",
              "End each line with a semicolon",
              "It is not possible in Python",
              "Put a comma at the end of the file",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Indentation: How Python Groups Code",
      blocks: [
        text(
          "<h2>Indentation has meaning in Python</h2><p><strong>Indentation</strong> is the empty space at the start of a line. In most languages it is only for looks, and curly braces group the code. In Python the indentation <em>is</em> the grouping. Get it wrong and the program either breaks or does the wrong thing.</p>",
        ),
        text(
          "<p>Here the indented line belongs to the <code>if</code> above it:</p>",
        ),
        py('if 5 > 2:\n    print("Five is greater than two")'),
        out("Five is greater than two"),
        text(
          "<p>The colon at the end of the <code>if</code> line announces that a block is coming. The indented lines after it are that block.</p>",
        ),
        text(
          "<h3>Missing indentation is an error</h3><p>Remove the spaces and Python complains:</p>",
        ),
        py('if 5 > 2:\nprint("Five is greater than two")'),
        out(
          'IndentationError: expected an indented block after \'if\' statement on line 1',
        ),
        text(
          "<p>Python expected a block after the colon and did not find one.</p>",
        ),
        text(
          "<h3>Be consistent inside one block</h3><p>You choose how many spaces to use, but every line in the same block must use the same amount:</p>",
        ),
        py(
          'if 5 > 2:\n    print("first line")\n        print("second line")',
        ),
        out("IndentationError: unexpected indent"),
        text(
          "<p>The second line is indented more than the first, so Python cannot tell which block it belongs to.</p>",
        ),
        text(
          "<h3>Indentation changes meaning, not only validity</h3><p>These two programs are both valid, and they behave differently:</p>",
        ),
        py(
          'temperature = 10\n\nif temperature > 30:\n    print("It is hot")\n    print("Drink water")'),
        text("<p>Nothing is printed, because 10 is not greater than 30. Both lines are inside the <code>if</code>. Now move the last line out:</p>"),
        py(
          'temperature = 10\n\nif temperature > 30:\n    print("It is hot")\nprint("Drink water")'),
        out("Drink water"),
        text(
          "<p>The second message is no longer part of the <code>if</code>, so it runs whatever the temperature is. Nothing about the words changed — only the spaces at the start of the line.</p>",
        ),
        text(
          "<h3>The rule to follow</h3><p>Use <strong>four spaces</strong> per level. This is what the official Python style guide recommends, and it is what almost all Python code uses. Never mix tabs and spaces in the same file — they look the same on screen but count differently, which produces errors that are painful to find. Most editors can be set to insert four spaces when you press Tab.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Indentation groups code in Python; it is not decoration.</p></li><li><p>A colon at the end of a line announces an indented block below.</p></li><li><p>Every line in the same block needs the same indentation.</p></li><li><p>Moving a line in or out changes which block it belongs to, and so changes behaviour.</p></li><li><p>Use four spaces per level, and never mix tabs with spaces.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Indentation",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What does indentation do in Python?",
            options: [
              "It groups statements into blocks and changes what the code does",
              "It only makes the code easier to read",
              "It is ignored completely by the interpreter",
              "It marks the end of a statement",
            ],
            correct: [0],
          },
          {
            text: "What announces that an indented block is coming?",
            options: [
              "A colon at the end of the line",
              "An opening curly brace",
              "The word begin",
              "A semicolon",
            ],
            correct: [0],
          },
          {
            text: "How many spaces per level does the Python style guide recommend?",
            options: ["Four", "One", "Two", "Eight"],
            correct: [0],
          },
          {
            text: "Why should you never mix tabs and spaces in one file?",
            options: [
              "They look the same on screen but count differently, causing errors that are hard to find",
              "Tabs are not allowed in any text file",
              "It makes the file larger",
              "Python removes all tabs when saving",
            ],
            correct: [0],
          },
          {
            text: "A line that was inside an if block is moved to the left, out of the block. What changes?",
            options: [
              "It now runs whether or not the if condition is true",
              "Nothing — indentation is only for looks",
              "The program will always raise an error",
              "The if statement is deleted",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Comments and Writing Readable Code",
      blocks: [
        text(
          "<h2>Comments are notes for people</h2><p>A <strong>comment</strong> is text in your file that Python ignores completely. It exists for the humans reading the code — including you, six months later.</p><p>Anything after a <code>#</code> on a line is a comment:</p>",
        ),
        py('# Print a greeting for the user\nprint("Hello!")'),
        out("Hello!"),
        text(
          "<p>The first line produced no output at all. Python skipped it.</p>",
        ),
        text(
          "<h3>Comments at the end of a line</h3><p>A comment can also follow code on the same line:</p>",
        ),
        py("price = 1500  # price in Rwandan francs"),
        text(
          "<p>Everything from the <code>#</code> to the end of the line is ignored. The <code>price = 1500</code> part still runs normally.</p>",
        ),
        text(
          "<h3>Turning code off temporarily</h3><p>Putting <code>#</code> in front of a line is a quick way to stop it running while you test something. This is common while debugging:</p>",
        ),
        py(
          'print("step 1")\n# print("step 2")\nprint("step 3")',
        ),
        out("step 1\nstep 3"),
        text(
          "<h3>Comments over several lines</h3><p>Python has no dedicated block comment. To write several lines of notes, start each line with <code>#</code>:</p>",
        ),
        py(
          "# This program calculates the total price.\n# The tax rate is fixed at 18 percent for now.\n# TODO: read the rate from the settings file instead.\nprice = 1000",
        ),
        text(
          "<p>You will sometimes see a triple-quoted string used as a comment. That is really a string that nobody stores, not a comment. It works, but the <code>#</code> form is the clear choice for notes.</p>",
        ),
        text(
          "<h3>What makes a good comment</h3><p>A comment should explain <strong>why</strong>, not repeat <strong>what</strong>. The code already says what it does.</p><p>This comment adds nothing:</p>",
        ),
        py("# add one to count\ncount = count + 1"),
        text("<p>This one is worth writing:</p>"),
        py(
          "# The API counts from 1, but our list starts at 0, so shift by one.\ncount = count + 1",
        ),
        text(
          "<p>The second comment explains a reason the reader could not guess from the code alone.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A comment starts with <code>#</code> and is ignored by Python.</p></li><li><p>Comments can be on their own line or at the end of a code line.</p></li><li><p>Commenting out a line is a quick way to disable it while testing.</p></li><li><p>Python has no block comment — use <code>#</code> on each line.</p></li><li><p>Good comments explain why, not what.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Comments",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Which character starts a comment in Python?",
            options: ["#", "//", "--", "/*"],
            correct: [0],
          },
          {
            text: "What does Python do with a comment?",
            options: [
              "Ignores it completely",
              "Prints it to the screen",
              "Saves it to a log file",
              "Runs it more slowly than normal code",
            ],
            correct: [0],
          },
          {
            text: "How do you write a comment that spans three lines?",
            options: [
              "Start each of the three lines with #",
              "Wrap them in /* and */",
              "Put a # only on the first line",
              "Indent them by eight spaces",
            ],
            correct: [0],
          },
          {
            text: "Which is the better comment for the line total = total * 1.18?",
            options: [
              "# 18 percent VAT, required by the tax rules for local sales",
              "# multiply total by 1.18",
              "# this is a line of code",
              "# total",
            ],
            correct: [0],
          },
          {
            text: "What is the output of: print(\"A\") then # print(\"B\") then print(\"C\")?",
            options: ["A and C", "A, B and C", "Only A", "A SyntaxError"],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 2 Test: Syntax, Statements and Comments",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "Which statement about Python line endings is correct?",
        options: [
          "A statement ends at the end of the line; a semicolon is not needed",
          "Every statement must end with a semicolon",
          "Every statement must end with a colon",
          "Statements never end until the file ends",
        ],
        correct: [0],
      },
      {
        text: "What is the purpose of the colon at the end of an if line?",
        options: [
          "It announces that an indented block follows",
          "It ends the statement",
          "It separates two statements",
          "It marks a comment",
        ],
        correct: [0],
      },
      {
        text: "Which of these will raise an IndentationError?",
        options: [
          "An if line with a colon but no indented line under it",
          "Two lines in the same block indented by different amounts",
          "A block indented with four spaces on every line",
          "A comment placed before an if statement",
        ],
        correct: [0, 1],
      },
      {
        text: "What is printed by: x = 3, then if x > 10: print(\"big\"), then print(\"done\") with print(\"done\") NOT indented?",
        options: ["done", "big and done", "big", "Nothing"],
        correct: [0],
      },
      {
        text: "Which are true about comments?",
        options: [
          "They start with #",
          "Python ignores them",
          "They can follow code on the same line",
          "Python has a dedicated block comment syntax",
        ],
        correct: [0, 1, 2],
      },
      {
        text: "Why is one statement per line preferred over using semicolons?",
        options: [
          "It is easier to read, and an error can point at exactly one instruction",
          "Semicolons make Python run slower",
          "Semicolons are not allowed in Python at all",
          "Semicolons change the meaning of the statement",
        ],
        correct: [0],
      },
      {
        text: "How many spaces per indentation level should you use?",
        options: ["Four", "One", "Three", "It must be a tab character"],
        correct: [0],
      },
      {
        text: "A SyntaxError is reported. How much of your file has already run?",
        options: [
          "None of it",
          "Everything before the bad line",
          "The whole file",
          "Only the import lines",
        ],
        correct: [0],
      },
    ],
  },
};
