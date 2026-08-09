import type { Module } from "../types";
import { text, py, sh, out } from "../types";

export const gettingStarted: Module = {
  title: "Getting Started with Python",
  lessons: [
    {
      title: "What Python Is and Why It Is Used",
      blocks: [
        text(
          "<h2>What is Python?</h2><p>Python is a general-purpose programming language. <strong>General-purpose</strong> means it is not tied to one job — the same language is used to build websites, analyse data, automate boring tasks, and train machine learning models.</p><p>It was designed to be easy to read. A Python program often looks close to plain English, which is why many schools and companies use it as a first language.</p>",
        ),
        text(
          "<h3>What people build with Python</h3><ul><li><p><strong>Web backends</strong> — the server side of a website, using tools such as Django or FastAPI.</p></li><li><p><strong>Data analysis</strong> — reading spreadsheets, cleaning numbers, drawing charts.</p></li><li><p><strong>Automation</strong> — renaming a thousand files, sending reports every morning.</p></li><li><p><strong>Machine learning</strong> — most popular AI libraries have a Python interface.</p></li><li><p><strong>Scripting</strong> — small programs that glue other programs together.</p></li></ul>",
        ),
        text(
          "<h3>Python is interpreted</h3><p>Some languages must be <strong>compiled</strong> first: a separate program translates your whole source file into machine code before you can run it. Python is <strong>interpreted</strong> instead — a program called the interpreter reads your file and runs it line by line, immediately.</p><p>In practice this means you can write two lines, run them, and see the result at once. That short feedback loop is a large part of why Python is comfortable to learn.</p>",
        ),
        text("<h3>Your first look at Python code</h3><p>Here is a complete, working Python program:</p>"),
        py('print("Hello, World!")'),
        text("<p>It produces this output:</p>"),
        out("Hello, World!"),
        text(
          "<p>That is the whole program. There is no setup code, no wrapper around it, and no semicolon at the end. <code>print</code> is a built-in function that writes something to the screen.</p>",
        ),
        text(
          "<h3>Which version to learn</h3><p>There are two large versions in the world: Python 2 and Python 3. Python 2 reached its end of life in 2020 and no longer receives fixes. <strong>This course uses Python 3</strong>, and you should too. When you see the word \"Python\" here, it means Python 3.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Python is a general-purpose, interpreted language.</p></li><li><p>It is used for web backends, data work, automation and machine learning.</p></li><li><p>Interpreted means your code runs immediately, without a separate compile step.</p></li><li><p>Always learn Python 3. Python 2 is no longer supported.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: What Python Is",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What does it mean that Python is an interpreted language?",
            options: [
              "The interpreter reads and runs the code line by line, with no separate compile step",
              "The code must be translated into machine code before it can run",
              "The code can only run inside a web browser",
              "The code is translated into another language such as C first",
            ],
            correct: [0],
          },
          {
            text: "Which version of Python should you learn today?",
            options: [
              "Python 3, because Python 2 reached its end of life in 2020",
              "Python 2, because it is more stable",
              "Either one — they are fully compatible",
              "Python 1, because it is the smallest",
            ],
            correct: [0],
          },
          {
            text: "What does the word \"general-purpose\" mean for a programming language?",
            options: [
              "It is not tied to one kind of job and can be used across many areas",
              "It can only be used for general mathematics",
              "It runs on any operating system without change",
              "It is designed only for teaching beginners",
            ],
            correct: [0],
          },
          {
            text: "Select the areas where Python is commonly used.",
            options: [
              "Web backends",
              "Data analysis",
              "Automation scripts",
              "Running as the boot loader of an operating system",
            ],
            correct: [0, 1, 2],
          },
        ],
      },
    },
    {
      title: "Installing Python on Your Computer",
      blocks: [
        text(
          "<h2>Check what you already have</h2><p>Many Mac and Linux computers already ship with Python. Before installing anything, check. Open your terminal — <strong>Command Prompt</strong> or <strong>PowerShell</strong> on Windows, <strong>Terminal</strong> on macOS and Linux — and run:</p>",
        ),
        sh("python --version"),
        text(
          "<p>If Python is installed, you will see a version number. Anything starting with <code>3.</code> is fine for this course:</p>",
        ),
        out("Python 3.12.4"),
        text(
          "<p>On some systems the command is <code>python3</code> instead, and on Windows it is sometimes <code>py</code>. Try each until one answers:</p>",
        ),
        sh("python3 --version\npy --version"),
        text(
          "<p>If none of them work, you will get a message like <code>command not found</code>. That means Python is not installed yet, or it is not on your PATH.</p>",
        ),
        text(
          "<h3>Installing on Windows</h3><ol><li><p>Go to <strong>python.org</strong> and open the Downloads page.</p></li><li><p>Download the latest Python 3 installer for Windows.</p></li><li><p>Run the installer. On the first screen, tick <strong>\"Add python.exe to PATH\"</strong> before clicking Install.</p></li><li><p>Close and reopen your terminal, then check the version again.</p></li></ol><p>That PATH checkbox matters. <strong>PATH</strong> is the list of folders your terminal searches for programs. Without it, Windows will not find the <code>python</code> command even though Python is installed.</p>",
        ),
        text(
          "<h3>Installing on macOS</h3><p>The simplest way is the official installer from python.org. If you already use Homebrew, this also works:</p>",
        ),
        sh("brew install python"),
        text(
          "<h3>Installing on Linux</h3><p>Most distributions include Python 3 already. On Debian or Ubuntu you can install or update it with:</p>",
        ),
        sh("sudo apt update\nsudo apt install python3"),
        text(
          "<h3>If the command still is not found</h3><p>Reopening the terminal is the fix most of the time — a terminal reads PATH when it starts, so a window opened before the install still has the old list. If that does not help, run the installer again and choose <strong>Modify</strong>, then make sure the PATH option is ticked.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Check first with <code>python --version</code>, <code>python3 --version</code> or <code>py --version</code>.</p></li><li><p>Any version starting with <code>3.</code> works for this course.</p></li><li><p>On Windows, tick \"Add python.exe to PATH\" during installation.</p></li><li><p>Open a new terminal after installing, so it picks up the new PATH.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Installing Python",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Which command checks the installed Python version?",
            options: [
              "python --version",
              "python -show",
              "version python",
              "python --info",
            ],
            correct: [0],
          },
          {
            text: "On Windows, why should you tick \"Add python.exe to PATH\" during installation?",
            options: [
              "PATH is the list of folders the terminal searches, so without it the python command is not found",
              "It makes Python run faster",
              "It installs extra libraries automatically",
              "It is required to use the print function",
            ],
            correct: [0],
          },
          {
            text: "You installed Python but your open terminal still says \"command not found\". What is the first thing to try?",
            options: [
              "Close the terminal and open a new one, because a terminal reads PATH when it starts",
              "Reinstall the operating system",
              "Rename python.exe to py.exe",
              "Nothing — you must use an online editor instead",
            ],
            correct: [0],
          },
          {
            text: "Which of these command names might Python answer to, depending on the system?",
            options: ["python", "python3", "py", "pythonrun"],
            correct: [0, 1, 2],
          },
        ],
      },
    },
    {
      title: "Writing and Running Your First Program",
      blocks: [
        text(
          "<h2>Python files end in .py</h2><p>A Python program is a plain text file whose name ends in <code>.py</code>. You can write it in any text editor. Most people use a code editor such as VS Code, because it colours the code and points out mistakes.</p>",
        ),
        text("<p>Create a file called <code>hello.py</code> and put one line in it:</p>"),
        py('print("Hello, World!")'),
        text(
          "<p>Save the file. Then, in your terminal, move to the folder that contains it and run it:</p>",
        ),
        sh("cd path/to/your/folder\npython hello.py"),
        text("<p>The output appears straight away:</p>"),
        out("Hello, World!"),
        text(
          "<p>You have now written and run a real program. The interpreter read your file from top to bottom and carried out each instruction.</p>",
        ),
        text(
          "<h3>Running several lines</h3><p>A file can hold as many lines as you like. They run in order, from the first line to the last:</p>",
        ),
        py(
          'print("Preparing the report")\nprint("Working...")\nprint("Report finished")',
        ),
        out("Preparing the report\nWorking...\nReport finished"),
        text(
          "<h3>The interactive shell</h3><p>For quick experiments you do not need a file at all. Type <code>python</code> on its own to open the <strong>interactive shell</strong>, also called the REPL:</p>",
        ),
        sh("python"),
        text(
          "<p>You will see a banner and the <code>&gt;&gt;&gt;</code> prompt. Anything you type there runs the moment you press Enter, and the result is printed for you:</p>",
        ),
        out('>>> print("Hello, World!")\nHello, World!\n>>> 2 + 3\n5'),
        text(
          "<p>Notice that <code>2 + 3</code> showed <code>5</code> without any <code>print</code>. The shell prints the value of whatever you type. Inside a <code>.py</code> file that does not happen — there you must use <code>print</code> to see anything.</p><p>To leave the shell, type:</p>",
        ),
        py("exit()"),
        text(
          "<h3>Which one should you use?</h3><p>Use the shell to try a single idea: what does this function return, does this line work. Use a <code>.py</code> file for anything you want to keep, repeat, or share.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Python source files end in <code>.py</code>.</p></li><li><p>Run a file with <code>python filename.py</code>.</p></li><li><p>Lines run in order, from top to bottom.</p></li><li><p>The interactive shell (<code>python</code>, then <code>&gt;&gt;&gt;</code>) runs one line at a time and prints values automatically.</p></li><li><p>Leave the shell with <code>exit()</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Running Python Code",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Which command runs a file named hello.py?",
            options: [
              "python hello.py",
              "run hello.py",
              "python run hello.py",
              "hello.py python",
            ],
            correct: [0],
          },
          {
            text: "In the interactive shell you type 2 + 3 and press Enter. What happens?",
            options: [
              "It prints 5, because the shell prints the value of what you type",
              "Nothing, because there is no print call",
              "It raises an error",
              "It saves 5 into a file",
            ],
            correct: [0],
          },
          {
            text: "Inside a .py file, you write the line 2 + 3 on its own. What do you see?",
            options: [
              "Nothing — a file only shows what you print",
              "5",
              "An error message",
              "The number 5 is written to a new file",
            ],
            correct: [0],
          },
          {
            text: "How do you leave the Python interactive shell?",
            options: ["exit()", "quit now", "close()", "stop()"],
            correct: [0],
          },
          {
            text: "In what order does Python run the lines of a file?",
            options: [
              "From the first line to the last",
              "From the last line to the first",
              "In a random order",
              "Only lines containing print are run",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Using print to Show Output",
      blocks: [
        text(
          "<h2>print is how your program talks to you</h2><p>A program that calculates something but never shows it is not useful while you are learning. <code>print</code> is the built-in function that writes values to the screen.</p><p>You give it something to show inside the brackets:</p>",
        ),
        py('print("Learning Python")'),
        out("Learning Python"),
        text(
          "<h3>Printing more than one thing</h3><p>Put several values inside the brackets, separated by commas. Python prints them in order, with a single space between each:</p>",
        ),
        py('print("Score:", 42)'),
        out("Score: 42"),
        text(
          "<p>You did not have to add that space yourself — <code>print</code> puts one between each value it receives.</p>",
        ),
        py('print("Python", "is", "fun")'),
        out("Python is fun"),
        text(
          "<h3>Changing the separator</h3><p>If a space is not what you want, pass <code>sep</code>:</p>",
        ),
        py('print("2026", "08", "09", sep="-")'),
        out("2026-08-09"),
        text(
          "<h3>Changing what comes at the end</h3><p>By default <code>print</code> moves to a new line when it finishes. That behaviour comes from <code>end</code>, which is a newline character unless you say otherwise:</p>",
        ),
        py('print("Loading", end="")\nprint("...")'),
        out("Loading..."),
        text(
          "<p>Both calls wrote to the same line, because the first one was told to end with nothing instead of a newline.</p>",
        ),
        text(
          "<h3>An empty line</h3><p>Calling <code>print</code> with nothing inside the brackets prints just a blank line. It is a simple way to space out your output:</p>",
        ),
        py('print("First section")\nprint()\nprint("Second section")'),
        out("First section\n\nSecond section"),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>print(value)</code> writes a value to the screen.</p></li><li><p>Several values separated by commas are printed with a space between them.</p></li><li><p><code>sep=\"-\"</code> changes the text placed between the values.</p></li><li><p><code>end=\"\"</code> stops <code>print</code> from moving to a new line.</p></li><li><p><code>print()</code> on its own prints an empty line.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Using print",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: 'What does print("A", "B") show?',
            options: ["A B", "AB", "A,B", "A\nB"],
            correct: [0],
          },
          {
            text: 'What does print("a", "b", sep="") show?',
            options: ["ab", "a b", "a,b", "asepb"],
            correct: [0],
          },
          {
            text: 'What is printed by: print("X", end="") followed by print("Y")?',
            options: ["XY on one line", "X and Y on two lines", "X only", "Y only"],
            correct: [0],
          },
          {
            text: "What does calling print() with empty brackets do?",
            options: [
              "Prints an empty line",
              "Raises an error",
              "Prints the word None",
              "Does nothing at all",
            ],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 1 Test: Getting Started with Python",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "Python is described as interpreted. What does that mean in practice?",
        options: [
          "Your code runs immediately, without a separate compile step",
          "Your code must be compiled to an .exe before it runs",
          "Your code only runs inside a browser",
          "Your code is checked for errors but never executed",
        ],
        correct: [0],
      },
      {
        text: "Which file name is a valid Python program file?",
        options: ["report.py", "report.python", "report.pt", "report.p3"],
        correct: [0],
      },
      {
        text: "You run python hello.py and get \"command not found\". Which explanations are possible?",
        options: [
          "Python is not installed",
          "Python is installed but not on PATH",
          "The terminal was opened before the install finished",
          "The file hello.py contains a syntax error",
        ],
        correct: [0, 1, 2],
      },
      {
        text: 'What is the output of print("Total:", 10)?',
        options: ["Total: 10", "Total:10", "Total: , 10", "Total 10"],
        correct: [0],
      },
      {
        text: "Which statement about the interactive shell is true?",
        options: [
          "It prints the value of an expression without needing print",
          "It cannot run any code, only check syntax",
          "It requires a .py file to start",
          "It runs the whole file at once and then exits",
        ],
        correct: [0],
      },
      {
        text: 'Which call prints 1-2-3?',
        options: [
          'print(1, 2, 3, sep="-")',
          'print(1, 2, 3, end="-")',
          "print(1-2-3)",
          'print(1, 2, 3, sep=" ")',
        ],
        correct: [0],
      },
      {
        text: "Why should you learn Python 3 rather than Python 2?",
        options: [
          "Python 2 reached its end of life in 2020 and gets no more fixes",
          "Python 2 cannot print anything",
          "Python 3 is the only version that runs on Windows",
          "Python 2 was never released to the public",
        ],
        correct: [0],
      },
      {
        text: "Which of these are things print can control through its arguments?",
        options: [
          "The text placed between values, using sep",
          "The text placed at the end, using end",
          "The colour of the terminal text",
          "The font size of the output",
        ],
        correct: [0, 1],
      },
    ],
  },
};
