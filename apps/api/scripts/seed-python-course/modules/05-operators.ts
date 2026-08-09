import type { Module } from "../types";
import { text, py, out } from "../types";

export const operators: Module = {
  title: "Operators and User Input",
  lessons: [
    {
      title: "Arithmetic Operators",
      blocks: [
        text(
          "<h2>Doing sums</h2><p>Python has the arithmetic you would expect, plus three that are worth learning properly.</p><ul><li><p><code>+</code> add</p></li><li><p><code>-</code> subtract</p></li><li><p><code>*</code> multiply</p></li><li><p><code>/</code> divide</p></li><li><p><code>//</code> floor divide</p></li><li><p><code>%</code> remainder</p></li><li><p><code>**</code> power</p></li></ul>",
        ),
        py(
          "print(7 + 3)\nprint(7 - 3)\nprint(7 * 3)\nprint(7 / 3)",
        ),
        out("10\n4\n21\n2.3333333333333335"),
        text(
          "<h3>Division always gives a float</h3><p>Notice that <code>7 / 3</code> gave a decimal. So does an exact division:</p>",
        ),
        py("print(6 / 3)\nprint(type(6 / 3))"),
        out("2.0\n<class 'float'>"),
        text(
          "<p>This catches beginners out. If you need a whole number, use <code>//</code>.</p>",
        ),
        text(
          "<h3>Floor division and remainder</h3><p><code>//</code> divides and throws away the fraction. <code>%</code> gives what is left over:</p>",
        ),
        py("print(17 // 5)\nprint(17 % 5)"),
        out("3\n2"),
        text(
          "<p>17 divided by 5 is 3 with 2 left over. These two go together: <code>//</code> gives the 3 and <code>%</code> gives the 2.</p><p>The remainder is more useful than it first looks. It tells you whether a number divides evenly:</p>",
        ),
        py(
          "print(10 % 2)\nprint(11 % 2)\n\nseconds = 500\nprint(seconds // 60, \"minutes and\", seconds % 60, \"seconds\")",
        ),
        out("0\n1\n8 minutes and 20 seconds"),
        text(
          "<p>A remainder of 0 when dividing by 2 means the number is even. This is the standard way to test for even and odd.</p>",
        ),
        text(
          "<h3>Powers</h3><p>Two stars raise to a power. It is not <code>^</code>, which means something else entirely in Python:</p>",
        ),
        py("print(2 ** 3)\nprint(2 ** 0.5)"),
        out("8\n1.4142135623730951"),
        text(
          "<h3>Order of operations</h3><p>Python follows the usual mathematical order: powers first, then multiply and divide, then add and subtract. Brackets override it:</p>",
        ),
        py("print(2 + 3 * 4)\nprint((2 + 3) * 4)"),
        out("14\n20"),
        text(
          "<p>When in doubt, add brackets. They cost nothing and remove the guesswork for whoever reads the code next.</p>",
        ),
        text(
          "<h3>Shorthand assignment</h3><p>Updating a variable using its own value is so common that there is a short form for it:</p>",
        ),
        py(
          "count = 10\ncount += 5\nprint(count)\n\ncount -= 3\nprint(count)\n\ncount *= 2\nprint(count)",
        ),
        out("15\n12\n24"),
        text(
          "<p><code>count += 5</code> means exactly <code>count = count + 5</code>. The same pattern works for <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>//=</code>, <code>%=</code> and <code>**=</code>.</p>",
        ),
        text(
          "<h3>Dividing by zero</h3><p>Division by zero is an error, not infinity:</p>",
        ),
        py("print(10 / 0)"),
        out("ZeroDivisionError: division by zero"),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>/</code> always returns a float, even for exact division.</p></li><li><p><code>//</code> gives the whole part; <code>%</code> gives the remainder.</p></li><li><p><code>n % 2 == 0</code> tests whether n is even.</p></li><li><p><code>**</code> is the power operator, not <code>^</code>.</p></li><li><p><code>+=</code> and friends are short forms of <code>x = x + …</code>.</p></li><li><p>Dividing by zero raises a <code>ZeroDivisionError</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Arithmetic",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the type of the result of 6 / 3?",
            options: ["float", "int", "str", "bool"],
            correct: [0],
          },
          {
            text: "What is 17 // 5?",
            options: ["3", "3.4", "2", "4"],
            correct: [0],
          },
          {
            text: "What is 17 % 5?",
            options: ["2", "3", "3.4", "0"],
            correct: [0],
          },
          {
            text: "How do you test whether a number n is even?",
            options: [
              "n % 2 == 0",
              "n // 2 == 0",
              "n / 2 == 0",
              "n ** 2 == 0",
            ],
            correct: [0],
          },
          {
            text: "What does 2 ** 3 give?",
            options: ["8", "6", "9", "5"],
            correct: [0],
          },
          {
            text: "What is 2 + 3 * 4?",
            options: [
              "14, because multiplication happens before addition",
              "20, because Python works left to right",
              "24",
              "9",
            ],
            correct: [0],
          },
          {
            text: "What does count += 5 mean?",
            options: [
              "count = count + 5",
              "count = 5",
              "count is compared with 5",
              "count = count * 5",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Comparison Operators",
      blocks: [
        text(
          "<h2>Asking questions about values</h2><p>A <strong>comparison operator</strong> compares two values and produces a boolean — <code>True</code> or <code>False</code>. These are what you put inside an <code>if</code> statement.</p><ul><li><p><code>==</code> equal to</p></li><li><p><code>!=</code> not equal to</p></li><li><p><code>&gt;</code> greater than</p></li><li><p><code>&lt;</code> less than</p></li><li><p><code>&gt;=</code> greater than or equal to</p></li><li><p><code>&lt;=</code> less than or equal to</p></li></ul>",
        ),
        py(
          "print(5 == 5)\nprint(5 != 5)\nprint(5 > 3)\nprint(5 <= 3)",
        ),
        out("True\nFalse\nTrue\nFalse"),
        text(
          "<h3>One equals sign or two?</h3><p>This is the single most common beginner mistake. They are completely different:</p><ul><li><p><code>=</code> <strong>assigns</strong>. It puts a value into a variable.</p></li><li><p><code>==</code> <strong>compares</strong>. It asks whether two values are the same.</p></li></ul>",
        ),
        py("age = 18\nprint(age)\nprint(age == 18)\nprint(age == 21)"),
        out("18\nTrue\nFalse"),
        text(
          "<p>Using <code>=</code> where a comparison belongs is a syntax error, which is fortunate — Python catches it for you:</p>",
        ),
        py("age = 18\nif age = 18:\n    print(\"adult\")"),
        out("SyntaxError: invalid syntax"),
        text(
          "<h3>Comparing text</h3><p>Comparison works on strings too. Equality is exact and case sensitive:</p>",
        ),
        py(
          'print("cat" == "cat")\nprint("Cat" == "cat")\nprint("cat" != "dog")',
        ),
        out("True\nFalse\nTrue"),
        text(
          "<p>To compare while ignoring case, put both sides in the same case first:</p>",
        ),
        py('answer = "YES"\nprint(answer.lower() == "yes")'),
        out("True"),
        text(
          "<p>Greater than and less than also work on strings. They compare alphabetically, using character codes — which means every capital letter sorts before every lowercase one:</p>",
        ),
        py('print("apple" < "banana")\nprint("Zebra" < "apple")'),
        out("True\nTrue"),
        text(
          "<h3>Comparing different types</h3><p>Equality between different types is simply <code>False</code>, not an error:</p>",
        ),
        py('print(42 == "42")'),
        out("False"),
        text(
          "<p>But ordering different types does raise an error, because there is no sensible answer:</p>",
        ),
        py('print(42 < "42")'),
        out("TypeError: '<' not supported between instances of 'int' and 'str'"),
        text(
          "<h3>Chaining comparisons</h3><p>Python allows a range check written the way you would write it in mathematics:</p>",
        ),
        py("age = 25\nprint(18 <= age <= 65)"),
        out("True"),
        text(
          "<p>Most languages do not allow this. In Python it means exactly \"age is at least 18 and at most 65\".</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Comparisons produce <code>True</code> or <code>False</code>.</p></li><li><p><code>=</code> assigns, <code>==</code> compares. Mixing them up is the classic beginner bug.</p></li><li><p>String equality is case sensitive; use <code>.lower()</code> on both sides to ignore case.</p></li><li><p><code>42 == \"42\"</code> is <code>False</code>; <code>42 &lt; \"42\"</code> is a <code>TypeError</code>.</p></li><li><p>You can chain: <code>18 &lt;= age &lt;= 65</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Comparisons",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the difference between = and ==?",
            options: [
              "= assigns a value; == compares two values",
              "They are the same",
              "= compares; == assigns",
              "== is only for numbers",
            ],
            correct: [0],
          },
          {
            text: 'What is "Cat" == "cat"?',
            options: [
              "False, because string comparison is case sensitive",
              "True",
              "A TypeError",
              "None",
            ],
            correct: [0],
          },
          {
            text: 'What is 42 == "42"?',
            options: [
              "False — different types are never equal",
              "True",
              "A TypeError",
              "42",
            ],
            correct: [0],
          },
          {
            text: 'Why does 42 < "42" raise a TypeError while 42 == "42" does not?',
            options: [
              "There is no sensible order between a number and text, but they can still be checked for equality",
              "Because == is faster",
              "Because 42 is not a valid int",
              "It does not — both raise a TypeError",
            ],
            correct: [0],
          },
          {
            text: "What does 18 <= age <= 65 check?",
            options: [
              "That age is at least 18 and at most 65",
              "That age equals 18 or 65",
              "Nothing — this is invalid Python",
              "That age is less than 18",
            ],
            correct: [0],
          },
          {
            text: 'How do you compare two strings ignoring case?',
            options: [
              "Call .lower() on both sides before comparing",
              "Use the ~= operator",
              "Use == with three equals signs",
              "It is not possible in Python",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Logical Operators: and, or, not",
      blocks: [
        text(
          "<h2>Combining conditions</h2><p>Often one condition is not enough. <strong>Logical operators</strong> join conditions together.</p><ul><li><p><code>and</code> — True only when <em>both</em> sides are True.</p></li><li><p><code>or</code> — True when <em>at least one</em> side is True.</p></li><li><p><code>not</code> — flips True to False and back.</p></li></ul>",
        ),
        py(
          "print(True and True)\nprint(True and False)\nprint(True or False)\nprint(False or False)\nprint(not True)",
        ),
        out("True\nFalse\nTrue\nFalse\nFalse"),
        text(
          "<h3>Used with real conditions</h3><p>In practice each side is a comparison:</p>",
        ),
        py(
          'age = 25\nhas_ticket = True\n\nprint(age >= 18 and has_ticket)\nprint(age < 18 or has_ticket)\nprint(not has_ticket)',
        ),
        out("True\nTrue\nFalse"),
        text(
          "<h3>Short-circuit evaluation</h3><p>Python stops as soon as the answer is certain. With <code>and</code>, if the left side is False the result must be False, so the right side is never looked at. With <code>or</code>, if the left side is True the right side is skipped.</p><p>This is not a small detail — it lets you guard against errors:</p>",
        ),
        py(
          'name = ""\n\nif name != "" and name[0] == "A":\n    print("Starts with A")\nelse:\n    print("No match")',
        ),
        out("No match"),
        text(
          "<p><code>name[0]</code> on an empty string would raise an <code>IndexError</code>. It never runs, because the left side was already False. Swap the order and the program crashes.</p>",
        ),
        text(
          "<h3>A common mistake</h3><p>You cannot write a condition the way you would say it out loud:</p>",
        ),
        py('day = "Sunday"\nprint(day == "Saturday" or "Sunday")'),
        out("Saturday"),
        text(
          "<p>That result looks strange, and it is certainly not what was meant. Python read it as <code>(day == \"Saturday\") or (\"Sunday\")</code>. The left side is False, so <code>or</code> returned the right side — the non-empty string <code>\"Sunday\"</code>, which is truthy. The test would pass on every day of the week.</p><p>Write the comparison out on both sides:</p>",
        ),
        py('day = "Sunday"\nprint(day == "Saturday" or day == "Sunday")'),
        out("True"),
        text(
          "<p>Or better, use <code>in</code> with a list of the accepted values:</p>",
        ),
        py('day = "Sunday"\nprint(day in ["Saturday", "Sunday"])'),
        out("True"),
        text(
          "<h3>Truthiness</h3><p><code>and</code>, <code>or</code> and <code>if</code> accept any value, not only booleans. Empty and zero values count as False; everything else counts as True:</p>",
        ),
        py(
          'name = ""\n\nif name:\n    print("Name given")\nelse:\n    print("Name is empty")',
        ),
        out("Name is empty"),
        text(
          "<p>Writing <code>if name:</code> is the normal Python style. It is shorter than <code>if name != \"\":</code> and means the same thing here.</p>",
        ),
        text(
          "<h3>Combining and ordering</h3><p><code>not</code> binds tightest, then <code>and</code>, then <code>or</code>. Brackets make the intent obvious:</p>",
        ),
        py(
          "age = 20\nis_member = False\nhas_invite = True\n\nprint((age >= 18) and (is_member or has_invite))",
        ),
        out("True"),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>and</code> needs both sides true; <code>or</code> needs one; <code>not</code> flips.</p></li><li><p>Python short-circuits, which lets you guard a risky check behind a safe one.</p></li><li><p><code>x == \"a\" or \"b\"</code> is a bug — write <code>x == \"a\" or x == \"b\"</code>, or <code>x in [\"a\", \"b\"]</code>.</p></li><li><p>Empty and zero values are falsy; <code>if name:</code> is normal style.</p></li><li><p>Order: <code>not</code>, then <code>and</code>, then <code>or</code>. Use brackets to be clear.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Logical Operators",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "When is A and B True?",
            options: [
              "Only when both A and B are True",
              "When at least one is True",
              "When both are False",
              "Always",
            ],
            correct: [0],
          },
          {
            text: "What does short-circuit evaluation mean for A and B?",
            options: [
              "If A is False, B is never evaluated",
              "Both sides are always evaluated",
              "B is evaluated first",
              "The result is always False",
            ],
            correct: [0],
          },
          {
            text: 'Why is day == "Saturday" or "Sunday" a bug?',
            options: [
              'Python reads it as (day == "Saturday") or ("Sunday"), and a non-empty string is always truthy',
              "or cannot be used with strings",
              "It raises a SyntaxError",
              "It only checks Sunday and ignores Saturday",
            ],
            correct: [0],
          },
          {
            text: 'What is the correct way to test that day is Saturday or Sunday?',
            options: [
              'day in ["Saturday", "Sunday"]',
              'day == "Saturday" or "Sunday"',
              'day == ["Saturday", "Sunday"]',
              'day is "Saturday" or "Sunday"',
            ],
            correct: [0],
          },
          {
            text: 'With name = "", what does if name: do?',
            options: [
              "Treats it as False, because an empty string is falsy",
              "Treats it as True, because the variable exists",
              "Raises a NameError",
              "Raises a TypeError, because name is not a boolean",
            ],
            correct: [0],
          },
          {
            text: "In which order are logical operators applied?",
            options: [
              "not first, then and, then or",
              "or first, then and, then not",
              "and first, then or, then not",
              "They are always applied left to right",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Reading Input from the User",
      blocks: [
        text(
          "<h2>The input function</h2><p><code>input</code> stops the program, waits for the person to type something and press Enter, then hands back what they typed:</p>",
        ),
        py('name = input("What is your name? ")\nprint("Hello,", name)'),
        text("<p>A run of that program looks like this:</p>"),
        out("What is your name? Ada\nHello, Ada"),
        text(
          "<p>The text you pass to <code>input</code> is the <strong>prompt</strong>. It is shown before the cursor. Always end it with a space so the typing does not touch your question.</p>",
        ),
        text(
          "<h3>input always returns text</h3><p>This is the rule that causes the most confusion. Whatever the person types, you get a <code>str</code> — even if it looks like a number:</p>",
        ),
        py('age = input("Your age: ")\nprint(type(age))\nprint(age + 1)'),
        out(
          'Your age: 36\n<class \'str\'>\nTypeError: can only concatenate str (not "int") to str',
        ),
        text(
          "<p>To do arithmetic, convert it yourself:</p>",
        ),
        py(
          'age = int(input("Your age: "))\nprint(type(age))\nprint("Next year you will be", age + 1)',
        ),
        out("Your age: 36\n<class 'int'>\nNext year you will be 37"),
        text(
          "<p>Read <code>int(input(...))</code> from the inside out: <code>input</code> runs first and returns text, then <code>int</code> converts that text to a whole number.</p>",
        ),
        text(
          "<h3>Bad input crashes the program</h3><p>If the person types something that is not a number, the conversion fails:</p>",
        ),
        py('age = int(input("Your age: "))'),
        out(
          "Your age: thirty\nValueError: invalid literal for int() with base 10: 'thirty'",
        ),
        text(
          "<p>You will learn how to catch this properly with <code>try</code> and <code>except</code> in module 10. For now, be aware that any program using <code>input</code> can be stopped by unexpected typing.</p>",
        ),
        text(
          "<h3>Clean up what you receive</h3><p>People add spaces without noticing. <code>strip</code> removes them, and matching the case makes the check reliable:</p>",
        ),
        py(
          'answer = input("Continue? (yes/no) ").strip().lower()\nprint(answer == "yes")',
        ),
        out("Continue? (yes/no)    YES  \nTrue"),
        text(
          "<p>The methods run left to right: <code>input</code> gives the raw text, <code>strip</code> removes the outer spaces, <code>lower</code> makes it lowercase.</p>",
        ),
        text(
          "<h3>A small complete program</h3><p>Putting the module together:</p>",
        ),
        py(
          'name = input("Your name: ").strip()\nprice = float(input("Item price: "))\nquantity = int(input("How many? "))\n\ntotal = price * quantity\n\nprint(f"Thank you {name}")\nprint(f"Total: {total:,.2f} RWF")',
        ),
        out(
          "Your name: Ada\nItem price: 1250.5\nHow many? 3\nThank you Ada\nTotal: 3,751.50 RWF",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>input(prompt)</code> waits for the user and returns what they typed.</p></li><li><p>The result is <strong>always</strong> a string.</p></li><li><p>Wrap it in <code>int()</code> or <code>float()</code> to do arithmetic.</p></li><li><p>Bad input raises a <code>ValueError</code> and stops the program.</p></li><li><p><code>.strip().lower()</code> makes the answer easier to check.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: User Input",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What type does input() always return?",
            options: ["str", "int", "float", "It depends on what the user types"],
            correct: [0],
          },
          {
            text: 'The user types 36 at age = input("Age: "). What does age + 1 do?',
            options: [
              "Raises a TypeError, because age holds text",
              "Gives 37",
              'Gives "361"',
              "Gives 36",
            ],
            correct: [0],
          },
          {
            text: "How do you read a whole number from the user?",
            options: [
              'int(input("Age: "))',
              'input(int("Age: "))',
              'input("Age: ").int()',
              'number(input("Age: "))',
            ],
            correct: [0],
          },
          {
            text: 'The user types "thirty" for int(input(...)). What happens?',
            options: [
              "A ValueError is raised and the program stops",
              "The value 30 is stored",
              "The value 0 is stored",
              "A TypeError is raised",
            ],
            correct: [0],
          },
          {
            text: 'Why is input("Continue? ").strip().lower() useful?',
            options: [
              "It removes accidental spaces and makes the case consistent, so the comparison is reliable",
              "It converts the answer to a boolean",
              "It stops the user typing capital letters",
              "It makes input run faster",
            ],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 5 Test: Operators and User Input",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "What is 7 // 2?",
        options: ["3", "3.5", "4", "1"],
        correct: [0],
      },
      {
        text: "What is 7 % 2?",
        options: ["1", "3", "3.5", "0"],
        correct: [0],
      },
      {
        text: "Which expression checks that a number n is odd?",
        options: ["n % 2 == 1", "n // 2 == 1", "n / 2 == 1", "n ** 2 == 1"],
        correct: [0],
      },
      {
        text: "Which are true about the input function?",
        options: [
          "It returns a string every time",
          "It pauses the program until the user presses Enter",
          "Its argument is shown as a prompt",
          "It converts numbers automatically",
        ],
        correct: [0, 1, 2],
      },
      {
        text: "What does print(10 / 0) do?",
        options: [
          "Raises a ZeroDivisionError",
          "Prints infinity",
          "Prints 0",
          "Prints None",
        ],
        correct: [0],
      },
      {
        text: 'With score = "" what does if score: evaluate to?',
        options: ["False", "True", "A TypeError", "None"],
        correct: [0],
      },
      {
        text: "Which line safely checks the first letter of a possibly empty string s?",
        options: [
          's != "" and s[0] == "A"',
          's[0] == "A" and s != ""',
          's[0] == "A" or s != ""',
          's[0] == "A"',
        ],
        correct: [0],
      },
      {
        text: "What is the value of (2 + 3) * 4 ** 2?",
        options: ["80", "400", "100", "52"],
        correct: [0],
      },
    ],
  },
};
