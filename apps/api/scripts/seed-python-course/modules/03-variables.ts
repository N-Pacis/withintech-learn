import type { Module } from "../types";
import { text, py, out } from "../types";

export const variables: Module = {
  title: "Variables and Data Types",
  lessons: [
    {
      title: "Creating and Using Variables",
      blocks: [
        text(
          "<h2>A variable is a name for a value</h2><p>A <strong>variable</strong> lets you store a value and refer to it later by name. You create one by assigning to it with <code>=</code>:</p>",
        ),
        py('name = "Ada"\nage = 36'),
        text(
          "<p>There is no keyword such as <code>var</code> or <code>let</code>, and no type to declare. The variable is created the moment you assign to it.</p><p>Now you can use the names anywhere a value is expected:</p>",
        ),
        py('name = "Ada"\nage = 36\n\nprint(name)\nprint(age)'),
        out("Ada\n36"),
        text(
          "<h3>The = sign is not equality</h3><p>In mathematics <code>x = 5</code> states a fact. In Python it is an <strong>instruction</strong>: take the value on the right, and make the name on the left refer to it. It always flows right to left.</p><p>That is why this makes sense in Python but not in mathematics:</p>",
        ),
        py("count = 10\ncount = count + 1\nprint(count)"),
        out("11"),
        text(
          "<p>Python first works out <code>count + 1</code>, which is 11, and then makes <code>count</code> refer to 11.</p>",
        ),
        text(
          "<h3>A variable can be reassigned</h3><p>Assigning again simply replaces what the name points to. The new value does not have to be the same kind of thing:</p>",
        ),
        py('status = "pending"\nprint(status)\n\nstatus = "complete"\nprint(status)\n\nstatus = 200\nprint(status)'),
        out("pending\ncomplete\n200"),
        text(
          "<p>This is called <strong>dynamic typing</strong>: the type belongs to the value, not to the name. It is flexible, but changing the type of a variable halfway through a program usually makes the code harder to follow. Prefer a new name.</p>",
        ),
        text(
          "<h3>Assigning several variables at once</h3><p>Python lets you assign more than one name in a single statement:</p>",
        ),
        py('x, y, z = 1, 2, 3\nprint(x, y, z)'),
        out("1 2 3"),
        text("<p>Or give several names the same value:</p>"),
        py("a = b = c = 0\nprint(a, b, c)"),
        out("0 0 0"),
        text(
          "<h3>Using a variable before creating it</h3><p>If you use a name that was never assigned, Python stops with an error:</p>",
        ),
        py("print(total)"),
        out("NameError: name 'total' is not defined"),
        text(
          "<p>A <strong>NameError</strong> almost always means a typo in the name, or that the assignment comes later in the file than the use.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Create a variable by assigning to it: <code>name = value</code>.</p></li><li><p>No keyword and no type declaration are needed.</p></li><li><p><code>=</code> is an instruction that flows right to left, not a statement of equality.</p></li><li><p>Reassigning replaces the value, and the type may change.</p></li><li><p>Using a name that was never assigned raises a <code>NameError</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Variables",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "How do you create a variable in Python?",
            options: [
              "Assign a value to a name, for example count = 5",
              "Declare it first with var count",
              "Declare its type first, for example int count",
              "Call the create() function",
            ],
            correct: [0],
          },
          {
            text: "After count = 10 and count = count + 1, what does count hold?",
            options: ["11", "10", "1", "An error is raised"],
            correct: [0],
          },
          {
            text: "What does Python do when you use a variable that was never assigned?",
            options: [
              "Raises a NameError",
              "Treats it as 0",
              "Treats it as an empty string",
              "Creates it silently with the value None",
            ],
            correct: [0],
          },
          {
            text: "What does x, y = 1, 2 do?",
            options: [
              "Assigns 1 to x and 2 to y",
              "Assigns the pair (1, 2) to both x and y",
              "Raises a SyntaxError",
              "Assigns 2 to x and 1 to y",
            ],
            correct: [0],
          },
          {
            text: "Python is dynamically typed. What does that mean?",
            options: [
              "The type belongs to the value, so a name can later hold a different type",
              "Types are checked before the program runs",
              "Every variable must be given a type when created",
              "Variables cannot change value once set",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Naming Rules and Naming Style",
      blocks: [
        text(
          "<h2>The rules Python enforces</h2><p>Some naming rules are not optional. Break them and the file will not run:</p><ul><li><p>A name may contain letters, digits and the underscore <code>_</code>.</p></li><li><p>A name may not start with a digit.</p></li><li><p>A name may not contain a space or a dash.</p></li><li><p>Names are case sensitive: <code>total</code>, <code>Total</code> and <code>TOTAL</code> are three different variables.</p></li><li><p>A name may not be a Python keyword such as <code>if</code>, <code>for</code>, <code>class</code> or <code>return</code>.</p></li></ul>",
        ),
        text("<p>These are all valid:</p>"),
        py('user_name = "Ada"\ntotal2 = 50\n_internal = True\nMAX_SIZE = 100'),
        text("<p>These are not:</p>"),
        py('2total = 50\nuser name = "Ada"\nuser-name = "Ada"\nclass = "Biology"'),
        out("SyntaxError: invalid syntax"),
        text(
          "<h3>Case sensitivity catches people out</h3><p>These are two separate variables, and the second line does not change the first:</p>",
        ),
        py('score = 10\nScore = 20\n\nprint(score)\nprint(Score)'),
        out("10\n20"),
        text(
          "<h3>The style everyone follows</h3><p>Beyond the rules, Python has a strong convention. Use <strong>snake_case</strong>: lowercase words joined by underscores.</p>",
        ),
        py(
          'first_name = "Ada"\ntotal_price = 4500\nis_active = True\nitems_in_cart = 3',
        ),
        text(
          "<p>Not <code>firstName</code> and not <code>FirstName</code>. Those styles belong to other languages. Constants — values you set once and never change — are written in capitals with underscores:</p>",
        ),
        py("MAX_LOGIN_ATTEMPTS = 5\nTAX_RATE = 0.18"),
        text(
          "<h3>Choose names that explain themselves</h3><p>The name is documentation. Compare:</p>",
        ),
        py("d = 86400\nn = 3\nt = d * n"),
        text("<p>with:</p>"),
        py(
          "seconds_per_day = 86400\nnumber_of_days = 3\ntotal_seconds = seconds_per_day * number_of_days",
        ),
        text(
          "<p>Both run the same. Only the second one can be understood without guessing. Short names such as <code>i</code> or <code>x</code> are acceptable for a value that lives for one or two lines, and nowhere else.</p>",
        ),
        text(
          "<h3>Do not shadow built-in names</h3><p>Python has built-in functions such as <code>print</code>, <code>list</code>, <code>sum</code> and <code>type</code>. Using one as a variable name is allowed, but it replaces the function for the rest of the program:</p>",
        ),
        py('sum = 10\nprint(sum([1, 2, 3]))'),
        out("TypeError: 'int' object is not callable"),
        text(
          "<p>The name <code>sum</code> now refers to the number 10, and a number cannot be called like a function. Pick <code>total</code> instead.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Names use letters, digits and underscores, and cannot start with a digit.</p></li><li><p>Names are case sensitive, and keywords cannot be used.</p></li><li><p>Style: <code>snake_case</code> for variables, <code>UPPER_CASE</code> for constants.</p></li><li><p>Descriptive names save the reader from guessing.</p></li><li><p>Avoid built-in names such as <code>sum</code>, <code>list</code> and <code>type</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Naming Variables",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Which of these is a valid Python variable name?",
            options: ["total_price", "2nd_place", "total price", "total-price"],
            correct: [0],
          },
          {
            text: "Are score and Score the same variable?",
            options: [
              "No — names are case sensitive, so they are two variables",
              "Yes — Python ignores capital letters",
              "Yes, but only inside a function",
              "No, and using both raises an error",
            ],
            correct: [0],
          },
          {
            text: "Which naming style is the Python convention for ordinary variables?",
            options: ["snake_case", "camelCase", "PascalCase", "kebab-case"],
            correct: [0],
          },
          {
            text: "Why is naming a variable sum a bad idea?",
            options: [
              "It replaces the built-in sum function for the rest of the program",
              "Python forbids it and raises a SyntaxError",
              "It makes the program run slower",
              "sum is a reserved keyword",
            ],
            correct: [0],
          },
          {
            text: "Select every name that Python will accept.",
            options: ["_count", "count2", "MAX_SIZE", "for"],
            correct: [0, 1, 2],
          },
        ],
      },
    },
    {
      title: "Numbers, Text and Booleans",
      blocks: [
        text(
          "<h2>The basic types</h2><p>Every value in Python has a <strong>type</strong>. The type decides what you can do with the value. Four types cover most beginner code:</p><ul><li><p><code>int</code> — a whole number, such as <code>42</code> or <code>-7</code>.</p></li><li><p><code>float</code> — a number with a decimal point, such as <code>3.14</code>.</p></li><li><p><code>str</code> — text, written in quotes, such as <code>\"hello\"</code>.</p></li><li><p><code>bool</code> — either <code>True</code> or <code>False</code>.</p></li></ul>",
        ),
        py(
          'count = 42          # int\nprice = 19.99       # float\nname = "Ada"        # str\nis_active = True    # bool',
        ),
        text(
          "<h3>Asking Python for the type</h3><p>The built-in <code>type</code> function tells you what a value is:</p>",
        ),
        py(
          'print(type(42))\nprint(type(19.99))\nprint(type("Ada"))\nprint(type(True))',
        ),
        out(
          "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>",
        ),
        text(
          "<h3>int and float</h3><p>An <code>int</code> has no decimal part; a <code>float</code> does. Writing <code>5</code> gives an int, and writing <code>5.0</code> gives a float, even though the value looks the same:</p>",
        ),
        py("print(type(5))\nprint(type(5.0))"),
        out("<class 'int'>\n<class 'float'>"),
        text(
          "<p>Mixing them in arithmetic produces a float, because a float can hold any int value but not the other way round:</p>",
        ),
        py("print(2 + 3.0)\nprint(type(2 + 3.0))"),
        out("5.0\n<class 'float'>"),
        text(
          "<p>Be aware that floats are stored in a way that cannot represent every decimal fraction exactly. This surprises everyone once:</p>",
        ),
        py("print(0.1 + 0.2)"),
        out("0.30000000000000004"),
        text(
          "<p>This is not a Python bug — it is how computers store fractions in binary. For money, never rely on exact float equality.</p>",
        ),
        text(
          "<h3>Strings</h3><p>Text is written between single or double quotes. Both are the same to Python:</p>",
        ),
        py("greeting = \"Hello\"\nother = 'Hello'\nprint(greeting == other)"),
        out("True"),
        text(
          "<p>Having two choices is useful when the text itself contains a quote:</p>",
        ),
        py("message = \"It's a good day\"\nprint(message)"),
        out("It's a good day"),
        text(
          "<p>Note that a number in quotes is text, not a number:</p>",
        ),
        py('print(type(42))\nprint(type("42"))'),
        out("<class 'int'>\n<class 'str'>"),
        text(
          "<h3>Booleans</h3><p>A <code>bool</code> holds one of exactly two values: <code>True</code> or <code>False</code>. Both start with a capital letter — <code>true</code> in lowercase is not valid Python. Comparisons produce booleans:</p>",
        ),
        py("print(5 > 3)\nprint(5 == 3)\nprint(type(5 > 3))"),
        out("True\nFalse\n<class 'bool'>"),
        text(
          "<h3>None</h3><p>There is one more value worth knowing now: <code>None</code>. It means \"no value here\". It is not zero and not an empty string — it is the absence of a value:</p>",
        ),
        py("result = None\nprint(result)\nprint(type(result))"),
        out("None\n<class 'NoneType'>"),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>int</code> whole numbers, <code>float</code> decimals, <code>str</code> text, <code>bool</code> True or False.</p></li><li><p><code>type(value)</code> reports the type.</p></li><li><p>Mixing int and float in arithmetic gives a float.</p></li><li><p>Floats cannot store every decimal exactly — <code>0.1 + 0.2</code> is not exactly <code>0.3</code>.</p></li><li><p>Single and double quotes both make strings; <code>\"42\"</code> is text, not a number.</p></li><li><p><code>True</code> and <code>False</code> are capitalised. <code>None</code> means no value.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Data Types",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the type of the value 19.99?",
            options: ["float", "int", "str", "bool"],
            correct: [0],
          },
          {
            text: 'What is the type of "42"?',
            options: ["str", "int", "float", "bool"],
            correct: [0],
          },
          {
            text: "What does 2 + 3.0 produce?",
            options: [
              "5.0, a float",
              "5, an int",
              "The string 5.0",
              "A TypeError",
            ],
            correct: [0],
          },
          {
            text: "Why does print(0.1 + 0.2) show 0.30000000000000004?",
            options: [
              "Floats are stored in binary and cannot represent every decimal fraction exactly",
              "It is a bug in Python 3",
              "Because print rounds the number up",
              "Because 0.1 is stored as a string",
            ],
            correct: [0],
          },
          {
            text: "Which are valid boolean values in Python?",
            options: ["True", "False", "true", "yes"],
            correct: [0, 1],
          },
          {
            text: "What does None mean?",
            options: [
              "The absence of a value",
              "The number zero",
              "An empty string",
              "The boolean False",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Converting Between Types",
      blocks: [
        text(
          "<h2>Why conversion is needed</h2><p>Python will not silently mix text and numbers. This raises an error:</p>",
        ),
        py('age = "36"\nprint(age + 1)'),
        out('TypeError: can only concatenate str (not "int") to str'),
        text(
          "<p>A <strong>TypeError</strong> means the operation does not make sense for those types. <code>age</code> holds the text <code>\"36\"</code>, not the number 36. To do arithmetic you must convert it first.</p>",
        ),
        text(
          "<h3>The conversion functions</h3><p>Each type has a function with the same name that converts a value into it:</p>",
        ),
        py(
          'print(int("36"))\nprint(float("3.5"))\nprint(str(36))\nprint(bool(1))',
        ),
        out("36\n3.5\n36\nTrue"),
        text(
          "<p>These do not change the original value. They produce a new one:</p>",
        ),
        py('age_text = "36"\nage_number = int(age_text)\n\nprint(age_number + 1)\nprint(type(age_text))'),
        out("37\n<class 'str'>"),
        text(
          "<h3>int cuts the decimal part off</h3><p>Converting a float to an int does not round. It removes everything after the point:</p>",
        ),
        py("print(int(3.9))\nprint(int(-3.9))"),
        out("3\n-3"),
        text(
          "<p>Use <code>round</code> when you want proper rounding:</p>",
        ),
        py("print(round(3.9))\nprint(round(3.4))"),
        out("4\n3"),
        text(
          "<h3>Conversion can fail</h3><p><code>int</code> only accepts text that really is a whole number:</p>",
        ),
        py('print(int("hello"))'),
        out("ValueError: invalid literal for int() with base 10: 'hello'"),
        text(
          "<p>A <strong>ValueError</strong> means the type was right — it was text, as <code>int</code> expects — but the content was wrong. Note that <code>int(\"3.5\")</code> also fails, because <code>3.5</code> is not a whole number. Convert to float first:</p>",
        ),
        py('print(int(float("3.5")))'),
        out("3"),
        text(
          "<h3>Converting to bool</h3><p>Almost every value converts to <code>True</code>. The exceptions are the empty and zero values:</p>",
        ),
        py(
          'print(bool(0))\nprint(bool(""))\nprint(bool(None))\nprint(bool(42))\nprint(bool("no"))',
        ),
        out("False\nFalse\nFalse\nTrue\nTrue"),
        text(
          "<p>Look at the last line. The string <code>\"no\"</code> is <code>True</code>, because it is a non-empty string. Only emptiness and zero are false.</p>",
        ),
        text(
          "<h3>Joining text and numbers</h3><p>To put a number inside a message, convert it to text with <code>str</code>:</p>",
        ),
        py('score = 42\nprint("Your score is " + str(score))'),
        out("Your score is 42"),
        text(
          "<p>Or let <code>print</code> handle it by passing separate values, which needs no conversion at all:</p>",
        ),
        py('score = 42\nprint("Your score is", score)'),
        out("Your score is 42"),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>int()</code>, <code>float()</code>, <code>str()</code> and <code>bool()</code> convert values.</p></li><li><p>They return a new value; the original is unchanged.</p></li><li><p><code>int()</code> on a float cuts the decimal off; <code>round()</code> rounds properly.</p></li><li><p>A <code>TypeError</code> means the types do not fit; a <code>ValueError</code> means the content does not fit.</p></li><li><p>Only zero, empty values and <code>None</code> convert to <code>False</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Type Conversion",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: 'What does int("36") + 1 produce?',
            options: ["37", '"361"', "A TypeError", "36.1"],
            correct: [0],
          },
          {
            text: "What does int(3.9) produce?",
            options: [
              "3, because int cuts off the decimal part",
              "4, because it rounds",
              "3.9",
              "A ValueError",
            ],
            correct: [0],
          },
          {
            text: 'Why does int("hello") raise a ValueError rather than a TypeError?',
            options: [
              "The type was right — text — but the content is not a whole number",
              "Because hello is a keyword",
              "Because int only accepts floats",
              "Because the string is too long",
            ],
            correct: [0],
          },
          {
            text: 'What is bool("no")?',
            options: [
              "True, because it is a non-empty string",
              "False, because the word means no",
              "A ValueError",
              "None",
            ],
            correct: [0],
          },
          {
            text: "Which of these convert to False?",
            options: ["0", '""', "None", '"False"'],
            correct: [0, 1, 2],
          },
          {
            text: 'How do you fix print("Score: " + 42)?',
            options: [
              'Use str(42), or pass the values separately: print("Score:", 42)',
              "Use int(42)",
              "Remove the quotes around Score",
              "Nothing — the line already works",
            ],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 3 Test: Variables and Data Types",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "Which line correctly creates a variable holding the text Ada?",
        options: [
          'name = "Ada"',
          'str name = "Ada"',
          'var name = "Ada"',
          'name := "Ada"',
        ],
        correct: [0],
      },
      {
        text: "What is the type of True?",
        options: ["bool", "int", "str", "None"],
        correct: [0],
      },
      {
        text: "Which names would Python reject?",
        options: ["2count", "my count", "class", "count_2"],
        correct: [0, 1, 2],
      },
      {
        text: "After x = 5 and then x = \"five\", what is the type of x?",
        options: [
          "str — the type belongs to the value, and the name now points to text",
          "int — the first assignment fixed the type",
          "Both, at the same time",
          "A TypeError is raised at the second line",
        ],
        correct: [0],
      },
      {
        text: 'What does print(int(float("7.8"))) show?',
        options: ["7", "8", "7.8", "A ValueError"],
        correct: [0],
      },
      {
        text: "Which statement about floats is true?",
        options: [
          "They cannot represent every decimal fraction exactly",
          "They are always exact",
          "They can only hold positive numbers",
          "They are the same type as int",
        ],
        correct: [0],
      },
      {
        text: "What error do you get from print(\"age: \" + 36)?",
        options: [
          "TypeError, because a string and an int cannot be joined with +",
          "ValueError, because 36 is not text",
          "NameError, because age is not defined",
          "No error — it prints age: 36",
        ],
        correct: [0],
      },
      {
        text: "Which naming choices follow Python style?",
        options: ["total_price", "MAX_ATTEMPTS for a constant", "totalPrice", "TotalPrice"],
        correct: [0, 1],
      },
    ],
  },
};
