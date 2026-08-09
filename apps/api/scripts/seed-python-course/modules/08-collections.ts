import type { Module } from "../types";
import { text, py, out } from "../types";

export const collections: Module = {
  title: "Lists, Tuples, Sets and Dictionaries",
  lessons: [
    {
      title: "Lists: Creating and Reading",
      blocks: [
        text(
          "<h2>Holding many values under one name</h2><p>A <strong>list</strong> holds several values in order, under a single name. You write it with square brackets and commas:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\nprices = [1200, 800, 3500]\nempty = []\n\nprint(names)\nprint(len(names))',
        ),
        out("['Ada', 'Alan', 'Grace']\n3"),
        text(
          "<p>A list can hold values of different types, although in practice most lists hold one kind of thing:</p>",
        ),
        py('mixed = ["Ada", 36, True, 3.5]\nprint(mixed)'),
        out("['Ada', 36, True, 3.5]"),
        text(
          "<h3>Reading items</h3><p>Indexing works exactly as it does for strings. Positions start at 0, and negative numbers count from the end:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\n\nprint(names[0])\nprint(names[2])\nprint(names[-1])',
        ),
        out("Ada\nGrace\nGrace"),
        text("<p>An index past the end raises an error:</p>"),
        py('names = ["Ada", "Alan", "Grace"]\nprint(names[3])'),
        out("IndexError: list index out of range"),
        text(
          "<p>The last valid index is always <code>len(list) - 1</code>. That is why <code>names[-1]</code> is the safer way to reach the last item.</p>",
        ),
        text(
          "<h3>Slicing</h3><p>Slices work the same way as with strings, and they produce a new list:</p>",
        ),
        py(
          'numbers = [10, 20, 30, 40, 50]\n\nprint(numbers[1:3])\nprint(numbers[:2])\nprint(numbers[2:])\nprint(numbers[::-1])',
        ),
        out("[20, 30]\n[10, 20]\n[30, 40, 50]\n[50, 40, 30, 20, 10]"),
        text(
          "<h3>Checking membership</h3><p><code>in</code> asks whether a value is present:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\n\nprint("Ada" in names)\nprint("Bob" in names)\nprint("Bob" not in names)',
        ),
        out("True\nFalse\nTrue"),
        text(
          "<h3>Looping over a list</h3><p>This is the most common thing you will do with one:</p>",
        ),
        py(
          'prices = [1200, 800, 3500]\n\nfor price in prices:\n    print(f"{price:,} RWF")',
        ),
        out("1,200 RWF\n800 RWF\n3,500 RWF"),
        text(
          "<h3>Lists inside lists</h3><p>An item can itself be a list. Use two sets of brackets to reach inside:</p>",
        ),
        py(
          'grid = [[1, 2, 3], [4, 5, 6]]\n\nprint(grid[0])\nprint(grid[0][2])\nprint(grid[1][0])',
        ),
        out("[1, 2, 3]\n3\n4"),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A list is written with square brackets and holds values in order.</p></li><li><p><code>len(list)</code> gives the number of items.</p></li><li><p>Indexing starts at 0; <code>-1</code> is the last item.</p></li><li><p>Slicing produces a new list.</p></li><li><p><code>in</code> tests membership; a <code>for</code> loop walks every item.</p></li><li><p>Lists can be nested, reached with <code>grid[row][column]</code>.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Reading Lists",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: 'For names = ["Ada", "Alan", "Grace"], what is names[1]?',
            options: ["Alan", "Ada", "Grace", "An IndexError"],
            correct: [0],
          },
          {
            text: "What is the last valid index of a list with 4 items?",
            options: ["3", "4", "-4", "5"],
            correct: [0],
          },
          {
            text: "What does [10, 20, 30, 40][1:3] give?",
            options: ["[20, 30]", "[20, 30, 40]", "[10, 20]", "[30, 40]"],
            correct: [0],
          },
          {
            text: 'What does "Bob" in ["Ada", "Alan"] return?',
            options: ["False", "True", "-1", "An error"],
            correct: [0],
          },
          {
            text: "For grid = [[1, 2], [3, 4]], what is grid[1][0]?",
            options: ["3", "2", "1", "4"],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Changing Lists",
      blocks: [
        text(
          "<h2>Lists can be changed</h2><p>This is the big difference from strings. A list is <strong>mutable</strong>: you can change it after it is created, and it stays the same list.</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\nnames[1] = "Alonzo"\nprint(names)',
        ),
        out("['Ada', 'Alonzo', 'Grace']"),
        text(
          "<h3>Adding items</h3><p><code>append</code> adds one item to the end. <code>insert</code> puts one at a chosen position. <code>extend</code> adds every item from another list:</p>",
        ),
        py(
          'names = ["Ada"]\n\nnames.append("Alan")\nprint(names)\n\nnames.insert(0, "Grace")\nprint(names)\n\nnames.extend(["Katherine", "Dorothy"])\nprint(names)',
        ),
        out(
          "['Ada', 'Alan']\n['Grace', 'Ada', 'Alan']\n['Grace', 'Ada', 'Alan', 'Katherine', 'Dorothy']",
        ),
        text(
          "<p>Watch the difference between <code>append</code> and <code>extend</code>. <code>append</code> adds its argument as a single item, even when that argument is a list:</p>",
        ),
        py(
          'a = [1, 2]\na.append([3, 4])\nprint(a)\n\nb = [1, 2]\nb.extend([3, 4])\nprint(b)',
        ),
        out("[1, 2, [3, 4]]\n[1, 2, 3, 4]"),
        text(
          "<h3>Removing items</h3><p><code>remove</code> deletes the first matching value. <code>pop</code> deletes by position and hands the item back to you. <code>del</code> deletes by position without returning it:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace", "Alan"]\n\nnames.remove("Alan")\nprint(names)\n\nlast = names.pop()\nprint(last, names)\n\ndel names[0]\nprint(names)',
        ),
        out(
          "['Ada', 'Grace', 'Alan']\nAlan ['Ada', 'Grace']\n['Grace']",
        ),
        text(
          "<p><code>remove</code> only removes the <em>first</em> match, and raises a <code>ValueError</code> if the value is not there at all.</p>",
        ),
        text(
          "<h3>Sorting</h3><p><code>sort</code> reorders the list in place and returns nothing. <code>sorted</code> leaves the original alone and returns a new list:</p>",
        ),
        py(
          "numbers = [30, 10, 20]\n\nnumbers.sort()\nprint(numbers)\n\nnumbers.sort(reverse=True)\nprint(numbers)",
        ),
        out("[10, 20, 30]\n[30, 20, 10]"),
        py(
          "original = [30, 10, 20]\nnew_list = sorted(original)\n\nprint(new_list)\nprint(original)",
        ),
        out("[10, 20, 30]\n[30, 10, 20]"),
        text(
          "<p>A common mistake is writing <code>numbers = numbers.sort()</code>. <code>sort</code> returns <code>None</code>, so that line throws the list away:</p>",
        ),
        py("numbers = [30, 10, 20]\nnumbers = numbers.sort()\nprint(numbers)"),
        out("None"),
        text(
          "<h3>Two names for one list</h3><p>Assigning a list to another name does <strong>not</strong> copy it. Both names point at the same list:</p>",
        ),
        py(
          'a = [1, 2, 3]\nb = a\n\nb.append(4)\nprint(a)\nprint(b)',
        ),
        out("[1, 2, 3, 4]\n[1, 2, 3, 4]"),
        text(
          "<p>Changing <code>b</code> changed <code>a</code>, because there is only one list. To get a real copy, use a full slice or the <code>copy</code> method:</p>",
        ),
        py(
          'a = [1, 2, 3]\nb = a.copy()\n\nb.append(4)\nprint(a)\nprint(b)',
        ),
        out("[1, 2, 3]\n[1, 2, 3, 4]"),
        text(
          "<p>This surprises almost everyone once. If a function seems to change a list you did not expect it to touch, this is usually why.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Lists are mutable — items can be replaced, added and removed.</p></li><li><p><code>append</code> adds one item; <code>extend</code> adds every item of another list.</p></li><li><p><code>remove</code> deletes by value, <code>pop</code> by position and returns it.</p></li><li><p><code>sort</code> changes the list and returns <code>None</code>; <code>sorted</code> returns a new list.</p></li><li><p><code>b = a</code> makes a second name for the same list. Use <code>a.copy()</code> for a real copy.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Changing Lists",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What does a.append([3, 4]) do to a = [1, 2]?",
            options: [
              "Makes it [1, 2, [3, 4]] — the list is added as one item",
              "Makes it [1, 2, 3, 4]",
              "Raises a TypeError",
              "Makes it [[3, 4], 1, 2]",
            ],
            correct: [0],
          },
          {
            text: "What does numbers.sort() return?",
            options: [
              "None — it sorts the list in place",
              "A new sorted list",
              "The first item",
              "The number of items",
            ],
            correct: [0],
          },
          {
            text: "After a = [1, 2]; b = a; b.append(3), what is a?",
            options: [
              "[1, 2, 3] — both names point at the same list",
              "[1, 2] — b is a copy",
              "None",
              "A TypeError is raised",
            ],
            correct: [0],
          },
          {
            text: "How do you make a real copy of a list?",
            options: [
              "a.copy() or a[:]",
              "b = a",
              "copy a",
              "a.clone()",
            ],
            correct: [0],
          },
          {
            text: "What does pop() do that del does not?",
            options: [
              "It returns the removed item",
              "It removes by value instead of position",
              "It removes every match",
              "It sorts the list first",
            ],
            correct: [0],
          },
          {
            text: "Which methods change the original list?",
            options: ["append", "sort", "remove", "sorted"],
            correct: [0, 1, 2],
          },
        ],
      },
    },
    {
      title: "Tuples and Sets",
      blocks: [
        text(
          "<h2>Tuples: lists that cannot change</h2><p>A <strong>tuple</strong> holds values in order like a list, but it is <strong>immutable</strong> — once created it can never be changed. You write it with round brackets:</p>",
        ),
        py(
          'point = (3, 7)\ncolours = ("red", "green", "blue")\n\nprint(point[0])\nprint(len(colours))\nprint("red" in colours)',
        ),
        out("3\n3\nTrue"),
        text("<p>Trying to change one fails:</p>"),
        py("point = (3, 7)\npoint[0] = 5"),
        out("TypeError: 'tuple' object does not support item assignment"),
        text(
          "<h3>Why use a tuple at all?</h3><p>Because \"cannot change\" is sometimes exactly what you want. A tuple says to the reader: these values belong together and are fixed. Coordinates, a date as (year, month, day), or a database row all fit.</p><p>Tuples are also what Python uses when a function returns several values:</p>",
        ),
        py(
          "def get_size():\n    return 1920, 1080\n\nresult = get_size()\nprint(result)\n\nwidth, height = get_size()\nprint(width, height)",
        ),
        out("(1920, 1080)\n1920 1080"),
        text(
          "<p>That second form is called <strong>unpacking</strong>: the values are taken out of the tuple and given to several names at once.</p>",
        ),
        text(
          "<h3>The one-item trap</h3><p>A tuple with one item needs a trailing comma. Without it, the brackets are just ordinary brackets:</p>",
        ),
        py(
          'not_a_tuple = ("hello")\nreal_tuple = ("hello",)\n\nprint(type(not_a_tuple))\nprint(type(real_tuple))',
        ),
        out("<class 'str'>\n<class 'tuple'>"),
        text(
          "<h2>Sets: no order, no duplicates</h2><p>A <strong>set</strong> holds values with two rules: there is no order, and no value can appear twice. You write it with curly brackets:</p>",
        ),
        py(
          'colours = {"red", "green", "blue", "red"}\nprint(colours)\nprint(len(colours))',
        ),
        out("{'blue', 'green', 'red'}\n3"),
        text(
          "<p>The duplicate <code>\"red\"</code> was dropped, and the printed order is not the order you typed. Because there is no order, a set cannot be indexed:</p>",
        ),
        py('colours = {"red", "green"}\nprint(colours[0])'),
        out("TypeError: 'set' object is not subscriptable"),
        text(
          "<h3>Removing duplicates</h3><p>This is the most common use of a set. Convert a list to a set and back:</p>",
        ),
        py(
          'emails = ["a@x.com", "b@x.com", "a@x.com", "c@x.com"]\nunique = list(set(emails))\n\nprint(len(emails))\nprint(len(unique))',
        ),
        out("4\n3"),
        text(
          "<p>Remember that this loses the original order. If order matters, keep the list and check membership as you go.</p>",
        ),
        text(
          "<h3>Comparing groups</h3><p>Sets can answer questions about what two groups share:</p>",
        ),
        py(
          'monday = {"Ada", "Alan", "Grace"}\ntuesday = {"Grace", "Katherine"}\n\nprint(monday & tuesday)\nprint(monday | tuesday)\nprint(monday - tuesday)',
        ),
        out(
          "{'Grace'}\n{'Ada', 'Alan', 'Grace', 'Katherine'}\n{'Ada', 'Alan'}",
        ),
        text(
          "<p><code>&amp;</code> gives what is in both, <code>|</code> gives everything from either, and <code>-</code> gives what is in the first but not the second. Doing this with loops would take many more lines.</p>",
        ),
        text(
          "<h3>Choosing between them</h3><ul><li><p><strong>List</strong> — order matters, duplicates allowed, you will change it.</p></li><li><p><strong>Tuple</strong> — order matters, must not change.</p></li><li><p><strong>Set</strong> — order does not matter, duplicates must be removed, you test membership often.</p></li></ul>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A tuple uses round brackets and cannot be changed.</p></li><li><p>A one-item tuple needs a trailing comma: <code>(\"hello\",)</code>.</p></li><li><p>Unpacking spreads a tuple across several names.</p></li><li><p>A set uses curly brackets, has no order and no duplicates.</p></li><li><p><code>list(set(items))</code> removes duplicates but loses the order.</p></li><li><p><code>&amp;</code>, <code>|</code> and <code>-</code> compare two sets.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Tuples and Sets",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What is the main difference between a list and a tuple?",
            options: [
              "A tuple cannot be changed after it is created",
              "A tuple cannot hold strings",
              "A tuple has no order",
              "A tuple removes duplicates",
            ],
            correct: [0],
          },
          {
            text: 'What is the type of ("hello")?',
            options: [
              "str — a one-item tuple needs a trailing comma",
              "tuple",
              "list",
              "set",
            ],
            correct: [0],
          },
          {
            text: 'What does {"red", "green", "red"} contain?',
            options: [
              "Two items, because a set drops duplicates",
              "Three items",
              "One item",
              "Nothing — this raises an error",
            ],
            correct: [0],
          },
          {
            text: "Why can you not write my_set[0]?",
            options: [
              "A set has no order, so there is no position 0",
              "Sets can only hold numbers",
              "You must use round brackets instead",
              "Sets are immutable",
            ],
            correct: [0],
          },
          {
            text: "What does list(set(items)) do?",
            options: [
              "Removes duplicates, but loses the original order",
              "Sorts the list",
              "Removes duplicates and keeps the original order",
              "Converts every item to text",
            ],
            correct: [0],
          },
          {
            text: "What does a & b give for two sets?",
            options: [
              "The values found in both sets",
              "Everything from either set",
              "The values in a but not b",
              "True or False",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Dictionaries",
      blocks: [
        text(
          "<h2>Storing values by name</h2><p>A list finds things by position. A <strong>dictionary</strong> finds them by a <strong>key</strong> you choose. Each entry is a key and a value, written <code>key: value</code>:</p>",
        ),
        py(
          'student = {\n    "name": "Ada",\n    "age": 36,\n    "city": "Kigali"\n}\n\nprint(student["name"])\nprint(student["age"])',
        ),
        out("Ada\n36"),
        text(
          "<p>Compare that with a list, where you would have to remember that position 0 is the name and position 1 is the age. The dictionary says what each value means.</p>",
        ),
        text(
          "<h3>A missing key is an error</h3>",
        ),
        py('student = {"name": "Ada"}\nprint(student["email"])'),
        out("KeyError: 'email'"),
        text(
          "<p><code>get</code> avoids the crash. It returns <code>None</code> when the key is missing, or a default value you supply:</p>",
        ),
        py(
          'student = {"name": "Ada"}\n\nprint(student.get("email"))\nprint(student.get("email", "not given"))',
        ),
        out("None\nnot given"),
        text(
          "<p>Use square brackets when the key must exist, and <code>get</code> when it might not.</p>",
        ),
        text(
          "<h3>Adding and changing</h3><p>Assigning to a key sets it. If the key is new it is added; if it already exists the value is replaced:</p>",
        ),
        py(
          'student = {"name": "Ada"}\n\nstudent["city"] = "Kigali"\nstudent["name"] = "Ada Lovelace"\n\nprint(student)',
        ),
        out("{'name': 'Ada Lovelace', 'city': 'Kigali'}"),
        text("<p>Remove an entry with <code>pop</code> or <code>del</code>:</p>"),
        py(
          'student = {"name": "Ada", "city": "Kigali", "age": 36}\n\nremoved = student.pop("age")\nprint(removed)\n\ndel student["city"]\nprint(student)',
        ),
        out("36\n{'name': 'Ada'}"),
        text(
          "<h3>Checking for a key</h3><p><code>in</code> looks at the keys, not the values:</p>",
        ),
        py(
          'student = {"name": "Ada", "city": "Kigali"}\n\nprint("name" in student)\nprint("Ada" in student)\nprint("Ada" in student.values())',
        ),
        out("True\nFalse\nTrue"),
        text(
          "<h3>Looping over a dictionary</h3><p>Looping directly gives you the keys. <code>items</code> gives the key and the value together, which is usually what you want:</p>",
        ),
        py(
          'student = {"name": "Ada", "age": 36, "city": "Kigali"}\n\nfor key in student:\n    print(key)\n\nprint("---")\n\nfor key, value in student.items():\n    print(f"{key}: {value}")',
        ),
        out(
          "name\nage\ncity\n---\nname: Ada\nage: 36\ncity: Kigali",
        ),
        text(
          "<p><code>keys()</code> and <code>values()</code> give each side on its own when you only need one.</p>",
        ),
        text(
          "<h3>Rules for keys</h3><p>A key must be immutable, so strings, numbers and tuples work. A list cannot be a key:</p>",
        ),
        py('bad = {[1, 2]: "value"}'),
        out("TypeError: unhashable type: 'list'"),
        text(
          "<p>Keys are also unique. Writing the same key twice keeps only the last value.</p>",
        ),
        text(
          "<h3>Counting with a dictionary</h3><p>A very common real pattern — count how often each value appears:</p>",
        ),
        py(
          'words = ["apple", "fig", "apple", "kiwi", "fig", "apple"]\ncounts = {}\n\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\n\nprint(counts)',
        ),
        out("{'apple': 3, 'fig': 2, 'kiwi': 1}"),
        text(
          "<p>The trick is <code>counts.get(word, 0)</code>. The first time a word appears it is not in the dictionary yet, so <code>get</code> returns 0 and the count becomes 1.</p>",
        ),
        text(
          "<h3>Dictionaries inside dictionaries</h3><p>Values can be lists or other dictionaries, which is how most real data is shaped:</p>",
        ),
        py(
          'course = {\n    "title": "Python for Beginners",\n    "modules": ["Basics", "Loops", "Functions"],\n    "teacher": {"name": "Ada", "email": "ada@example.com"}\n}\n\nprint(course["modules"][1])\nprint(course["teacher"]["email"])',
        ),
        out("Loops\nada@example.com"),
        text(
          "<hr><h3>Summary</h3><ul><li><p>A dictionary stores <code>key: value</code> pairs in curly brackets.</p></li><li><p><code>d[key]</code> raises a <code>KeyError</code> if the key is missing; <code>d.get(key, default)</code> does not.</p></li><li><p>Assigning to a key adds it or replaces it.</p></li><li><p><code>in</code> checks the keys; use <code>.values()</code> to check values.</p></li><li><p><code>.items()</code> gives the key and value together in a loop.</p></li><li><p>Keys must be immutable and unique.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Dictionaries",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "How does a dictionary find a value?",
            options: [
              "By a key you choose",
              "By its position, starting at 0",
              "By searching every value",
              "Alphabetically",
            ],
            correct: [0],
          },
          {
            text: 'What happens with student["email"] when the key does not exist?',
            options: [
              "A KeyError is raised",
              "None is returned",
              "An empty string is returned",
              "The key is created with value None",
            ],
            correct: [0],
          },
          {
            text: 'What does student.get("email", "none") return when the key is missing?',
            options: ['"none"', "None", "A KeyError", "An empty string"],
            correct: [0],
          },
          {
            text: 'For d = {"name": "Ada"}, what is "Ada" in d?',
            options: [
              "False — in checks the keys, not the values",
              "True",
              "A KeyError",
              "None",
            ],
            correct: [0],
          },
          {
            text: "What does .items() give you in a for loop?",
            options: [
              "The key and the value together",
              "Only the keys",
              "Only the values",
              "The number of entries",
            ],
            correct: [0],
          },
          {
            text: "Why does counts[word] = counts.get(word, 0) + 1 work for counting?",
            options: [
              "get returns 0 the first time a word is seen, so the count starts at 1",
              "get always returns 1",
              "Dictionaries count automatically",
              "It only works if every key is already present",
            ],
            correct: [0],
          },
          {
            text: "Which can be used as a dictionary key?",
            options: ["A string", "A number", "A tuple", "A list"],
            correct: [0, 1, 2],
          },
        ],
      },
    },
    {
      title: "Choosing the Right Collection",
      blocks: [
        text(
          "<h2>Four types, four jobs</h2><p>You now know four ways to hold several values. Picking the right one makes the rest of the program simpler.</p><ul><li><p><strong>List</strong> <code>[ ]</code> — ordered, changeable, duplicates allowed.</p></li><li><p><strong>Tuple</strong> <code>( )</code> — ordered, fixed, duplicates allowed.</p></li><li><p><strong>Set</strong> <code>{ }</code> — no order, no duplicates.</p></li><li><p><strong>Dictionary</strong> <code>{key: value}</code> — values found by key.</p></li></ul>",
        ),
        text(
          "<h3>Questions that pick the type for you</h3><ol><li><p><em>Do I look things up by a name?</em> → dictionary.</p></li><li><p><em>Must duplicates disappear?</em> → set.</p></li><li><p><em>Must this never change?</em> → tuple.</p></li><li><p><em>Otherwise</em> → list.</p></li></ol>",
        ),
        text(
          "<h3>The same data, four ways</h3><p>Say you are storing which students attended a class.</p><p>A list keeps the order they arrived, and would keep a duplicate if someone was recorded twice:</p>",
        ),
        py(
          'attended = ["Ada", "Alan", "Grace", "Ada"]\nprint(len(attended))\nprint(attended[0])',
        ),
        out("4\nAda"),
        text("<p>A set answers \"who was here\" with no duplicates:</p>"),
        py(
          'attended = {"Ada", "Alan", "Grace", "Ada"}\nprint(len(attended))\nprint("Grace" in attended)',
        ),
        out("3\nTrue"),
        text("<p>A dictionary can store how many times each one attended:</p>"),
        py(
          'attendance = {"Ada": 2, "Alan": 1, "Grace": 1}\nprint(attendance["Ada"])',
        ),
        out("2"),
        text(
          "<h3>Membership tests: sets are much faster</h3><p>Checking <code>x in list</code> looks at every item one by one. Checking <code>x in set</code> jumps straight to the answer. For a handful of items you will not notice. For thousands, checked in a loop, the difference is large.</p><p>If your program mostly asks \"is this value present?\", store the values in a set.</p>",
        ),
        text(
          "<h3>Converting between them</h3><p>Each type has a function that builds it from another:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Ada"]\n\nprint(set(names))\nprint(tuple(names))\nprint(list(set(names)))\n\npairs = [("a", 1), ("b", 2)]\nprint(dict(pairs))',
        ),
        out(
          "{'Ada', 'Alan'}\n('Ada', 'Alan', 'Ada')\n['Alan', 'Ada']\n{'a': 1, 'b': 2}",
        ),
        text(
          "<h3>Useful functions that work on all of them</h3>",
        ),
        py(
          "numbers = [12, 5, 30, 8]\n\nprint(len(numbers))\nprint(sum(numbers))\nprint(min(numbers))\nprint(max(numbers))\nprint(sorted(numbers))",
        ),
        out("4\n55\n5\n30\n[5, 8, 12, 30]"),
        text(
          "<p><code>sum</code>, <code>min</code> and <code>max</code> save you from writing the loop patterns from module 7 by hand. Write the loop when you need something they cannot do; use them when they fit.</p>",
        ),
        text(
          "<h3>A worked example</h3><p>Counting unique visitors per day, using all four types together:</p>",
        ),
        py(
          'visits = [\n    ("Monday", "ada"),\n    ("Monday", "alan"),\n    ("Monday", "ada"),\n    ("Tuesday", "grace"),\n]\n\nper_day = {}\n\nfor day, user in visits:\n    if day not in per_day:\n        per_day[day] = set()\n    per_day[day].add(user)\n\nfor day, users in per_day.items():\n    print(f"{day}: {len(users)} unique visitors")',
        ),
        out("Monday: 2 unique visitors\nTuesday: 1 unique visitors"),
        text(
          "<p>The list holds the raw records in order. Each record is a tuple, because a visit never changes. The dictionary groups by day. The set inside removes repeat visits automatically — no <code>if user not in</code> check needed.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>List for ordered, changeable data; tuple when it must not change.</p></li><li><p>Set when duplicates must go and membership is tested often.</p></li><li><p>Dictionary when values are found by a name.</p></li><li><p><code>list()</code>, <code>tuple()</code>, <code>set()</code> and <code>dict()</code> convert between them.</p></li><li><p><code>len</code>, <code>sum</code>, <code>min</code>, <code>max</code> and <code>sorted</code> work across these types.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Choosing a Collection",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "You need to look up a phone number by a person's name. Which type fits?",
            options: ["Dictionary", "List", "Set", "Tuple"],
            correct: [0],
          },
          {
            text: "You need a collection of email addresses with no repeats. Which type fits?",
            options: ["Set", "List", "Tuple", "Dictionary"],
            correct: [0],
          },
          {
            text: "You have a pair of coordinates that must never change. Which type fits?",
            options: ["Tuple", "List", "Set", "Dictionary"],
            correct: [0],
          },
          {
            text: "Why is x in my_set faster than x in my_list for large collections?",
            options: [
              "A set jumps straight to the answer, while a list checks every item in turn",
              "Sets are stored on disk",
              "Lists are always sorted first",
              "There is no difference",
            ],
            correct: [0],
          },
          {
            text: "What does sum([12, 5, 30]) return?",
            options: ["47", "30", "3", "[12, 5, 30]"],
            correct: [0],
          },
          {
            text: "Which of these keep their items in order?",
            options: ["List", "Tuple", "Set", "A set converted with list()"],
            correct: [0, 1],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 8 Test: Collections",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "Which brackets create each type?",
        options: [
          "[ ] list, ( ) tuple, { } set or dictionary",
          "( ) list, [ ] tuple, { } set",
          "{ } list, [ ] set, ( ) dictionary",
          "All types use [ ]",
        ],
        correct: [0],
      },
      {
        text: "What is the result of [1, 2, 3][-1]?",
        options: ["3", "1", "2", "An IndexError"],
        correct: [0],
      },
      {
        text: "After a = [1, 2]; b = a; b.append(3), what does a hold?",
        options: ["[1, 2, 3]", "[1, 2]", "[3]", "None"],
        correct: [0],
      },
      {
        text: "Which statements about sets are true?",
        options: [
          "They drop duplicate values",
          "They have no order",
          "They cannot be indexed",
          "They keep items in the order you typed them",
        ],
        correct: [0, 1, 2],
      },
      {
        text: 'What does {"a": 1}.get("b", 0) return?',
        options: ["0", "None", "A KeyError", "1"],
        correct: [0],
      },
      {
        text: "Which method adds every item of one list to another?",
        options: ["extend", "append", "insert", "add"],
        correct: [0],
      },
      {
        text: "What does my_list.sort() return?",
        options: ["None", "A new sorted list", "The first item", "True"],
        correct: [0],
      },
      {
        text: 'Why does {[1, 2]: "x"} raise a TypeError?',
        options: [
          "A dictionary key must be immutable, and a list is not",
          "Keys must be strings",
          "A dictionary cannot hold two values",
          "Square brackets are not allowed inside curly brackets",
        ],
        correct: [0],
      },
      {
        text: "Which loop prints both the key and the value of a dictionary d?",
        options: [
          "for k, v in d.items():",
          "for k in d:",
          "for v in d.values():",
          "for k, v in d:",
        ],
        correct: [0],
      },
    ],
  },
};
