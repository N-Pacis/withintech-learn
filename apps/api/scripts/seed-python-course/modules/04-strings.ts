import type { Module } from "../types";
import { text, py, out } from "../types";

export const strings: Module = {
  title: "Working with Strings",
  lessons: [
    {
      title: "Creating Strings and Escape Characters",
      blocks: [
        text(
          "<h2>Writing text</h2><p>A <strong>string</strong> is a piece of text. You write one between single quotes or double quotes. Python treats both the same way:</p>",
        ),
        py("a = \"hello\"\nb = 'hello'\nprint(a == b)"),
        out("True"),
        text(
          "<p>Pick whichever avoids a clash with the text itself. If the text contains an apostrophe, use double quotes:</p>",
        ),
        py("message = \"It's raining\"\nprint(message)"),
        out("It's raining"),
        text("<p>If it contains double quotes, use single quotes:</p>"),
        py("quote = 'She said \"hello\" and left'\nprint(quote)"),
        out('She said "hello" and left'),
        text(
          "<h3>Escape characters</h3><p>When you need a quote of the same kind you are using, put a backslash in front of it. The backslash says \"treat the next character as plain text, not as syntax\":</p>",
        ),
        py('message = "She said \\"hello\\" and left"\nprint(message)'),
        out('She said "hello" and left'),
        text(
          "<p>The backslash also creates characters you cannot type directly. The two you will use most:</p><ul><li><p><code>\\n</code> — a new line</p></li><li><p><code>\\t</code> — a tab</p></li></ul>",
        ),
        py('print("Line one\\nLine two")\nprint("Name:\\tAda")'),
        out("Line one\nLine two\nName:\tAda"),
        text(
          "<p>To print an actual backslash, write two of them:</p>",
        ),
        py('print("C:\\\\Users\\\\Ada")'),
        out("C:\\Users\\Ada"),
        text(
          "<h3>Strings over several lines</h3><p>Three quotes let a string run across lines exactly as you typed it:</p>",
        ),
        py(
          'address = """Kigali Heights\nKG 7 Ave\nRwanda"""\nprint(address)',
        ),
        text(
          "<p>Every line break you type between the triple quotes is kept in the value, so the output matches the shape of the source:</p>",
        ),
        out("Kigali Heights\nKG 7 Ave\nRwanda"),
        text(
          "<h3>The empty string</h3><p>A string with nothing in it is still a valid string. It has length zero, and it converts to <code>False</code>:</p>",
        ),
        py('blank = ""\nprint(len(blank))\nprint(bool(blank))'),
        out("0\nFalse"),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Single and double quotes both create strings.</p></li><li><p>Choose the quote style that avoids clashing with the text.</p></li><li><p>A backslash escapes the next character: <code>\\\"</code>, <code>\\n</code>, <code>\\t</code>, <code>\\\\</code>.</p></li><li><p>Triple quotes keep line breaks exactly as written.</p></li><li><p>The empty string has length 0 and is falsy.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Creating Strings",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the difference between single and double quotes in Python?",
            options: [
              "No difference — both create the same kind of string",
              "Single quotes create characters, double quotes create strings",
              "Double quotes allow escape characters, single quotes do not",
              "Single quotes are only for one letter",
            ],
            correct: [0],
          },
          {
            text: "What does \\n do inside a string?",
            options: [
              "Starts a new line",
              "Prints the letter n",
              "Inserts a tab",
              "Ends the string",
            ],
            correct: [0],
          },
          {
            text: "How do you include an actual backslash in a string?",
            options: [
              "Write two backslashes",
              "Write one backslash",
              "Use a forward slash instead",
              "It is not possible",
            ],
            correct: [0],
          },
          {
            text: "What are triple quotes used for?",
            options: [
              "Writing a string that spans several lines, keeping the line breaks",
              "Marking a comment",
              "Creating a number",
              "Escaping every character inside",
            ],
            correct: [0],
          },
          {
            text: 'What is bool("")?',
            options: ["False", "True", "None", "A ValueError"],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Indexing and Slicing",
      blocks: [
        text(
          "<h2>Positions start at zero</h2><p>Each character in a string has a position, called its <strong>index</strong>. Counting starts at <strong>0</strong>, not 1. You reach a character with square brackets:</p>",
        ),
        py('word = "Python"\nprint(word[0])\nprint(word[1])\nprint(word[5])'),
        out("P\ny\nn"),
        text(
          "<p>The word <code>Python</code> has six characters, so the valid indices are 0 to 5. Asking for index 6 fails:</p>",
        ),
        py('word = "Python"\nprint(word[6])'),
        out("IndexError: string index out of range"),
        text(
          "<h3>Counting backwards</h3><p>Negative indices count from the end. <code>-1</code> is the last character:</p>",
        ),
        py('word = "Python"\nprint(word[-1])\nprint(word[-2])'),
        out("n\no"),
        text(
          "<p>This is useful because you do not need to know the length to reach the end.</p>",
        ),
        text(
          "<h3>Slicing: taking a piece</h3><p>A <strong>slice</strong> takes a range of characters. The form is <code>[start:stop]</code>. The start is included and the stop is <em>not</em>:</p>",
        ),
        py('word = "Python"\nprint(word[0:3])\nprint(word[2:5])'),
        out("Pyt\ntho"),
        text(
          "<p><code>word[0:3]</code> gives positions 0, 1 and 2 — three characters. The rule \"stop is not included\" means the length of the slice is simply <code>stop - start</code>.</p>",
        ),
        text(
          "<h3>Leaving parts out</h3><p>Leave the start blank to begin at the front, and the stop blank to run to the end:</p>",
        ),
        py('word = "Python"\nprint(word[:3])\nprint(word[3:])\nprint(word[:])'),
        out("Pyt\nhon\nPython"),
        text("<p>Negative numbers work in slices too:</p>"),
        py('filename = "report.csv"\nprint(filename[-3:])\nprint(filename[:-4])'),
        out("csv\nreport"),
        text(
          "<h3>A step</h3><p>A third number sets the step. <code>[::2]</code> takes every second character, and <code>[::-1]</code> walks backwards, which reverses the string:</p>",
        ),
        py('word = "Python"\nprint(word[::2])\nprint(word[::-1])'),
        out("Pto\nnohtyP"),
        text(
          "<h3>Strings cannot be changed</h3><p>Strings are <strong>immutable</strong>: once created, a string can never be modified. Trying to assign to one position fails:</p>",
        ),
        py('word = "Python"\nword[0] = "J"'),
        out("TypeError: 'str' object does not support item assignment"),
        text(
          "<p>Instead, build a new string from the pieces you want:</p>",
        ),
        py('word = "Python"\nnew_word = "J" + word[1:]\nprint(new_word)\nprint(word)'),
        out("Jython\nPython"),
        text(
          "<p>The original is untouched. Every operation that looks like it changes a string really returns a new one.</p>",
        ),
        text(
          "<h3>Length</h3><p><code>len</code> reports how many characters a string holds:</p>",
        ),
        py('print(len("Python"))\nprint(len(""))'),
        out("6\n0"),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Indices start at 0; <code>-1</code> is the last character.</p></li><li><p>An index outside the range raises an <code>IndexError</code>.</p></li><li><p><code>[start:stop]</code> includes start and excludes stop.</p></li><li><p>Leave a side blank to reach the front or the end; <code>[::-1]</code> reverses.</p></li><li><p>Strings are immutable — build a new string instead of changing one.</p></li><li><p><code>len(s)</code> gives the number of characters.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Indexing and Slicing",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: 'For word = "Python", what is word[0]?',
            options: ["P", "y", "Python", "An IndexError"],
            correct: [0],
          },
          {
            text: 'What is word[-1] for word = "Python"?',
            options: ["n", "P", "o", "An IndexError"],
            correct: [0],
          },
          {
            text: 'What does "Python"[0:3] give?',
            options: ["Pyt", "Pyth", "yt", "Pytho"],
            correct: [0],
          },
          {
            text: "In a slice [start:stop], which positions are included?",
            options: [
              "start is included, stop is not",
              "Both start and stop are included",
              "Neither is included",
              "stop is included, start is not",
            ],
            correct: [0],
          },
          {
            text: 'What does "Python"[::-1] give?',
            options: ["nohtyP", "Python", "P", "An error"],
            correct: [0],
          },
          {
            text: 'Why does word[0] = "J" raise a TypeError?',
            options: [
              "Strings are immutable and cannot be changed after creation",
              "J is not a valid character",
              "Index 0 does not exist",
              "You must use round brackets instead",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "String Methods",
      blocks: [
        text(
          "<h2>Methods are functions attached to a value</h2><p>A <strong>method</strong> is a function that belongs to a value. You call it with a dot after the value. Strings come with many useful ones.</p><p>Remember that strings are immutable, so <strong>every string method returns a new string</strong> and leaves the original alone.</p>",
        ),
        text("<h3>Changing case</h3>"),
        py(
          'name = "ada lovelace"\n\nprint(name.upper())\nprint(name.title())\nprint(name.capitalize())\nprint(name)',
        ),
        out("ADA LOVELACE\nAda Lovelace\nAda lovelace\nada lovelace"),
        text(
          "<p>The last line proves the point: <code>name</code> is unchanged. If you want to keep the result, assign it:</p>",
        ),
        py('name = "ada lovelace"\nname = name.title()\nprint(name)'),
        out("Ada Lovelace"),
        text(
          "<h3>Removing unwanted spaces</h3><p><code>strip</code> removes whitespace from both ends. This matters constantly when handling text typed by a user:</p>",
        ),
        py(
          'entry = "   ada@example.com   "\nprint("[" + entry.strip() + "]")\nprint("[" + entry.lstrip() + "]")\nprint("[" + entry.rstrip() + "]")',
        ),
        out(
          "[ada@example.com]\n[ada@example.com   ]\n[   ada@example.com]",
        ),
        text(
          "<h3>Searching</h3><p><code>find</code> returns the index where some text starts, or <code>-1</code> if it is not there. <code>in</code> answers the simpler yes-or-no question:</p>",
        ),
        py(
          'sentence = "Python is fun"\n\nprint(sentence.find("is"))\nprint(sentence.find("Java"))\nprint("fun" in sentence)\nprint("Java" in sentence)',
        ),
        out("7\n-1\nTrue\nFalse"),
        text(
          "<h3>Replacing</h3><p><code>replace</code> swaps every occurrence of one piece of text for another:</p>",
        ),
        py(
          'sentence = "I like cats. Cats are great."\nprint(sentence.replace("cats", "dogs"))',
        ),
        out("I like dogs. Cats are great."),
        text(
          "<p>Only the lowercase <code>cats</code> changed. String methods are case sensitive.</p>",
        ),
        text(
          "<h3>Splitting and joining</h3><p><code>split</code> breaks a string into a list of pieces. With no argument it splits on whitespace:</p>",
        ),
        py(
          'sentence = "Python is fun"\nprint(sentence.split())\n\nrow = "Ada,Engineer,Kigali"\nprint(row.split(","))',
        ),
        out(
          "['Python', 'is', 'fun']\n['Ada', 'Engineer', 'Kigali']",
        ),
        text(
          "<p><code>join</code> does the opposite. Note the order: you call it on the separator, and pass the list:</p>",
        ),
        py(
          'parts = ["Ada", "Engineer", "Kigali"]\nprint(",".join(parts))\nprint(" - ".join(parts))',
        ),
        out("Ada,Engineer,Kigali\nAda - Engineer - Kigali"),
        text(
          "<h3>Checking the content</h3><p>These return a boolean and are handy for validation:</p>",
        ),
        py(
          'print("abc".isalpha())\nprint("123".isdigit())\nprint("abc123".isalnum())\nprint("report.csv".startswith("report"))\nprint("report.csv".endswith(".csv"))',
        ),
        out("True\nTrue\nTrue\nTrue\nTrue"),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A method is called with a dot: <code>value.method()</code>.</p></li><li><p>String methods return a new string; assign the result to keep it.</p></li><li><p><code>upper</code>, <code>lower</code>, <code>title</code> change case; <code>strip</code> removes surrounding spaces.</p></li><li><p><code>find</code> gives an index or <code>-1</code>; <code>in</code> gives True or False.</p></li><li><p><code>split</code> makes a list; <code>separator.join(list)</code> makes a string.</p></li><li><p>String methods are case sensitive.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: String Methods",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: 'After name = "ada" and name.upper(), what does name hold?',
            options: [
              '"ada" — the method returns a new string and does not change the original',
              '"ADA"',
              "None",
              "A TypeError is raised",
            ],
            correct: [0],
          },
          {
            text: "What does strip() do?",
            options: [
              "Removes whitespace from both ends of the string",
              "Removes every space in the string",
              "Removes the first character",
              "Splits the string into a list",
            ],
            correct: [0],
          },
          {
            text: 'What does "Python is fun".find("Java") return?',
            options: ["-1", "0", "None", "A ValueError"],
            correct: [0],
          },
          {
            text: 'What does "a,b,c".split(",") produce?',
            options: [
              "['a', 'b', 'c']",
              '"a b c"',
              "['a,b,c']",
              "('a', 'b', 'c')",
            ],
            correct: [0],
          },
          {
            text: 'Which call joins ["a", "b"] into "a-b"?',
            options: [
              '"-".join(["a", "b"])',
              '["a", "b"].join("-")',
              'join("-", ["a", "b"])',
              '"a-b".join()',
            ],
            correct: [0],
          },
          {
            text: 'Why does "I like cats. Cats are great.".replace("cats", "dogs") change only one word?',
            options: [
              "String methods are case sensitive, so Cats with a capital C does not match",
              "replace only ever changes the first match",
              "The full stop blocks the second match",
              "It is a bug in Python",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Building Strings with f-strings",
      blocks: [
        text(
          "<h2>Putting values inside text</h2><p>You often need to build a message from fixed words and changing values. Joining with <code>+</code> works but is noisy, and it fails unless every piece is already a string:</p>",
        ),
        py(
          'name = "Ada"\nage = 36\nprint("My name is " + name + " and I am " + str(age))',
        ),
        out("My name is Ada and I am 36"),
        text(
          "<h3>The f-string</h3><p>Put an <code>f</code> in front of the opening quote. Then anything inside curly braces is worked out and dropped into the text:</p>",
        ),
        py(
          'name = "Ada"\nage = 36\nprint(f"My name is {name} and I am {age}")',
        ),
        out("My name is Ada and I am 36"),
        text(
          "<p>No <code>str()</code> is needed — the f-string converts every value for you. This is the standard way to build strings in modern Python.</p>",
        ),
        text(
          "<h3>Any expression fits in the braces</h3><p>The braces are not limited to variable names. Python works out whatever is inside:</p>",
        ),
        py(
          'price = 1200\nquantity = 3\nprint(f"Total: {price * quantity} RWF")\n\nname = "ada"\nprint(f"Hello, {name.title()}!")',
        ),
        out("Total: 3600 RWF\nHello, Ada!"),
        text(
          "<h3>Controlling how numbers look</h3><p>A colon inside the braces starts a format instruction. <code>.2f</code> means \"a float with two digits after the point\":</p>",
        ),
        py(
          "average = 7.16666\nprint(f\"Average: {average:.2f}\")\n\ntotal = 1234567\nprint(f\"Total: {total:,}\")",
        ),
        out("Average: 7.17\nTotal: 1,234,567"),
        text(
          "<p>The first rounds to two decimal places. The second groups thousands with commas. Both are common when showing money or statistics.</p>",
        ),
        text(
          "<h3>Lining columns up</h3><p>A width number pads the value so columns line up. <code>&lt;</code> aligns left, <code>&gt;</code> aligns right:</p>",
        ),
        py(
          'print(f"{\'Item\':<10}{\'Price\':>8}")\nprint(f"{\'Coffee\':<10}{1200:>8}")\nprint(f"{\'Tea\':<10}{800:>8}")',
        ),
        out("Item         Price\nCoffee        1200\nTea            800"),
        text(
          "<h3>Printing a real curly brace</h3><p>Double the brace when you want one in the output:</p>",
        ),
        py('print(f"Use {{braces}} like this")'),
        out("Use {braces} like this"),
        text(
          "<h3>A common mistake</h3><p>Forgetting the <code>f</code> gives you the braces as plain text:</p>",
        ),
        py('name = "Ada"\nprint("Hello, {name}")'),
        out("Hello, {name}"),
        text(
          "<p>If your output shows braces, the missing <code>f</code> is the first thing to check.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>An f-string starts with <code>f</code> before the quote.</p></li><li><p>Anything in <code>{ }</code> is worked out and converted to text automatically.</p></li><li><p><code>{value:.2f}</code> shows two decimal places; <code>{value:,}</code> groups thousands.</p></li><li><p>Width and <code>&lt;</code> or <code>&gt;</code> line up columns.</p></li><li><p>Double a brace to print one; a missing <code>f</code> prints the braces literally.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: f-strings",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What makes a string an f-string?",
            options: [
              "The letter f written before the opening quote",
              "A dollar sign before each variable",
              "Calling the format method",
              "Using triple quotes",
            ],
            correct: [0],
          },
          {
            text: 'With age = 36, what does f"I am {age}" produce?',
            options: ["I am 36", "I am {age}", "I am age", "A TypeError"],
            correct: [0],
          },
          {
            text: "Why do f-strings not need str() around numbers?",
            options: [
              "The f-string converts every value to text automatically",
              "Numbers are already strings in Python",
              "print does the conversion, not the f-string",
              "They do need str() — it is only optional in Python 3.12",
            ],
            correct: [0],
          },
          {
            text: 'What does f"{7.16666:.2f}" produce?',
            options: ["7.17", "7.16", "7.166", "7"],
            correct: [0],
          },
          {
            text: 'Your output shows Hello, {name} instead of the value. What went wrong?',
            options: [
              "The f before the opening quote is missing",
              "name was never assigned",
              "Curly braces must be doubled",
              "print cannot show variables",
            ],
            correct: [0],
          },
          {
            text: "Which are valid things to put inside the braces of an f-string?",
            options: [
              "A variable name",
              "An arithmetic expression such as price * quantity",
              "A method call such as name.title()",
              "A comment starting with #",
            ],
            correct: [0, 1, 2],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 4 Test: Working with Strings",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: 'What is len("Python")?',
        options: ["6", "5", "7", "An error, because len needs a list"],
        correct: [0],
      },
      {
        text: 'What does "programming"[3:7] give?',
        options: ["gram", "gramm", "ogra", "ramm"],
        correct: [0],
      },
      {
        text: "Which statements about strings are true?",
        options: [
          "They are immutable",
          "Indexing starts at 0",
          "Negative indices count from the end",
          "A method such as upper() changes the original string",
        ],
        correct: [0, 1, 2],
      },
      {
        text: 'What does "  hi  ".strip() return?',
        options: ['"hi"', '"  hi  "', '"hi  "', '"h i"'],
        correct: [0],
      },
      {
        text: 'With total = 1500, which produces "Cost: 1500 RWF"?',
        options: [
          'f"Cost: {total} RWF"',
          '"Cost: {total} RWF"',
          'f"Cost: total RWF"',
          '"Cost: " + total + " RWF"',
        ],
        correct: [0],
      },
      {
        text: "What does \\t insert into a string?",
        options: ["A tab", "A new line", "The letter t", "A backslash"],
        correct: [0],
      },
      {
        text: 'What is the result of ", ".join(["a", "b", "c"])?',
        options: ['"a, b, c"', "['a', 'b', 'c']", '"abc"', "A TypeError"],
        correct: [0],
      },
      {
        text: 'How would you get the file extension from "report.csv" using a slice?',
        options: [
          '"report.csv"[-3:]',
          '"report.csv"[3:]',
          '"report.csv"[:3]',
          '"report.csv"[-3]',
        ],
        correct: [0],
      },
    ],
  },
};
