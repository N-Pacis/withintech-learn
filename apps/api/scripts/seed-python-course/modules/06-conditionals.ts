import type { Module } from "../types";
import { text, py, out } from "../types";

export const conditionals: Module = {
  title: "Making Decisions with if",
  lessons: [
    {
      title: "The if Statement",
      blocks: [
        text(
          "<h2>Running code only sometimes</h2><p>Everything so far ran every line, every time. An <code>if</code> statement runs a block <strong>only when a condition is true</strong>.</p><p>The shape is always the same: the word <code>if</code>, a condition, a colon, then an indented block.</p>",
        ),
        py('age = 20\n\nif age >= 18:\n    print("You may enter")'),
        out("You may enter"),
        text(
          "<p>Change the age and the block is skipped entirely — the program simply carries on:</p>",
        ),
        py(
          'age = 15\n\nif age >= 18:\n    print("You may enter")\n\nprint("Program finished")',
        ),
        out("Program finished"),
        text(
          "<h3>The three parts</h3><ol><li><p><strong>The condition</strong> — anything that gives True or False, such as <code>age &gt;= 18</code>.</p></li><li><p><strong>The colon</strong> — announces the block. Forgetting it is a <code>SyntaxError</code>.</p></li><li><p><strong>The indented block</strong> — every line indented by the same amount belongs to the <code>if</code>.</p></li></ol>",
        ),
        text(
          "<h3>The block can have many lines</h3><p>All of them run together, or none of them do:</p>",
        ),
        py(
          'balance = 5000\n\nif balance > 0:\n    print("Account is active")\n    print("Balance:", balance)\n    print("Thank you")\n\nprint("Done")',
        ),
        out("Account is active\nBalance: 5000\nThank you\nDone"),
        text(
          "<p>The final <code>print</code> is not indented, so it is outside the <code>if</code> and always runs.</p>",
        ),
        text(
          "<h3>Any value can be a condition</h3><p>The condition does not have to be a comparison. Python treats empty and zero values as False, and everything else as True:</p>",
        ),
        py(
          'items = []\n\nif items:\n    print("There are items")\n\nname = "Ada"\n\nif name:\n    print("Name is set")',
        ),
        out("Name is set"),
        text(
          "<h3>Two mistakes to avoid</h3><p>Forgetting the colon:</p>",
        ),
        py('age = 20\nif age >= 18\n    print("ok")'),
        out("SyntaxError: expected ':'"),
        text("<p>And forgetting to indent:</p>"),
        py('age = 20\nif age >= 18:\nprint("ok")'),
        out(
          "IndentationError: expected an indented block after 'if' statement on line 2",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>if condition:</code> runs the indented block only when the condition is true.</p></li><li><p>The colon and the indentation are both required.</p></li><li><p>Every line at the same indentation belongs to the block.</p></li><li><p>Code after the block, at the outer level, always runs.</p></li><li><p>Any value works as a condition; empty and zero values are false.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: The if Statement",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What runs the indented block of an if statement?",
            options: [
              "The condition being true",
              "The condition being false",
              "It always runs",
              "It never runs unless there is an else",
            ],
            correct: [0],
          },
          {
            text: "What must come at the end of the if line?",
            options: ["A colon", "A semicolon", "A full stop", "An opening brace"],
            correct: [0],
          },
          {
            text: "What error do you get from an if line with a colon but no indented line under it?",
            options: ["IndentationError", "SyntaxError", "TypeError", "NameError"],
            correct: [0],
          },
          {
            text: "A print line after the if block is NOT indented. When does it run?",
            options: [
              "Always, because it is outside the block",
              "Only when the condition is true",
              "Only when the condition is false",
              "Never",
            ],
            correct: [0],
          },
          {
            text: "With items = [], what does if items: do?",
            options: [
              "Skips the block, because an empty list is falsy",
              "Runs the block, because the variable exists",
              "Raises a TypeError",
              "Raises a NameError",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "else and elif",
      blocks: [
        text(
          "<h2>Doing something else instead</h2><p><code>else</code> gives a block that runs when the condition was false. Exactly one of the two blocks runs — never both, never neither:</p>",
        ),
        py(
          'age = 15\n\nif age >= 18:\n    print("You may enter")\nelse:\n    print("You are too young")',
        ),
        out("You are too young"),
        text(
          "<p><code>else</code> has no condition of its own. It is the catch-all for everything the <code>if</code> did not match, so it takes only a colon.</p>",
        ),
        text(
          "<h3>More than two paths: elif</h3><p><code>elif</code> is short for \"else if\". It adds another condition, tested only when the ones above it failed:</p>",
        ),
        py(
          'score = 75\n\nif score >= 80:\n    print("Grade A")\nelif score >= 70:\n    print("Grade B")\nelif score >= 60:\n    print("Grade C")\nelse:\n    print("Fail")',
        ),
        out("Grade B"),
        text(
          "<h3>Order matters, and only the first match wins</h3><p>Python checks the conditions from top to bottom and stops at the first one that is true. Everything below is skipped, even if it would also be true.</p><p>That is why this version is broken:</p>",
        ),
        py(
          'score = 95\n\nif score >= 60:\n    print("Grade C")\nelif score >= 70:\n    print("Grade B")\nelif score >= 80:\n    print("Grade A")',
        ),
        out("Grade C"),
        text(
          "<p>A score of 95 is indeed at least 60, so the first branch matched and the rest were never tested. When your conditions overlap, put the <strong>most specific first</strong> — here, the highest boundary.</p>",
        ),
        text(
          "<h3>elif is not the same as several ifs</h3><p>Separate <code>if</code> statements are each tested independently, so more than one can run:</p>",
        ),
        py(
          'score = 95\n\nif score >= 60:\n    print("At least 60")\nif score >= 70:\n    print("At least 70")\nif score >= 80:\n    print("At least 80")',
        ),
        out("At least 60\nAt least 70\nAt least 80"),
        text(
          "<p>All three ran. With <code>elif</code>, only the first would have. Choose <code>elif</code> when the cases are alternatives, and separate <code>if</code> statements when each is a genuinely separate question.</p>",
        ),
        text(
          "<h3>else is optional</h3><p>You can use <code>elif</code> without a final <code>else</code>. Then it is possible that nothing runs at all:</p>",
        ),
        py(
          'day = "Wednesday"\n\nif day == "Saturday":\n    print("Weekend")\nelif day == "Sunday":\n    print("Weekend")\n\nprint("Checked")',
        ),
        out("Checked"),
        text(
          "<p>Adding an <code>else</code> is usually a good habit. It forces you to think about the case you did not plan for.</p>",
        ),
        text(
          "<h3>A complete example</h3>",
        ),
        py(
          'temperature = 28\n\nif temperature < 0:\n    print("Freezing")\nelif temperature < 15:\n    print("Cold")\nelif temperature < 25:\n    print("Mild")\nelif temperature < 35:\n    print("Warm")\nelse:\n    print("Hot")',
        ),
        out("Warm"),
        text(
          "<p>Here the conditions are checked in increasing order and each one only needs to rule out the range below it, which keeps them short.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>else</code> runs when the <code>if</code> was false. It takes no condition.</p></li><li><p><code>elif</code> adds another condition, tested only if the ones above failed.</p></li><li><p>Only the first matching branch runs in an if/elif/else chain.</p></li><li><p>Put the most specific condition first when ranges overlap.</p></li><li><p>Separate <code>if</code> statements are independent — several can run.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: else and elif",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "How many branches of an if / elif / else chain can run?",
            options: [
              "Exactly one — the first that matches",
              "All that match",
              "Always two",
              "None, unless else is present",
            ],
            correct: [0],
          },
          {
            text: "Does else take a condition?",
            options: [
              "No — it only takes a colon",
              "Yes, the same condition as the if",
              "Yes, it must be the opposite condition",
              "Only when it follows an elif",
            ],
            correct: [0],
          },
          {
            text: 'With score = 95 and the chain "if score >= 60 ... elif score >= 80", what is printed?',
            options: [
              "The first branch, because 95 is also at least 60 and the rest are skipped",
              "The branch for 80",
              "Both branches",
              "Nothing",
            ],
            correct: [0],
          },
          {
            text: "What is the difference between elif and a second if statement?",
            options: [
              "elif is only tested if the branches above failed; a separate if is always tested",
              "There is no difference",
              "elif is faster but otherwise identical",
              "A second if can only appear at the end",
            ],
            correct: [0],
          },
          {
            text: "When ranges overlap, which condition should come first?",
            options: [
              "The most specific one",
              "The most general one",
              "The shortest one to type",
              "The order never matters",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Nested Conditions and Combining Tests",
      blocks: [
        text(
          "<h2>An if inside an if</h2><p>A block can contain another <code>if</code>. The inner one is only reached when the outer condition was true. Each level adds four more spaces of indentation:</p>",
        ),
        py(
          'age = 25\nhas_ticket = True\n\nif age >= 18:\n    print("Age check passed")\n    if has_ticket:\n        print("Welcome in")\n    else:\n        print("Please buy a ticket")\nelse:\n    print("Too young to enter")',
        ),
        out("Age check passed\nWelcome in"),
        text(
          "<p>Read the indentation to see the structure: the inner <code>if</code> and its <code>else</code> are inside the outer <code>if</code> block, so they are never reached when the age check fails.</p>",
        ),
        text(
          "<h3>Nesting or and?</h3><p>When the inner branch has no <code>else</code> of its own, nesting and <code>and</code> do the same job:</p>",
        ),
        py(
          'age = 25\nhas_ticket = True\n\nif age >= 18:\n    if has_ticket:\n        print("Welcome in")',
        ),
        text("<p>is the same as:</p>"),
        py(
          'age = 25\nhas_ticket = True\n\nif age >= 18 and has_ticket:\n    print("Welcome in")',
        ),
        out("Welcome in"),
        text(
          "<p>Prefer the <code>and</code> version. It is shorter and flatter, and deep nesting quickly becomes hard to follow. Use real nesting when the inner test needs its own <code>else</code>, as in the first example — there the two failures need different messages.</p>",
        ),
        text(
          "<h3>Keeping the nesting shallow</h3><p>A long chain of nested checks can often be turned inside out. Instead of this:</p>",
        ),
        py(
          'username = "ada"\npassword = "secret"\n\nif username != "":\n    if password != "":\n        if len(password) >= 6:\n            print("Login accepted")\n        else:\n            print("Password too short")\n    else:\n        print("Password missing")\nelse:\n    print("Username missing")',
        ),
        text("<p>handle each failure as soon as you find it:</p>"),
        py(
          'username = "ada"\npassword = "secret"\n\nif username == "":\n    print("Username missing")\nelif password == "":\n    print("Password missing")\nelif len(password) < 6:\n    print("Password too short")\nelse:\n    print("Login accepted")',
        ),
        out("Login accepted"),
        text(
          "<p>Both do the same work. The second is flat, reads top to bottom, and each rule sits on one line. This pattern — check the bad cases first — keeps real programs readable.</p>",
        ),
        text(
          "<h3>Conditions on one line</h3><p>For a simple either-or choice of a <em>value</em>, Python has a compact form:</p>",
        ),
        py(
          'age = 20\nstatus = "adult" if age >= 18 else "minor"\nprint(status)',
        ),
        out("adult"),
        text(
          "<p>Read it as: use <code>\"adult\"</code> if the condition holds, otherwise <code>\"minor\"</code>. Use this only for short, simple choices — a full <code>if</code> statement is clearer for anything longer.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>An <code>if</code> can contain another <code>if</code>; each level indents four more spaces.</p></li><li><p>When there is no inner <code>else</code>, <code>and</code> is simpler than nesting.</p></li><li><p>Checking the failure cases first with <code>elif</code> keeps code flat.</p></li><li><p><code>value_a if condition else value_b</code> chooses between two values on one line.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Nested Conditions",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "When is a nested if reached?",
            options: [
              "Only when the outer condition was true",
              "Always, regardless of the outer condition",
              "Only when the outer condition was false",
              "Only if there is an else",
            ],
            correct: [0],
          },
          {
            text: "if a: / if b: / do_thing() — which single line does the same?",
            options: [
              "if a and b: do_thing()",
              "if a or b: do_thing()",
              "if not a and b: do_thing()",
              "if a == b: do_thing()",
            ],
            correct: [0],
          },
          {
            text: "When is real nesting better than combining with and?",
            options: [
              "When the inner test needs its own else branch",
              "Always — nesting is the preferred style",
              "Never — and is always better",
              "Only inside loops",
            ],
            correct: [0],
          },
          {
            text: 'What does status = "adult" if age >= 18 else "minor" do when age is 15?',
            options: [
              'Assigns "minor" to status',
              'Assigns "adult" to status',
              "Raises a SyntaxError",
              "Assigns False to status",
            ],
            correct: [0],
          },
          {
            text: "Why is checking the failure cases first with elif a good pattern?",
            options: [
              "It keeps the code flat and each rule readable on one line",
              "It runs faster in every case",
              "It is the only way Python allows more than two branches",
              "It avoids the need for an else",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Building a Decision Program",
      blocks: [
        text(
          "<h2>Putting it together</h2><p>This lesson has no new syntax. It shows how the pieces from modules 3 to 6 combine into a program that does something real.</p>",
        ),
        text(
          "<h3>Example: a ticket price calculator</h3><p>The rules: children under 12 pay 1000, people 65 and over pay 1500, everyone else pays 3000. Members get 20 percent off whatever the price would be.</p>",
        ),
        py(
          'age = int(input("Age: "))\nis_member = input("Member? (yes/no) ").strip().lower() == "yes"\n\nif age < 12:\n    price = 1000\n    category = "Child"\nelif age >= 65:\n    price = 1500\n    category = "Senior"\nelse:\n    price = 3000\n    category = "Adult"\n\nif is_member:\n    price = price * 0.8\n\nprint(f"{category} ticket: {price:,.0f} RWF")',
        ),
        out("Age: 70\nMember? (yes/no) yes\nSenior ticket: 1,200 RWF"),
        text(
          "<p>Two things are worth noticing. First, the age chain uses <code>elif</code> because the categories are alternatives — a person is in exactly one. Second, the member discount is a separate <code>if</code>, because it is an independent question that applies to any category.</p>",
        ),
        text(
          "<p>Also look at line 2. The comparison <code>== \"yes\"</code> produces a boolean directly, so <code>is_member</code> holds True or False rather than text. That makes the later <code>if is_member:</code> read naturally.</p>",
        ),
        text(
          "<h3>Example: validating a password</h3><p>Here the failure cases are checked first, which keeps the code flat:</p>",
        ),
        py(
          'password = input("Choose a password: ")\n\nif len(password) < 8:\n    print("Too short — use at least 8 characters")\nelif password.lower() == password:\n    print("Add at least one capital letter")\nelif not any(character.isdigit() for character in password):\n    print("Add at least one digit")\nelse:\n    print("Password accepted")',
        ),
        out("Choose a password: Kigali2026\nPassword accepted"),
        text(
          "<p>The third condition uses <code>any</code>, which returns True if at least one item in a sequence is true. You will meet that pattern properly in module 7. The important part here is the shape: each rule rejects one problem, and the <code>else</code> holds the success case.</p>",
        ),
        text(
          "<h3>Example: a simple grade report</h3>",
        ),
        py(
          'name = input("Student name: ").strip().title()\nscore = float(input("Score out of 100: "))\n\nif score < 0 or score > 100:\n    print("That score is not possible")\nelse:\n    if score >= 80:\n        grade = "A"\n    elif score >= 70:\n        grade = "B"\n    elif score >= 60:\n        grade = "C"\n    elif score >= 50:\n        grade = "D"\n    else:\n        grade = "F"\n\n    passed = score >= 50\n    result = "passed" if passed else "failed"\n\n    print(f"{name} scored {score:.1f} and {result} with grade {grade}")',
        ),
        out("Student name:  ada \nScore out of 100: 76.5\nAda scored 76.5 and passed with grade B"),
        text(
          "<p>The outer <code>if</code> rejects impossible input before any grading happens. That order matters: checking your input first means the rest of the program can trust it.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Use <code>elif</code> for alternatives, and a separate <code>if</code> for an independent question.</p></li><li><p>A comparison can be stored straight into a variable as a boolean.</p></li><li><p>Check impossible or invalid input before doing the real work.</p></li><li><p>Handling failures first keeps the successful path at the end, unindented and easy to find.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Building Decisions",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "In the ticket program, why is the age check an elif chain but the member discount a separate if?",
            options: [
              "The age categories are alternatives, while the discount is an independent question that applies to any category",
              "Because elif cannot be used twice in one program",
              "Because the discount is a float",
              "There is no reason — either would work identically",
            ],
            correct: [0],
          },
          {
            text: 'What does is_member = input("Member? ").strip().lower() == "yes" store?',
            options: [
              "A boolean, True or False",
              "The text the user typed",
              "The text in lowercase",
              "None",
            ],
            correct: [0],
          },
          {
            text: "Why check for an impossible score before grading?",
            options: [
              "So the rest of the program can trust its input",
              "It makes the program run faster",
              "Python requires input checks before any elif chain",
              "To avoid using else",
            ],
            correct: [0],
          },
          {
            text: 'In the grade program, what is grade when score is 70?',
            options: ["B", "A", "C", "D"],
            correct: [0],
          },
          {
            text: "What is the benefit of handling failure cases first?",
            options: [
              "The successful path ends up last and unindented, which is easy to find",
              "It uses less memory",
              "It is the only way to use elif",
              "It removes the need to validate input",
            ],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 6 Test: Making Decisions",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "What are the required parts of an if statement?",
        options: [
          "A condition, a colon, and an indented block",
          "A condition and curly braces",
          "A condition, a semicolon, and a block",
          "Only a condition",
        ],
        correct: [0],
      },
      {
        text: "In a full if / elif / elif / else chain, how many blocks run?",
        options: ["Exactly one", "All that match", "At most two", "None"],
        correct: [0],
      },
      {
        text: "What does this print? x = 5; if x > 10: print(\"a\"); elif x > 3: print(\"b\"); else: print(\"c\")",
        options: ["b", "a", "c", "b and c"],
        correct: [0],
      },
      {
        text: "Which statements about else are true?",
        options: [
          "It takes no condition",
          "It runs when no earlier branch matched",
          "It is optional",
          "It must come before any elif",
        ],
        correct: [0, 1, 2],
      },
      {
        text: "Two separate if statements both have true conditions. What happens?",
        options: [
          "Both blocks run",
          "Only the first block runs",
          "Only the second block runs",
          "A SyntaxError is raised",
        ],
        correct: [0],
      },
      {
        text: "Which is the better way to write if a: / if b: / print(\"x\") when there is no inner else?",
        options: [
          'if a and b: print("x")',
          'if a or b: print("x")',
          'if a: print("x") and b',
          "Leave it nested — it is always clearer",
        ],
        correct: [0],
      },
      {
        text: 'With age = 70, what is "adult" if age >= 18 else "minor"?',
        options: ['"adult"', '"minor"', "True", "A SyntaxError"],
        correct: [0],
      },
      {
        text: "Grades are checked as: if score >= 60 → C, elif score >= 70 → B, elif score >= 80 → A. What is wrong?",
        options: [
          "The conditions overlap and the most general comes first, so every passing score gets a C",
          "elif cannot be used more than once",
          "The comparisons should use = instead of >=",
          "Nothing is wrong",
        ],
        correct: [0],
      },
    ],
  },
};
