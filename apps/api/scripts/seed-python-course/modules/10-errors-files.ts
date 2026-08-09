import type { Module } from "../types";
import { text, py, sh, out } from "../types";

export const errorsAndFiles: Module = {
  title: "Errors, Files and Modules",
  lessons: [
    {
      title: "Understanding Error Messages",
      blocks: [
        text(
          "<h2>Errors are information, not failure</h2><p>Every Python error tells you three things: what kind of problem it is, where it happened, and what the interpreter was doing at the time. Reading that message properly is the fastest debugging skill you can learn.</p>",
        ),
        text("<p>Here is a full error, exactly as Python prints it:</p>"),
        out(
          'Traceback (most recent call last):\n  File "report.py", line 8, in <module>\n    total = price * quantity\n            ~~~~~~^~~~~~~~~~\nTypeError: can\'t multiply sequence by non-int of type \'str\'',
        ),
        text(
          "<p>Read it from the <strong>bottom up</strong>:</p><ol><li><p>The last line is the error type and message. That is the actual problem.</p></li><li><p>Above it, the file name and line number tell you where.</p></li><li><p>The line of code is shown, often with marks under the exact part that failed.</p></li></ol><p>The word <strong>Traceback</strong> means the list of calls that led there. When functions call functions, the deepest one is at the bottom.</p>",
        ),
        text(
          "<h3>The errors you will meet most</h3><p><strong>SyntaxError</strong> — Python could not understand the code. Nothing ran at all. Usually a missing colon, bracket or quote:</p>",
        ),
        py('if age > 18\n    print("ok")'),
        out("SyntaxError: expected ':'"),
        text(
          "<p><strong>NameError</strong> — a name was used before it was given a value. Usually a typo, or the assignment is further down the file:</p>",
        ),
        py("print(totl)"),
        out("NameError: name 'totl' is not defined"),
        text(
          "<p><strong>TypeError</strong> — the operation does not fit the types:</p>",
        ),
        py('print("age: " + 36)'),
        out('TypeError: can only concatenate str (not "int") to str'),
        text(
          "<p><strong>ValueError</strong> — the type was right, the content was not:</p>",
        ),
        py('int("hello")'),
        out("ValueError: invalid literal for int() with base 10: 'hello'"),
        text(
          "<p><strong>IndexError</strong> and <strong>KeyError</strong> — you asked for a position or a key that is not there:</p>",
        ),
        py('names = ["Ada"]\nprint(names[5])'),
        out("IndexError: list index out of range"),
        text(
          "<p><strong>ZeroDivisionError</strong> and <strong>IndentationError</strong> complete the common set. You have seen both already.</p>",
        ),
        text(
          "<h3>The line number is where Python noticed</h3><p>It is not always where the mistake is. A missing closing bracket is often reported on the <em>next</em> line, because Python kept reading, expecting the bracket to arrive:</p>",
        ),
        py('total = (price * quantity\nprint(total)'),
        out(
          "SyntaxError: '(' was never closed",
        ),
        text(
          "<p>When a syntax error makes no sense on the line reported, look at the line above it.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Read a traceback from the bottom: type, message, then location.</p></li><li><p><code>SyntaxError</code> means nothing ran.</p></li><li><p><code>NameError</code> is usually a typo; <code>TypeError</code> is a type mismatch; <code>ValueError</code> is bad content.</p></li><li><p><code>IndexError</code> and <code>KeyError</code> mean the position or key is missing.</p></li><li><p>The reported line is where Python noticed, not always where you erred.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Reading Errors",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Which part of a traceback states the actual problem?",
            options: [
              "The last line — the error type and message",
              "The first line",
              "The line saying Traceback",
              "The file name",
            ],
            correct: [0],
          },
          {
            text: "Which error means Python could not understand the code and ran nothing?",
            options: ["SyntaxError", "TypeError", "ValueError", "NameError"],
            correct: [0],
          },
          {
            text: 'What error does int("hello") raise?',
            options: ["ValueError", "TypeError", "NameError", "SyntaxError"],
            correct: [0],
          },
          {
            text: "You get a NameError. What is the most likely cause?",
            options: [
              "A typo in the name, or the assignment comes later in the file",
              "The value is the wrong type",
              "A missing colon",
              "Dividing by zero",
            ],
            correct: [0],
          },
          {
            text: "A SyntaxError points at a line that looks correct. What should you check?",
            options: [
              "The line above, for an unclosed bracket or quote",
              "The last line of the file",
              "The indentation of the whole file",
              "Nothing — the message is always exact",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Handling Errors with try and except",
      blocks: [
        text(
          "<h2>Catching a problem instead of crashing</h2><p>Some errors you cannot prevent. A user types letters where a number belongs; a file is missing. <code>try</code> and <code>except</code> let the program deal with it and carry on.</p>",
        ),
        py(
          'try:\n    age = int(input("Your age: "))\n    print("Next year you will be", age + 1)\nexcept ValueError:\n    print("That is not a whole number")\n\nprint("Program continues")',
        ),
        out(
          "Your age: thirty\nThat is not a whole number\nProgram continues",
        ),
        text(
          "<p>Python runs the <code>try</code> block. If an error of the named type happens, it jumps to the <code>except</code> block. The program does not stop.</p><p>If nothing goes wrong, the <code>except</code> block is skipped entirely.</p>",
        ),
        text(
          "<h3>Catching different problems differently</h3><p>You can have several <code>except</code> blocks. The first matching one runs:</p>",
        ),
        py(
          'try:\n    numerator = int(input("Numerator: "))\n    denominator = int(input("Denominator: "))\n    print(numerator / denominator)\nexcept ValueError:\n    print("Please type whole numbers only")\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")',
        ),
        out("Numerator: 10\nDenominator: 0\nCannot divide by zero"),
        text(
          "<h3>Do not catch everything</h3><p>A bare <code>except</code> catches every error, including the bugs you want to know about:</p>",
        ),
        py(
          'try:\n    result = int(input("Number: "))\n    print(reslt)\nexcept:\n    print("Something went wrong")',
        ),
        out("Number: 5\nSomething went wrong"),
        text(
          "<p>The real problem was a typo — <code>reslt</code> instead of <code>result</code> — and the message hid it completely. Always name the errors you expect. If you must catch broadly, catch <code>Exception</code> and print the detail:</p>",
        ),
        py(
          'try:\n    value = int("abc")\nexcept Exception as error:\n    print("Failed:", error)',
        ),
        out(
          "Failed: invalid literal for int() with base 10: 'abc'",
        ),
        text(
          "<p><code>as error</code> gives you the error object so you can show or log what actually happened.</p>",
        ),
        text(
          "<h3>else and finally</h3><p><code>else</code> runs when the <code>try</code> block finished with no error. <code>finally</code> runs either way, which makes it the place for cleaning up:</p>",
        ),
        py(
          'try:\n    number = int("42")\nexcept ValueError:\n    print("Bad input")\nelse:\n    print("Worked:", number)\nfinally:\n    print("This always runs")',
        ),
        out("Worked: 42\nThis always runs"),
        text(
          "<h3>A retry loop</h3><p>Combining <code>try</code> with <code>while</code> gives the standard way to insist on valid input:</p>",
        ),
        py(
          'while True:\n    try:\n        age = int(input("Your age: "))\n        break\n    except ValueError:\n        print("Please type a whole number")\n\nprint("Thank you, age recorded as", age)',
        ),
        out(
          "Your age: thirty\nPlease type a whole number\nYour age: 34\nThank you, age recorded as 34",
        ),
        text(
          "<p>The <code>break</code> is inside the <code>try</code>, after the conversion. It is only reached when the conversion worked.</p>",
        ),
        text(
          "<h3>Raising your own errors</h3><p><code>raise</code> reports a problem the caller must handle:</p>",
        ),
        py(
          'def set_age(age):\n    if age < 0:\n        raise ValueError("Age cannot be negative")\n    return age\n\ntry:\n    set_age(-5)\nexcept ValueError as error:\n    print("Rejected:", error)',
        ),
        out("Rejected: Age cannot be negative"),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>try</code> runs risky code; <code>except TypeName</code> handles that error.</p></li><li><p>Several <code>except</code> blocks can handle different errors.</p></li><li><p>Never use a bare <code>except</code> — it hides real bugs.</p></li><li><p><code>as error</code> gives access to the message.</p></li><li><p><code>else</code> runs on success, <code>finally</code> always runs.</p></li><li><p><code>raise</code> reports an error from your own code.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: try and except",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What happens when no error occurs inside a try block?",
            options: [
              "The except block is skipped",
              "The except block runs anyway",
              "The program stops",
              "The try block runs twice",
            ],
            correct: [0],
          },
          {
            text: "Why is a bare except: dangerous?",
            options: [
              "It catches every error, including bugs such as typos, and hides them",
              "It is invalid syntax",
              "It only catches ValueError",
              "It stops the program immediately",
            ],
            correct: [0],
          },
          {
            text: "What does as error give you?",
            options: [
              "The error object, so you can show or log the message",
              "A copy of the try block",
              "The line number only",
              "A boolean saying whether an error happened",
            ],
            correct: [0],
          },
          {
            text: "When does a finally block run?",
            options: [
              "Always — whether or not an error happened",
              "Only when an error happened",
              "Only when no error happened",
              "Only if there is no except block",
            ],
            correct: [0],
          },
          {
            text: "In a retry loop, where should break go?",
            options: [
              "Inside the try, after the risky line, so it is only reached on success",
              "Inside the except block",
              "Before the try block",
              "In a finally block",
            ],
            correct: [0],
          },
          {
            text: "What does raise do?",
            options: [
              "Reports an error from your own code for the caller to handle",
              "Catches an error",
              "Restarts the program",
              "Prints a warning and continues",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Reading and Writing Files",
      blocks: [
        text(
          "<h2>Keeping data after the program ends</h2><p>Variables disappear when a program stops. A file keeps the data on disk.</p><p>Always open a file with <code>with</code>. It closes the file for you, even if an error happens partway through:</p>",
        ),
        py(
          'with open("notes.txt", "w") as file:\n    file.write("First line\\n")\n    file.write("Second line\\n")',
        ),
        text(
          "<p>Two things to notice. The second argument is the <strong>mode</strong>, and <code>write</code> does not add a line break — you write <code>\\n</code> yourself.</p>",
        ),
        text(
          "<h3>The modes</h3><ul><li><p><code>\"r\"</code> read. The default. Fails if the file does not exist.</p></li><li><p><code>\"w\"</code> write. Creates the file, and <strong>erases everything</strong> if it already exists.</p></li><li><p><code>\"a\"</code> append. Adds to the end, keeping what is there.</p></li></ul><p>The difference between <code>\"w\"</code> and <code>\"a\"</code> matters. Opening an important file with <code>\"w\"</code> empties it immediately, before you write anything.</p>",
        ),
        text("<h3>Reading a whole file</h3>"),
        py(
          'with open("notes.txt", "r") as file:\n    content = file.read()\n\nprint(content)',
        ),
        out("First line\nSecond line"),
        text(
          "<h3>Reading line by line</h3><p>For a large file, read one line at a time instead of loading it all into memory:</p>",
        ),
        py(
          'with open("notes.txt", "r") as file:\n    for line in file:\n        print(line.strip())',
        ),
        out("First line\nSecond line"),
        text(
          "<p><code>strip()</code> is there because each line still carries its <code>\\n</code> at the end. Without it, <code>print</code> adds a second line break and the output is double spaced.</p>",
        ),
        text(
          "<p><code>readlines</code> gives every line as a list, when you do need them all at once:</p>",
        ),
        py(
          'with open("notes.txt", "r") as file:\n    lines = file.readlines()\n\nprint(len(lines))\nprint(lines[0].strip())',
        ),
        out("2\nFirst line"),
        text(
          "<h3>Appending</h3>",
        ),
        py(
          'with open("notes.txt", "a") as file:\n    file.write("Third line\\n")\n\nwith open("notes.txt", "r") as file:\n    print(file.read())',
        ),
        out("First line\nSecond line\nThird line"),
        text(
          "<h3>When the file is not there</h3><p>Reading a missing file raises <code>FileNotFoundError</code>. Catch it:</p>",
        ),
        py(
          'try:\n    with open("missing.txt", "r") as file:\n        print(file.read())\nexcept FileNotFoundError:\n    print("That file does not exist")',
        ),
        out("That file does not exist"),
        text(
          "<h3>Why with matters</h3><p>You can open a file without it, but then you must close it yourself, and an error in between means it never gets closed:</p>",
        ),
        py(
          'file = open("notes.txt", "r")\ncontent = file.read()\nfile.close()',
        ),
        text(
          "<p>The <code>with</code> version does the closing automatically. Use it every time.</p>",
        ),
        text(
          "<h3>A complete example</h3><p>Reading numbers from a file, ignoring blank and broken lines:</p>",
        ),
        py(
          'total = 0\ncount = 0\n\ntry:\n    with open("scores.txt", "r") as file:\n        for line in file:\n            line = line.strip()\n            if not line:\n                continue\n            try:\n                total += int(line)\n                count += 1\n            except ValueError:\n                print("Skipping bad line:", line)\nexcept FileNotFoundError:\n    print("scores.txt was not found")\nelse:\n    if count:\n        print(f"Average of {count} scores: {total / count:.1f}")',
        ),
        out(
          "Skipping bad line: unknown\nAverage of 3 scores: 74.3",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Use <code>with open(name, mode) as file:</code> — it closes the file for you.</p></li><li><p><code>\"r\"</code> read, <code>\"w\"</code> write and erase, <code>\"a\"</code> append.</p></li><li><p><code>write</code> does not add a line break; add <code>\\n</code> yourself.</p></li><li><p>Loop over the file object to read one line at a time; <code>strip()</code> the line break.</p></li><li><p>A missing file raises <code>FileNotFoundError</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Files",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Why should you use with open(...) rather than open(...)?",
            options: [
              "It closes the file automatically, even if an error happens",
              "It reads the file faster",
              "It is the only way to write to a file",
              "It prevents FileNotFoundError",
            ],
            correct: [0],
          },
          {
            text: 'What does mode "w" do to a file that already exists?',
            options: [
              "Erases everything in it",
              "Adds to the end of it",
              "Raises an error",
              "Opens it for reading only",
            ],
            correct: [0],
          },
          {
            text: "Which mode adds to the end of a file without erasing it?",
            options: ['"a"', '"w"', '"r"', '"x"'],
            correct: [0],
          },
          {
            text: "Why call strip() on each line when looping over a file?",
            options: [
              "Each line still carries its newline character at the end",
              "It converts the line to a number",
              "It removes the line from the file",
              "It is required to read the next line",
            ],
            correct: [0],
          },
          {
            text: "What error is raised when reading a file that does not exist?",
            options: [
              "FileNotFoundError",
              "ValueError",
              "IOErrorMissing",
              "KeyError",
            ],
            correct: [0],
          },
          {
            text: "Does file.write() add a line break at the end?",
            options: [
              "No — you must write \\n yourself",
              "Yes, always",
              "Only in append mode",
              "Only when writing numbers",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Modules and Where to Go Next",
      blocks: [
        text(
          "<h2>Using code other people wrote</h2><p>A <strong>module</strong> is a file of Python code you can use in your own program. Python ships with a large set of them, called the <strong>standard library</strong>. <code>import</code> brings one in:</p>",
        ),
        py(
          "import math\n\nprint(math.sqrt(16))\nprint(math.pi)\nprint(math.ceil(4.1))",
        ),
        out("4.0\n3.141592653589793\n5"),
        text(
          "<p>After <code>import math</code>, everything inside is reached with <code>math.</code> in front. That prefix tells the reader where the function came from.</p>",
        ),
        text(
          "<h3>Importing only what you need</h3><p><code>from</code> brings specific names in directly, without the prefix:</p>",
        ),
        py("from math import sqrt, pi\n\nprint(sqrt(25))\nprint(pi)"),
        out("5.0\n3.141592653589793"),
        text(
          "<p>You can also rename on import, which is common for long module names:</p>",
        ),
        py("import datetime as dt\n\ntoday = dt.date.today()\nprint(today.year)"),
        out("2026"),
        text(
          "<p>Avoid <code>from math import *</code>. It imports every name at once, and you can no longer tell where anything came from — or notice when it quietly replaces one of your own names.</p>",
        ),
        text(
          "<h3>Modules worth knowing early</h3><ul><li><p><code>math</code> — square roots, rounding, constants.</p></li><li><p><code>random</code> — random numbers and choices.</p></li><li><p><code>datetime</code> — dates and times.</p></li><li><p><code>os</code> and <code>pathlib</code> — files and folders.</p></li><li><p><code>json</code> — reading and writing JSON data.</p></li></ul>",
        ),
        py(
          'import random\n\nprint(random.randint(1, 6))\nprint(random.choice(["Ada", "Alan", "Grace"]))',
        ),
        out("4\nGrace"),
        text(
          "<h3>Your own files are modules too</h3><p>Any <code>.py</code> file can be imported by another in the same folder. If <code>helpers.py</code> contains:</p>",
        ),
        py(
          'def format_money(amount):\n    return f"{amount:,.0f} RWF"',
        ),
        text("<p>then another file can use it:</p>"),
        py("import helpers\n\nprint(helpers.format_money(45000))"),
        out("45,000 RWF"),
        text(
          "<p>This is how programs grow past one file: related functions move into their own module with a name that says what they are for.</p>",
        ),
        text(
          "<h3>Installing packages other people published</h3><p>Beyond the standard library there are hundreds of thousands of packages. <code>pip</code> installs them:</p>",
        ),
        sh("pip install requests"),
        text(
          "<p>Then use it like any other module. Before installing into a real project, learn about <strong>virtual environments</strong> — a per-project folder of packages, so two projects can use different versions without clashing:</p>",
        ),
        sh(
          "python -m venv .venv\n\n# Windows\n.venv\\Scripts\\activate\n\n# macOS and Linux\nsource .venv/bin/activate",
        ),
        text(
          "<h3>What you have learned</h3><p>Over ten modules you covered: running Python, syntax and indentation, variables and types, strings, operators and input, conditions, loops, the four collection types, functions, errors, files and modules. That is the whole core of the language. Every Python program you meet is built from these pieces.</p>",
        ),
        text(
          "<h3>Where to go next</h3><ol><li><p><strong>Build something small and real.</strong> A program that reads a file of expenses and prints a summary will teach you more than another tutorial.</p></li><li><p><strong>Object-oriented programming</strong> — classes and objects, for organising larger programs.</p></li><li><p><strong>Testing</strong> — <code>pytest</code>, so you can change code without fear.</p></li><li><p><strong>Then pick a direction:</strong> web with Django or FastAPI, data with pandas, or automation with the file and network modules.</p></li></ol><p>The habit that matters most: read the error message, change one thing, run it again.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>import module</code> then use <code>module.name</code>; <code>from module import name</code> imports directly.</p></li><li><p><code>import x as y</code> renames; avoid <code>import *</code>.</p></li><li><p>The standard library includes <code>math</code>, <code>random</code>, <code>datetime</code>, <code>os</code>, <code>json</code>.</p></li><li><p>Your own <code>.py</code> files can be imported as modules.</p></li><li><p><code>pip install</code> adds published packages; use a virtual environment per project.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Modules",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "After import math, how do you call its sqrt function?",
            options: ["math.sqrt(16)", "sqrt(16)", "math->sqrt(16)", "import.sqrt(16)"],
            correct: [0],
          },
          {
            text: "What does from math import sqrt allow?",
            options: [
              "Calling sqrt directly, without the math prefix",
              "Importing the whole module under a new name",
              "Installing the math package",
              "Nothing — this is invalid",
            ],
            correct: [0],
          },
          {
            text: "Why avoid from math import * ?",
            options: [
              "You lose track of where names came from, and they can replace your own names",
              "It is invalid syntax",
              "It is much slower to run",
              "It only imports half the module",
            ],
            correct: [0],
          },
          {
            text: "Can you import one of your own .py files?",
            options: [
              "Yes — any .py file in the same folder can be imported as a module",
              "No, only standard library modules can be imported",
              "Only if it is named main.py",
              "Only after installing it with pip",
            ],
            correct: [0],
          },
          {
            text: "What is a virtual environment for?",
            options: [
              "Keeping each project's packages separate, so versions do not clash",
              "Running Python faster",
              "Storing your source files online",
              "Replacing the need for pip",
            ],
            correct: [0],
          },
          {
            text: "Which command installs a published package?",
            options: [
              "pip install requests",
              "python install requests",
              "import requests --install",
              "pip get requests",
            ],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 10 Test: Errors, Files and Modules",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "In what order should you read a traceback?",
        options: [
          "From the bottom up — the last line names the actual error",
          "From the top down",
          "Only the first line matters",
          "Only the file name matters",
        ],
        correct: [0],
      },
      {
        text: "Which error type means the content was wrong although the type was right?",
        options: ["ValueError", "TypeError", "NameError", "SyntaxError"],
        correct: [0],
      },
      {
        text: "Which statements about try / except are true?",
        options: [
          "The except block is skipped when no error happens",
          "Several except blocks can handle different error types",
          "finally runs whether or not an error happened",
          "A bare except: is the safest option",
        ],
        correct: [0, 1, 2],
      },
      {
        text: 'You open an existing file with mode "w". What happens to its contents?',
        options: [
          "They are erased immediately",
          "They are kept and new text is added to the end",
          "The file is opened read-only",
          "A FileExistsError is raised",
        ],
        correct: [0],
      },
      {
        text: "Which mode should you use to add lines to a log file?",
        options: ['"a"', '"w"', '"r"', '"rw"'],
        correct: [0],
      },
      {
        text: "What is the main benefit of with open(...) as file:?",
        options: [
          "The file is closed automatically, even when an error happens",
          "It reads the whole file into a list",
          "It creates the file if it is missing in read mode",
          "It removes the need for a mode argument",
        ],
        correct: [0],
      },
      {
        text: "What does raise ValueError(\"Age cannot be negative\") do?",
        options: [
          "Reports an error from your code, which a caller can catch",
          "Catches a ValueError",
          "Prints a warning and continues",
          "Ends the program with no message",
        ],
        correct: [0],
      },
      {
        text: "What does import datetime as dt do?",
        options: [
          "Imports the datetime module and lets you refer to it as dt",
          "Imports only the dt function from datetime",
          "Renames the module permanently on disk",
          "Installs the datetime package",
        ],
        correct: [0],
      },
    ],
  },
};
