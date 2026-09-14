import type { Module } from "../types";
import { text, py, out } from "../types";

export const loops: Module = {
  title: "Loops",
  lessons: [
    {
      title: "The for Loop and range",
      blocks: [
        text(
          "<h2>Repeating work</h2><p>A <strong>loop</strong> runs a block more than once. A <code>for</code> loop walks through a sequence and runs the block once for each item in it.</p>",
        ),
        py(
          'for letter in "cat":\n    print(letter)',
        ),
        out("c\na\nt"),
        text(
          "<p>The variable <code>letter</code> is created by the loop. On each pass it holds the next item. When the sequence runs out, the loop ends and the program continues.</p>",
        ),
        text(
          "<p>The same works for a list:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\n\nfor name in names:\n    print("Hello,", name)',
        ),
        out("Hello, Ada\nHello, Alan\nHello, Grace"),
        text(
          "<h3>Counting with range</h3><p>To repeat a fixed number of times, use <code>range</code>. <code>range(5)</code> produces the numbers 0, 1, 2, 3, 4 — five numbers, starting at zero, stopping <em>before</em> five:</p>",
        ),
        py("for number in range(5):\n    print(number)"),
        out("0\n1\n2\n3\n4"),
        text(
          "<p>The \"stop before\" rule is the same one you saw in slicing. It means <code>range(5)</code> gives exactly 5 numbers, which is usually what you want.</p>",
        ),
        text(
          "<h3>range with a start</h3><p>Two arguments set the start and the stop:</p>",
        ),
        py("for number in range(1, 6):\n    print(number)"),
        out("1\n2\n3\n4\n5"),
        text(
          "<p>A third argument sets the step, and it may be negative to count down:</p>",
        ),
        py("for number in range(0, 10, 2):\n    print(number)"),
        out("0\n2\n4\n6\n8"),
        py("for number in range(3, 0, -1):\n    print(number)\n\nprint(\"Go\")"),
        out("3\n2\n1\nGo"),
        text(
          "<h3>When you do not need the number</h3><p>If you only want to repeat something, the convention is to name the variable <code>_</code>. It signals to the reader that the value is unused:</p>",
        ),
        py('for _ in range(3):\n    print("Knock")'),
        out("Knock\nKnock\nKnock"),
        text(
          "<h3>Getting the position as well as the item</h3><p><code>enumerate</code> gives you both. It is better than counting by hand:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\n\nfor position, name in enumerate(names):\n    print(position, name)',
        ),
        out("0 Ada\n1 Alan\n2 Grace"),
        text(
          "<p>To number a list for a human reader, start at 1:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace"]\n\nfor position, name in enumerate(names, start=1):\n    print(f"{position}. {name}")',
        ),
        out("1. Ada\n2. Alan\n3. Grace"),
        text(
          "<h3>Building up a result</h3><p>A very common pattern: start with an empty value before the loop, and add to it inside:</p>",
        ),
        py(
          "prices = [1200, 800, 3500]\ntotal = 0\n\nfor price in prices:\n    total += price\n\nprint(\"Total:\", total)",
        ),
        out("Total: 5500"),
        text(
          "<p>Note that <code>total = 0</code> is <em>before</em> the loop. Putting it inside would reset it on every pass and the answer would be wrong.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>for item in sequence:</code> runs the block once per item.</p></li><li><p><code>range(n)</code> counts 0 to n-1; <code>range(a, b)</code> counts a to b-1.</p></li><li><p>A third argument is the step, and it can be negative.</p></li><li><p>Use <code>_</code> when the loop variable is not needed.</p></li><li><p><code>enumerate</code> gives the position and the item together.</p></li><li><p>Set up a running total <em>before</em> the loop, not inside it.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: for Loops",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "How many numbers does range(5) produce?",
            options: ["5 — from 0 to 4", "6 — from 0 to 5", "4 — from 1 to 4", "5 — from 1 to 5"],
            correct: [0],
          },
          {
            text: "What does range(1, 6) produce?",
            options: ["1, 2, 3, 4, 5", "1, 2, 3, 4, 5, 6", "0, 1, 2, 3, 4, 5", "1 and 6 only"],
            correct: [0],
          },
          {
            text: "What does range(3, 0, -1) produce?",
            options: ["3, 2, 1", "3, 2, 1, 0", "0, 1, 2", "Nothing"],
            correct: [0],
          },
          {
            text: "Why is the loop variable sometimes named _ ?",
            options: [
              "To signal that its value is not used",
              "Because Python requires it for range loops",
              "It makes the loop run faster",
              "It counts backwards",
            ],
            correct: [0],
          },
          {
            text: "What does enumerate give you on each pass?",
            options: [
              "The position and the item together",
              "Only the position",
              "The item twice",
              "The length of the sequence",
            ],
            correct: [0],
          },
          {
            text: "Why must total = 0 be written before the loop, not inside it?",
            options: [
              "Inside, it would reset to 0 on every pass and lose the running total",
              "Python forbids assignments inside a loop",
              "It would raise a NameError",
              "It makes no difference",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "The while Loop",
      blocks: [
        text(
          "<h2>Looping until something changes</h2><p>A <code>for</code> loop runs once per item. A <code>while</code> loop runs <strong>as long as a condition stays true</strong>. Use it when you do not know in advance how many passes you need.</p>",
        ),
        py(
          'count = 1\n\nwhile count <= 3:\n    print("Pass", count)\n    count += 1\n\nprint("Finished")',
        ),
        out("Pass 1\nPass 2\nPass 3\nFinished"),
        text(
          "<p>The condition is checked <em>before</em> each pass. When <code>count</code> reaches 4 the condition is false, the loop stops, and the program moves on.</p>",
        ),
        text(
          "<h3>The three parts you must not forget</h3><ol><li><p><strong>Set up</strong> the variable before the loop.</p></li><li><p><strong>Test</strong> it in the condition.</p></li><li><p><strong>Change</strong> it inside the loop.</p></li></ol><p>Miss the third and the condition never becomes false. The loop runs forever:</p>",
        ),
        py(
          'count = 1\n\nwhile count <= 3:\n    print("Pass", count)',
        ),
        out("Pass 1\nPass 1\nPass 1\nPass 1\n... forever"),
        text(
          "<p>This is an <strong>infinite loop</strong>. Nothing inside changes <code>count</code>, so the test is true on every pass. If you run one by accident, press <strong>Ctrl+C</strong> in the terminal to stop the program.</p>",
        ),
        text(
          "<h3>When while is the right choice</h3><p>Reading input until the answer is valid is the classic case. You cannot know how many tries the person will need:</p>",
        ),
        py(
          'answer = ""\n\nwhile answer not in ["yes", "no"]:\n    answer = input("Continue? (yes/no) ").strip().lower()\n\nprint("You said", answer)',
        ),
        out(
          "Continue? (yes/no) maybe\nContinue? (yes/no) YES\nYou said yes",
        ),
        text(
          "<p>The first value of <code>answer</code> is an empty string, which is not in the list, so the loop runs at least once.</p>",
        ),
        text(
          "<h3>while True with a break</h3><p>Sometimes the natural place to stop is in the middle of the block, not at the top. Then loop forever on purpose and leave with <code>break</code>:</p>",
        ),
        py(
          'while True:\n    line = input("Enter a word (or quit): ").strip()\n    if line == "quit":\n        break\n    print("You typed:", line)\n\nprint("Goodbye")',
        ),
        out(
          "Enter a word (or quit): hello\nYou typed: hello\nEnter a word (or quit): quit\nGoodbye",
        ),
        text(
          "<p><code>while True:</code> is not a mistake here. The exit is explicit and easy to see. Just make sure there really is a reachable <code>break</code>.</p>",
        ),
        text(
          "<h3>for or while?</h3><ul><li><p>You know the items or the count → use <code>for</code>.</p></li><li><p>You repeat until a condition changes → use <code>while</code>.</p></li></ul><p>Counting to ten is a <code>for</code> job. Asking until the user gives valid input is a <code>while</code> job.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>while condition:</code> repeats while the condition is true.</p></li><li><p>The condition is checked before every pass.</p></li><li><p>Set up, test, and change the variable — missing the change gives an infinite loop.</p></li><li><p>Stop a runaway loop with Ctrl+C.</p></li><li><p><code>while True:</code> with a <code>break</code> is fine when the exit sits in the middle.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: while Loops",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "When is a while condition checked?",
            options: [
              "Before every pass",
              "After every pass",
              "Only once, at the start",
              "Only when break is used",
            ],
            correct: [0],
          },
          {
            text: "What causes an infinite loop?",
            options: [
              "Nothing inside the loop changes the value the condition tests",
              "Using a for loop instead of while",
              "Forgetting the colon",
              "Indenting by four spaces",
            ],
            correct: [0],
          },
          {
            text: "How do you stop a runaway loop in the terminal?",
            options: ["Ctrl+C", "Ctrl+S", "Typing exit()", "Closing the file"],
            correct: [0],
          },
          {
            text: "Which task suits a while loop better than a for loop?",
            options: [
              "Asking the user for input until the answer is valid",
              "Printing every name in a list",
              "Counting from 1 to 10",
              "Printing each letter of a word",
            ],
            correct: [0],
          },
          {
            text: "Why is while True: acceptable in some programs?",
            options: [
              "When a reachable break makes the exit point explicit",
              "It never is — it is always a bug",
              "Because Python optimises it away",
              "Because it runs faster than a normal condition",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "break, continue and else",
      blocks: [
        text(
          "<h2>Leaving a loop early</h2><p><code>break</code> stops the loop immediately. Nothing else in the block runs, and no further passes happen:</p>",
        ),
        py(
          'names = ["Ada", "Alan", "Grace", "Alan"]\n\nfor name in names:\n    if name == "Grace":\n        print("Found Grace")\n        break\n    print("Checked", name)\n\nprint("Search over")',
        ),
        out("Checked Ada\nChecked Alan\nFound Grace\nSearch over"),
        text(
          "<p>The final <code>\"Alan\"</code> was never checked. Once <code>break</code> ran, the loop was finished.</p>",
        ),
        text(
          "<h3>Skipping one pass</h3><p><code>continue</code> skips the rest of the current pass and jumps to the next one. The loop itself keeps going:</p>",
        ),
        py(
          "for number in range(1, 8):\n    if number % 2 == 0:\n        continue\n    print(number)",
        ),
        out("1\n3\n5\n7"),
        text(
          "<p>When the number is even, <code>continue</code> runs and the <code>print</code> below is skipped. Only the odd numbers are printed.</p>",
        ),
        text(
          "<p>This is useful for filtering out cases you do not want to handle:</p>",
        ),
        py(
          'lines = ["ada@example.com", "", "  ", "alan@example.com"]\n\nfor line in lines:\n    if not line.strip():\n        continue\n    print("Sending to", line.strip())',
        ),
        out("Sending to ada@example.com\nSending to alan@example.com"),
        text(
          "<h3>break and continue in a while loop</h3><p>Both work the same way in a <code>while</code> loop. Take care with <code>continue</code>: if the line that changes the condition is below it, you can create an infinite loop by skipping past it.</p>",
        ),
        py(
          'count = 0\n\nwhile count < 5:\n    count += 1\n    if count == 3:\n        continue\n    print(count)',
        ),
        out("1\n2\n4\n5"),
        text(
          "<p>Here <code>count += 1</code> is the first line of the block, so it always runs before any <code>continue</code>. That ordering is what keeps the loop safe.</p>",
        ),
        text(
          "<h3>The loop else</h3><p>A loop can have an <code>else</code>. It runs when the loop finished normally — that is, <strong>without</strong> a <code>break</code>. This is unusual and worth reading twice:</p>",
        ),
        py(
          'names = ["Ada", "Alan"]\n\nfor name in names:\n    if name == "Grace":\n        print("Found Grace")\n        break\nelse:\n    print("Grace is not in the list")',
        ),
        out("Grace is not in the list"),
        text(
          "<p>The loop ran out of names without breaking, so the <code>else</code> ran. Add <code>\"Grace\"</code> to the list and the <code>else</code> is skipped.</p><p>This saves you from keeping a separate \"was it found\" variable. It is the one place where <code>else</code> does not mean \"otherwise\" — read it as \"if no break happened\".</p>",
        ),
        text(
          "<h3>Nested loops</h3><p>A loop inside a loop runs the inner one completely on each pass of the outer one:</p>",
        ),
        py(
          "for row in range(1, 4):\n    for column in range(1, 4):\n        print(row * column, end=\"\\t\")\n    print()",
        ),
        out("1\t2\t3\t\n2\t4\t6\t\n3\t6\t9\t"),
        text(
          "<p>Note that <code>break</code> only leaves the loop it is in. In a nested loop, a <code>break</code> in the inner loop returns to the outer one; it does not leave both.</p>",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p><code>break</code> ends the loop immediately.</p></li><li><p><code>continue</code> skips the rest of this pass and starts the next.</p></li><li><p>In a <code>while</code> loop, make sure <code>continue</code> cannot skip the line that changes the condition.</p></li><li><p>A loop <code>else</code> runs only when no <code>break</code> happened.</p></li><li><p><code>break</code> leaves only the innermost loop.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: break and continue",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "What does break do?",
            options: [
              "Ends the loop immediately",
              "Skips to the next pass",
              "Restarts the loop from the beginning",
              "Pauses the loop until input is given",
            ],
            correct: [0],
          },
          {
            text: "What does continue do?",
            options: [
              "Skips the rest of this pass and starts the next one",
              "Ends the loop",
              "Repeats the current pass",
              "Ends the program",
            ],
            correct: [0],
          },
          {
            text: "for n in range(1, 6): if n % 2 == 0: continue; print(n) — what is printed?",
            options: ["1, 3, 5", "2, 4", "1, 2, 3, 4, 5", "Nothing"],
            correct: [0],
          },
          {
            text: "When does a loop else block run?",
            options: [
              "When the loop finished without a break",
              "When the loop body never ran",
              "Every time the loop ends",
              "Only when a break happened",
            ],
            correct: [0],
          },
          {
            text: "In a nested loop, what does a break in the inner loop do?",
            options: [
              "Leaves only the inner loop, and the outer loop continues",
              "Leaves both loops",
              "Restarts the outer loop",
              "Raises an error",
            ],
            correct: [0],
          },
          {
            text: "Why can continue cause an infinite while loop?",
            options: [
              "It can skip past the line that changes the value in the condition",
              "It resets the condition to True",
              "It always jumps back to the first line of the program",
              "It cannot — continue is always safe",
            ],
            correct: [0],
          },
        ],
      },
    },
    {
      title: "Loop Patterns You Will Use Often",
      blocks: [
        text(
          "<h2>The same shapes, again and again</h2><p>Most loops in real code follow one of a small number of patterns. Learning them by name saves you from reinventing each one.</p>",
        ),
        text(
          "<h3>1. Accumulate a total</h3><p>Start at zero before the loop, add inside it:</p>",
        ),
        py(
          "prices = [1200, 800, 3500, 450]\ntotal = 0\n\nfor price in prices:\n    total += price\n\nprint(\"Total:\", total)\nprint(\"Average:\", total / len(prices))",
        ),
        out("Total: 5950\nAverage: 1487.5"),
        text(
          "<h3>2. Count things that match</h3><p>Same idea, but add 1 instead of a value:</p>",
        ),
        py(
          'words = ["apple", "fig", "banana", "kiwi", "cherry"]\nlong_words = 0\n\nfor word in words:\n    if len(word) > 4:\n        long_words += 1\n\nprint(long_words, "words are longer than 4 letters")',
        ),
        out("3 words are longer than 4 letters"),
        text(
          "<h3>3. Find the largest or smallest</h3><p>Keep the best value seen so far, and replace it when you find better:</p>",
        ),
        py(
          "temperatures = [21, 27, 19, 31, 24]\nhighest = temperatures[0]\n\nfor temperature in temperatures:\n    if temperature > highest:\n        highest = temperature\n\nprint(\"Highest:\", highest)",
        ),
        out("Highest: 31"),
        text(
          "<p>Starting from <code>temperatures[0]</code> rather than 0 matters. If every value were negative, starting at 0 would give the wrong answer.</p>",
        ),
        text(
          "<h3>4. Build a new list</h3><p>Start with an empty list and append what you want to keep:</p>",
        ),
        py(
          'names = ["ada", "alan", "grace"]\ntidy = []\n\nfor name in names:\n    tidy.append(name.title())\n\nprint(tidy)',
        ),
        out("['Ada', 'Alan', 'Grace']"),
        text(
          "<p>Python has a shorter form for exactly this, called a <strong>list comprehension</strong>:</p>",
        ),
        py(
          'names = ["ada", "alan", "grace"]\ntidy = [name.title() for name in names]\nprint(tidy)',
        ),
        out("['Ada', 'Alan', 'Grace']"),
        text(
          "<p>Read it as \"take <code>name.title()</code> for each <code>name</code> in <code>names</code>\". You can add a filter on the end:</p>",
        ),
        py(
          "numbers = [1, 2, 3, 4, 5, 6]\nevens = [n for n in numbers if n % 2 == 0]\nprint(evens)",
        ),
        out("[2, 4, 6]"),
        text(
          "<h3>5. Search and stop</h3><p>Use <code>break</code> when you only need the first match, and the loop <code>else</code> for the not-found case:</p>",
        ),
        py(
          'stock = ["pen", "book", "bag"]\nwanted = "book"\n\nfor item in stock:\n    if item == wanted:\n        print("In stock:", item)\n        break\nelse:\n    print("Not available")',
        ),
        out("In stock: book"),
        text(
          "<h3>6. Validate until correct</h3><p>A <code>while</code> loop that only ends on good input:</p>",
        ),
        py(
          'age = -1\n\nwhile age < 0 or age > 120:\n    age = int(input("Your age: "))\n    if age < 0 or age > 120:\n        print("Please enter an age between 0 and 120")\n\nprint("Thank you")',
        ),
        out(
          "Your age: 200\nPlease enter an age between 0 and 120\nYour age: 34\nThank you",
        ),
        text(
          "<hr><h3>Summary</h3><ul><li><p>Accumulate: set a total before the loop, add inside.</p></li><li><p>Count: add 1 when a condition matches.</p></li><li><p>Find the best: start from the first item, replace when you find better.</p></li><li><p>Build a list: <code>append</code> in a loop, or use a list comprehension.</p></li><li><p>Search: <code>break</code> on the first match, loop <code>else</code> for not found.</p></li><li><p>Validate: <code>while</code> until the value is acceptable.</p></li></ul>",
        ),
      ],
      quiz: {
        title: "Quiz: Loop Patterns",
        passingScore: 70,
        maxAttempts: 3,
        questions: [
          {
            text: "Where should total = 0 go when summing a list?",
            options: [
              "Before the loop",
              "Inside the loop, as the first line",
              "Inside the loop, as the last line",
              "After the loop",
            ],
            correct: [0],
          },
          {
            text: "Why start a maximum search from the first item rather than from 0?",
            options: [
              "Starting at 0 gives the wrong answer when every value is negative",
              "Because 0 is not a valid number in Python",
              "Because the list index starts at 0",
              "It makes no difference",
            ],
            correct: [0],
          },
          {
            text: "What does [n for n in numbers if n % 2 == 0] produce?",
            options: [
              "A new list holding only the even numbers",
              "The count of even numbers",
              "The sum of the even numbers",
              "A boolean",
            ],
            correct: [0],
          },
          {
            text: "Which pair is the right way to write a search that reports when nothing was found?",
            options: [
              "break on the match, and a loop else for the not-found case",
              "continue on the match, and an if after the loop",
              "break on the match, and an elif after the loop",
              "A while True loop with no break",
            ],
            correct: [0],
          },
          {
            text: "Which patterns need a variable set up before the loop starts?",
            options: [
              "Accumulating a total",
              "Counting matches",
              "Building a new list with append",
              "Printing each item as you go",
            ],
            correct: [0, 1, 2],
          },
        ],
      },
    },
  ],
  quiz: {
    title: "Module 7 Test: Loops",
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        text: "What does for i in range(3) give i on each pass?",
        options: ["0, then 1, then 2", "1, then 2, then 3", "0, then 1, then 2, then 3", "3, then 2, then 1"],
        correct: [0],
      },
      {
        text: "Which loop should you use when you do not know in advance how many passes are needed?",
        options: ["while", "for", "Either — they are identical", "Neither; use if"],
        correct: [0],
      },
      {
        text: "What is printed by: for n in range(1, 6): if n == 3: break; print(n)",
        options: ["1 and 2", "1, 2, 4, 5", "1, 2, 3", "Nothing"],
        correct: [0],
      },
      {
        text: "What is printed by: for n in range(1, 6): if n == 3: continue; print(n)",
        options: ["1, 2, 4, 5", "1 and 2", "1, 2, 3, 4, 5", "3"],
        correct: [0],
      },
      {
        text: "Which statements about the loop else are true?",
        options: [
          "It runs only when the loop ended without a break",
          "It removes the need for a separate found flag",
          "It runs every time the loop ends",
          "It runs only when a break happened",
        ],
        correct: [0, 1],
      },
      {
        text: "What does enumerate(names, start=1) give?",
        options: [
          "Pairs of position and item, with the position counting from 1",
          "Only the items, starting from the second one",
          "The list sorted from position 1",
          "The length of the list",
        ],
        correct: [0],
      },
      {
        text: "A while loop prints the same line forever. What is the most likely cause?",
        options: [
          "Nothing in the loop changes the value the condition tests",
          "The condition uses == instead of =",
          "The loop body is indented by four spaces",
          "range was not used",
        ],
        correct: [0],
      },
      {
        text: "What does [w.upper() for w in words] do?",
        options: [
          "Builds a new list with every word in capitals",
          "Changes each word in the original list to capitals",
          "Prints every word in capitals",
          "Counts the words",
        ],
        correct: [0],
      },
    ],
  },
};
