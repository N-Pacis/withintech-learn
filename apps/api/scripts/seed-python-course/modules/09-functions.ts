import type { Module } from "../types";
import { text, py, out } from "../types";

export const functions: Module = {
  title: "Functions",
  lessons: [
    {
      title: "Defining and Calling Functions",
      blocks: [
        text(
          "<h2>Naming a piece of work</h2><p>A <strong>function</strong> is a block of code with a name. You write it once and run it whenever you need it, by <strong>calling</strong> it.</p><p>You have already called functions written by other people: <code>print</code>, <code>len</code>, <code>input</code>. Now you will write your own.</p>",
        ),
        py(
          'def greet():\n    print("Hello!")\n    print("Welcome to the course")\n\ngreet()\ngreet()',
        ),
        out(
          "Hello!\nWelcome to the course\nHello!\nWelcome to the course",
        ),
        text(
          "<h3>The parts of a definition</h3><ol><li><p><code>def</code> — the keyword that starts a definition.</p></li><li><p>The name — the same naming rules as a variable, in <code>snake_case</code>.</p></li><li><p>Round brackets, then a colon.</p></li><li><p>The indented block, called the <strong>body</strong>.</p></li></ol>",
        ),
        text(
          "<h3>Defining is not running</h3><p><code>def</code> only creates the function. Nothing in the body runs until you call it:</p>",
        ),
        py(
          'def greet():\n    print("Hello!")\n\nprint("Before the call")\ngreet()\nprint("After the call")',
        ),
        out("Before the call\nHello!\nAfter the call"),
        text(
          "<p>Forgetting the brackets is a quiet mistake. It does not call the function — it just refers to it:</p>",
        ),
        py('def greet():\n    print("Hello!")\n\ngreet'),
        text(
          "<p>That produces no output at all. If a function seems to do nothing, check that you wrote <code>greet()</code> and not <code>greet</code>.</p>",
        ),
        text(
          "<h3>Define before you call</h3><p>Python reads the file from the top. The <code>def</code> must run before the call:</p>",
        ),
        py('greet()\n\ndef greet():\n    print("Hello!")'),
        out("NameError: name 'greet' is not defined"),
        text(
          "<p>This is why functions are normally written at the top of a file, with the code that uses them below.</p>",
        ),
        text(
          "<h3>Why bother?</h3><p>Three reasons, and they grow more important as programs get longer:</p><ul><li><p><strong>No repetition.</strong> Write the logic once. Fix a bug in one place instead of five.</p></li><li><p><strong>A name explains the intent.</strong> <code>calculate_total()</code> tells the reader what the block does without them reading it.</p></li><li><p><strong>Smaller pieces.</strong> A long program becomes a set of short, testable parts.</p></li></ul>",
        ),
        text(
          "<h3>Functions can call other functions</h3>",
        ),
        py(
          'def print_line():\n    print("-" * 20)\n\ndef print_header():\n    print_line()\n    print("MONTHLY REPORT")\n    print_line()\n\nprint_header()',
        ),
        out(
          "--------------------\nMONTHLY REPORT\n--------------------",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>def name():</code> defines a function; the indented block is its body.</p></li><li><p>Defining does not run the body — a call does.</p></li><li><p><code>greet()</code> calls it; <code>greet</code> only refers to it.</p></li><li><p>The definition must appear before the call in the file.</p></li><li><p>Functions remove repetition, name the intent, and break big programs into parts.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Defining Functions",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Which keyword defines a function?",
            options: ["def", "function", "define", "fun"],
            correct: [0],
          },
          {
            text: "What happens when Python reads a def line?",
            options: [
              "The function is created, but its body does not run",
              "The body runs immediately",
              "The body runs once and is then discarded",
              "Nothing at all",
            ],
            correct: [0],
          },
          {
            text: "What is the difference between greet and greet()?",
            options: [
              "greet refers to the function; greet() calls it",
              "They are the same",
              "greet() defines it; greet calls it",
              "greet() is invalid syntax",
            ],
            correct: [0],
          },
          {
            text: "Why does calling a function before its def raise a NameError?",
            options: [
              "Python reads the file from the top, so the name does not exist yet",
              "Functions must always be in a separate file",
              "The call must be indented",
              "Only built-in functions can be called",
            ],
            correct: [0],
          },
          {
            text: "Which are good reasons to write a function?",
            options: [
              "The logic is written once, so a bug is fixed in one place",
              "The name explains what the block does",
              "A long program is broken into smaller parts",
              "Functions make Python skip type checking",
            ],
            correct: [0, 1, 2],
          },
        ],
      },
    },
    {
      title: "Parameters and Arguments",
      blocks: [
        text(
          "<h2>Giving a function information</h2><p>A function is much more useful when you can pass values into it. Names listed inside the brackets of the definition are <strong>parameters</strong>. The values you pass when calling are <strong>arguments</strong>.</p>",
        ),
        py(
          'def greet(name):\n    print("Hello,", name)\n\ngreet("Ada")\ngreet("Alan")',
        ),
        out("Hello, Ada\nHello, Alan"),
        text(
          "<p><code>name</code> is the parameter. <code>\"Ada\"</code> and <code>\"Alan\"</code> are the arguments. Each call creates the parameter fresh and gives it that call's value.</p>",
        ),
        text(
          "<h3>Several parameters</h3><p>Separate them with commas. By default the arguments are matched by position — first to first, second to second:</p>",
        ),
        py(
          'def describe(name, age, city):\n    print(f"{name} is {age} and lives in {city}")\n\ndescribe("Ada", 36, "Kigali")',
        ),
        out("Ada is 36 and lives in Kigali"),
        text("<p>Get the order wrong and the output is nonsense:</p>"),
        py(
          'def describe(name, age, city):\n    print(f"{name} is {age} and lives in {city}")\n\ndescribe(36, "Kigali", "Ada")',
        ),
        out("36 is Kigali and lives in Ada"),
        text(
          "<p>Python did not complain. It matched by position, exactly as told. This kind of bug is why keyword arguments exist.</p>",
        ),
        text(
          "<h3>Keyword arguments</h3><p>Name the parameter in the call and the order stops mattering:</p>",
        ),
        py(
          'def describe(name, age, city):\n    print(f"{name} is {age} and lives in {city}")\n\ndescribe(city="Kigali", name="Ada", age=36)',
        ),
        out("Ada is 36 and lives in Kigali"),
        text(
          "<p>For a function with several parameters, naming them in the call makes the code much easier to read. You have already used this: <code>print(values, sep=\"-\")</code> and <code>enumerate(names, start=1)</code>.</p>",
        ),
        text(
          "<h3>The number of arguments must match</h3>",
        ),
        py(
          'def greet(name):\n    print("Hello,", name)\n\ngreet()',
        ),
        out(
          "TypeError: greet() missing 1 required positional argument: 'name'",
        ),
        text(
          "<h3>Default values</h3><p>Give a parameter a default and it becomes optional:</p>",
        ),
        py(
          'def greet(name, greeting="Hello"):\n    print(f"{greeting}, {name}!")\n\ngreet("Ada")\ngreet("Alan", "Good morning")\ngreet("Grace", greeting="Welcome")',
        ),
        out("Hello, Ada!\nGood morning, Alan!\nWelcome, Grace!"),
        text(
          "<p>Parameters with defaults must come <em>after</em> those without. Otherwise Python could not tell which value belongs where:</p>",
        ),
        py('def greet(greeting="Hello", name):\n    pass'),
        out(
          "SyntaxError: parameter without a default follows parameter with a default",
        ),
        text(
          "<h3>A warning about mutable defaults</h3><p>Never use a list or a dictionary as a default value. The default is created once, when the function is defined, and shared by every call:</p>",
        ),
        py(
          'def add_item(item, basket=[]):\n    basket.append(item)\n    return basket\n\nprint(add_item("pen"))\nprint(add_item("book"))',
        ),
        out("['pen']\n['pen', 'book']"),
        text(
          "<p>The second call was expected to start empty and did not. Use <code>None</code> instead, and build the list inside:</p>",
        ),
        py(
          'def add_item(item, basket=None):\n    if basket is None:\n        basket = []\n    basket.append(item)\n    return basket\n\nprint(add_item("pen"))\nprint(add_item("book"))',
        ),
        out("['pen']\n['book']"),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Parameters are in the definition; arguments are the values passed in a call.</p></li><li><p>Arguments match by position unless you name them.</p></li><li><p>Keyword arguments make a call readable and order-independent.</p></li><li><p>A default value makes a parameter optional; defaults must come last.</p></li><li><p>Never default a parameter to a list or dictionary — use <code>None</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Parameters",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the difference between a parameter and an argument?",
            options: [
              "A parameter is the name in the definition; an argument is the value passed in a call",
              "They are the same thing",
              "A parameter is the value; an argument is the name",
              "An argument only exists for built-in functions",
            ],
            correct: [0],
          },
          {
            text: "How are arguments matched to parameters by default?",
            options: [
              "By position",
              "By name",
              "Alphabetically",
              "By type",
            ],
            correct: [0],
          },
          {
            text: "What is the benefit of calling describe(name=\"Ada\", age=36)?",
            options: [
              "The order no longer matters and the call is easier to read",
              "It runs faster",
              "It allows fewer arguments than parameters",
              "It converts the types automatically",
            ],
            correct: [0],
          },
          {
            text: 'Why must def greet(greeting="Hello", name) raise a SyntaxError?',
            options: [
              "A parameter without a default cannot follow one with a default",
              "greeting is a reserved word",
              "A function may have only one default",
              "Defaults must be numbers",
            ],
            correct: [0],
          },
          {
            text: "Why is def add(item, basket=[]) dangerous?",
            options: [
              "The default list is created once and shared by every call",
              "Lists cannot be passed to functions",
              "It raises a SyntaxError",
              "The list is deleted after the first call",
            ],
            correct: [0],
          },
          {
            text: "What should you use instead of a mutable default?",
            options: [
              "None, then create the list inside the function",
              "An empty string",
              "0",
              "A tuple with one item",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Returning Values",
      blocks: [
        text(
          "<h2>Sending a result back</h2><p>Printing shows a value to the person watching. <strong>Returning</strong> hands a value back to the code that made the call, so it can be stored and used. These are not the same thing, and confusing them is the most common mistake with functions.</p>",
        ),
        py(
          "def add(a, b):\n    return a + b\n\nresult = add(2, 3)\nprint(result)\nprint(add(10, 5) * 2)",
        ),
        out("5\n30"),
        text(
          "<p>Because <code>add</code> returns a value, the call can be used anywhere a value is allowed — stored, multiplied, passed to another function.</p>",
        ),
        text(
          "<h3>print is not return</h3><p>Compare these two:</p>",
        ),
        py(
          "def add_and_print(a, b):\n    print(a + b)\n\nresult = add_and_print(2, 3)\nprint(result)",
        ),
        out("5\nNone"),
        text(
          "<p>The 5 appeared because of the <code>print</code> inside. But <code>result</code> is <code>None</code> — the function returned nothing. A function with no <code>return</code> always gives back <code>None</code>.</p><p>The rule: <strong>return the value, and let the caller decide whether to print it.</strong> That makes the function reusable.</p>",
        ),
        text(
          "<h3>return ends the function immediately</h3><p>Nothing after it runs:</p>",
        ),
        py(
          'def check(age):\n    if age < 18:\n        return "Too young"\n    return "Allowed"\n\nprint(check(15))\nprint(check(30))',
        ),
        out("Too young\nAllowed"),
        text(
          "<p>No <code>else</code> is needed. When the first <code>return</code> runs, the function is over.</p><p>This makes it easy to leave early when the work cannot continue:</p>",
        ),
        py(
          'def divide(a, b):\n    if b == 0:\n        return None\n    return a / b\n\nprint(divide(10, 2))\nprint(divide(10, 0))',
        ),
        out("5.0\nNone"),
        text(
          "<h3>Returning several values</h3><p>List them after <code>return</code>, separated by commas. Python packs them into a tuple, and the caller can unpack them:</p>",
        ),
        py(
          "def statistics(numbers):\n    return min(numbers), max(numbers), sum(numbers) / len(numbers)\n\nlowest, highest, average = statistics([12, 5, 30, 8])\n\nprint(lowest)\nprint(highest)\nprint(average)",
        ),
        out("5\n30\n13.75"),
        text(
          "<h3>Returning a boolean</h3><p>A function that answers a yes-or-no question should return the boolean directly:</p>",
        ),
        py(
          "def is_even(number):\n    return number % 2 == 0\n\nprint(is_even(4))\nprint(is_even(7))\n\nif is_even(10):\n    print(\"10 is even\")",
        ),
        out("True\nFalse\n10 is even"),
        text(
          "<p>Do not write <code>if number % 2 == 0: return True else: return False</code>. The comparison already <em>is</em> the boolean.</p>",
        ),
        text(
          "<h3>Putting it together</h3>",
        ),
        py(
          'def calculate_total(price, quantity, discount=0):\n    total = price * quantity\n    total = total - (total * discount)\n    return total\n\ndef format_money(amount):\n    return f"{amount:,.0f} RWF"\n\ntotal = calculate_total(1200, 3, discount=0.1)\nprint(format_money(total))',
        ),
        out("3,240 RWF"),
        text(
          "<p>Each function does one job and returns its result. Neither prints anything. That is why they can be combined on the last line.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>return</code> hands a value back to the caller; <code>print</code> only shows it.</p></li><li><p>A function with no <code>return</code> gives back <code>None</code>.</p></li><li><p><code>return</code> ends the function at once, which removes the need for <code>else</code>.</p></li><li><p>Several values after <code>return</code> become a tuple, which the caller can unpack.</p></li><li><p>Return the comparison itself for a yes-or-no function.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Return Values",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the difference between print and return?",
            options: [
              "print shows a value; return hands it back to the caller to use",
              "They do the same thing",
              "return shows a value; print stores it",
              "print can only be used inside functions",
            ],
            correct: [0],
          },
          {
            text: "What does a function with no return statement give back?",
            options: ["None", "0", "An empty string", "False"],
            correct: [0],
          },
          {
            text: "What happens to code written after a return that runs?",
            options: [
              "It never runs — return ends the function immediately",
              "It runs after the value is sent back",
              "It runs only if there is no else",
              "It raises a SyntaxError",
            ],
            correct: [0],
          },
          {
            text: "def f(): return 1, 2 — what type is the result?",
            options: ["A tuple", "A list", "Two separate values", "A set"],
            correct: [0],
          },
          {
            text: "What is the best body for is_even(number)?",
            options: [
              "return number % 2 == 0",
              "if number % 2 == 0: return True else: return False",
              "print(number % 2 == 0)",
              "return number % 2",
            ],
            correct: [0],
          },
          {
            text: "Why is returning better than printing inside a function?",
            options: [
              "The caller can store, combine or reuse the value instead of only seeing it",
              "print is slower",
              "return automatically formats the value",
              "print cannot be used inside functions",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Scope and Writing Good Functions",
      blocks: [
        text(
          "<h2>Where a variable exists</h2><p><strong>Scope</strong> means the part of a program where a name can be used. A variable created inside a function exists only inside it. It disappears when the function ends:</p>",
        ),
        py(
          'def calculate():\n    result = 42\n    print(result)\n\ncalculate()\nprint(result)',
        ),
        out("42\nNameError: name 'result' is not defined"),
        text(
          "<p><code>result</code> is a <strong>local</strong> variable. This is a feature, not a limitation: it means a function cannot accidentally break the rest of your program.</p>",
        ),
        text(
          "<h3>Reading from outside</h3><p>A function can read a variable defined outside it, called a <strong>global</strong> variable:</p>",
        ),
        py(
          'TAX_RATE = 0.18\n\ndef add_tax(amount):\n    return amount * (1 + TAX_RATE)\n\nprint(add_tax(1000))',
        ),
        out("1180.0"),
        text(
          "<p>This is fine for constants that never change. For anything else, pass it as a parameter — a function that depends on hidden outside values is hard to test and hard to move.</p>",
        ),
        text(
          "<h3>Assigning creates a new local variable</h3><p>Assigning inside a function does not change the outside one. It makes a separate local variable that happens to share the name:</p>",
        ),
        py(
          'count = 10\n\ndef increase():\n    count = 99\n    print("inside:", count)\n\nincrease()\nprint("outside:", count)',
        ),
        out("inside: 99\noutside: 10"),
        text(
          "<p>Python does have a <code>global</code> keyword to change the outer variable, but you should almost never need it. Return the new value instead:</p>",
        ),
        py(
          'count = 10\n\ndef increased(value):\n    return value + 89\n\ncount = increased(count)\nprint(count)',
        ),
        out("99"),
        text(
          "<h3>Mutable arguments are a real exception</h3><p>Rebinding a name inside a function does not affect the caller. But <em>changing</em> a mutable object does, because both names point at the same object:</p>",
        ),
        py(
          'def add_item(basket):\n    basket.append("pen")\n\nmy_basket = []\nadd_item(my_basket)\nprint(my_basket)',
        ),
        out("['pen']"),
        text(
          "<p>The list outside was changed. This is the same behaviour you saw in module 8 with <code>b = a</code>. It is useful when you mean it, and a nasty surprise when you do not. If a function should not change what it receives, work on a copy.</p>",
        ),
        text(
          "<h3>Docstrings</h3><p>A string on the first line of a function body is a <strong>docstring</strong>. It explains what the function does, and tools can read it:</p>",
        ),
        py(
          'def calculate_total(price, quantity, discount=0):\n    """Return the total for an order.\n\n    discount is a fraction, so 0.1 means 10 percent off.\n    """\n    total = price * quantity\n    return total - (total * discount)\n\nprint(calculate_total.__doc__)',
        ),
        text(
          "<h3>What makes a good function</h3><ul><li><p><strong>One job.</strong> If the name needs the word \"and\", it is probably two functions.</p></li><li><p><strong>A clear name.</strong> A verb for an action (<code>send_email</code>), a question for a boolean (<code>is_valid</code>).</p></li><li><p><strong>Few parameters.</strong> Beyond three or four, group them into a dictionary or reconsider the design.</p></li><li><p><strong>Return, do not print.</strong> Printing decides for the caller how the value is used.</p></li><li><p><strong>No surprises.</strong> Same arguments should give the same result, and it should not quietly change things the caller did not expect.</p></li></ul>",
        ),
        text(
          "<h3>A refactoring example</h3><p>This does too much at once:</p>",
        ),
        py(
          'def process():\n    price = float(input("Price: "))\n    quantity = int(input("Quantity: "))\n    total = price * quantity\n    if total > 10000:\n        total = total * 0.9\n    print(f"Total: {total:,.0f} RWF")',
        ),
        text("<p>Split by job, and each piece becomes testable on its own:</p>"),
        py(
          'def apply_bulk_discount(total):\n    """Give 10 percent off orders above 10,000."""\n    if total > 10000:\n        return total * 0.9\n    return total\n\ndef calculate_total(price, quantity):\n    return apply_bulk_discount(price * quantity)\n\ndef format_money(amount):\n    return f"{amount:,.0f} RWF"\n\nprice = float(input("Price: "))\nquantity = int(input("Quantity: "))\nprint(format_money(calculate_total(price, quantity)))',
        ),
        out("Price: 1200\nQuantity: 10\nTotal is printed as: 10,800 RWF"),
        text(
          "<p>Now the discount rule can be checked without typing anything, and the input handling is separate from the calculation.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A variable made inside a function is local and disappears when it ends.</p></li><li><p>A function can read outer variables, but assigning creates a new local one.</p></li><li><p>Changing a mutable argument does affect the caller.</p></li><li><p>A docstring is the first string in the body and explains the function.</p></li><li><p>Good functions do one job, have clear names, and return rather than print.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Scope",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What happens to a variable created inside a function when the function ends?",
            options: [
              "It disappears — it is local to the function",
              "It stays available to the whole program",
              "It is saved to a file",
              "It becomes None",
            ],
            correct: [0],
          },
          {
            text: "count = 10 outside; a function assigns count = 99 inside. What is count outside afterwards?",
            options: [
              "10 — the assignment created a separate local variable",
              "99",
              "None",
              "A NameError is raised",
            ],
            correct: [0],
          },
          {
            text: "A function calls basket.append(\"pen\") on a list passed in. Does the caller's list change?",
            options: [
              "Yes — both names point at the same list object",
              "No — arguments are always copied",
              "Only if the global keyword is used",
              "Only for lists of strings",
            ],
            correct: [0],
          },
          {
            text: "What is a docstring?",
            options: [
              "A string on the first line of a function body that explains what it does",
              "A comment starting with ###",
              "A required type declaration",
              "The function's return value",
            ],
            correct: [0],
          },
          {
            text: "Which are signs of a well-written function?",
            options: [
              "It does one job",
              "Its name says what it does",
              "It returns its result instead of printing it",
              "It uses global variables so callers pass fewer arguments",
            ],
            correct: [0, 1, 2],
          },
          {
            text: "Instead of using the global keyword to update an outer variable, what should you normally do?",
            options: [
              "Return the new value and assign it at the call site",
              "Use a longer variable name",
              "Define the function inside another function",
              "Print the value instead",
            ],
            correct: [0],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 9 Test: Functions",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "Which line correctly defines a function taking one parameter?",
        options: [
          "def greet(name):",
          "function greet(name):",
          "def greet[name]:",
          "def greet(name)",
        ],
        correct: [0],
      },
      {
        text: "def f(): print(1) — what does x = f() put in x?",
        options: ["None", "1", "The function itself", "An empty string"],
        correct: [0],
      },
      {
        text: "Which statements about return are true?",
        options: [
          "It ends the function immediately",
          "It sends a value back to the caller",
          "Several values after it become a tuple",
          "It also prints the value",
        ],
        correct: [0, 1, 2],
      },
      {
        text: "What is wrong with def add(item, basket=[])?",
        options: [
          "The default list is created once and shared by every call",
          "Lists cannot be parameters",
          "The parameter order is invalid",
          "Nothing is wrong",
        ],
        correct: [0],
      },
      {
        text: "In describe(name, age), what does describe(36, \"Ada\") do?",
        options: [
          "Runs with the values swapped, because arguments match by position",
          "Raises a TypeError",
          "Corrects the order automatically by type",
          "Raises a SyntaxError",
        ],
        correct: [0],
      },
      {
        text: "How do you make the order of arguments not matter in a call?",
        options: [
          "Name them: describe(age=36, name=\"Ada\")",
          "Put them in a list",
          "Sort them alphabetically",
          "It is not possible",
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
      {
        text: "Why should a function return rather than print its result?",
        options: [
          "So the caller can store, combine or reuse the value",
          "Because print is not allowed inside functions",
          "Because return runs faster",
          "Because printing changes the value's type",
        ],
        correct: [0],
      },
      {
        text: "Where must a function be defined relative to the code that calls it?",
        options: [
          "Before it, because Python reads the file from the top",
          "After it",
          "In a separate file only",
          "The position does not matter",
        ],
        correct: [0],
      },
    ],
  },
};
