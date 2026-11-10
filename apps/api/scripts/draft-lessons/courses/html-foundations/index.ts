import type { CourseDraft } from "../../types";
import { htmlLesson, quiz } from "./build";

const lessons = [
  htmlLesson({
    moduleId: "ca4f48d7-c04e-469b-9f73-1b6b540898c2",
    moduleTitle: "HTML Introduction",
    lessonTitle: "Your first web page",
    intro: `<p><strong>HTML</strong> stands for <strong>Hyper Text Markup Language</strong>. It describes the <em>structure</em> of a page: headings, paragraphs, links, images. The browser reads it and draws the page.</p>`,
    diagram: "page-skeleton.png",
    starter: `<h1>Hello, world!</h1>
<p>This is my first web page.</p>`,
    tasks: [
      "Change the heading to your name.",
      "Add a second paragraph about where you live.",
      "Press Run (or just type) and watch the preview update.",
    ],
    solution: `<h1>Aline Uwase</h1>
<p>This is my first web page.</p>
<p>I live in Kigali.</p>`,
  }),
  htmlLesson({
    moduleId: "055dcd2c-3476-43df-b1c7-29f51f7945ec",
    moduleTitle: "HTML Editors",
    lessonTitle: "Write HTML in an editor, view it in a browser",
    intro: `<p>Any text editor works: VS Code (recommended), Notepad, TextEdit (plain-text mode). Save the file as <code>index.html</code>, then double-click it to open it in your browser. The playground below does both at once.</p>`,
    starter: `<h1>My Notes</h1>
<p>Saved as index.html</p>`,
    tasks: [
      "In VS Code: create <code>index.html</code>, paste this code, save, open it in a browser.",
      "Here: change the text and see the preview update instantly.",
    ],
    solution: `<!-- index.html -->
<h1>My Notes</h1>
<p>Edited in VS Code, opened in Chrome.</p>`,
    quiz: quiz("HTML Editors", [
      { text: "Which file extension should an HTML page use?", options: [".txt", ".html", ".doc"], correct: [1] },
      { text: "How do you view an HTML file you saved?", options: ["Open it in a web browser", "Print it", "Email it"], correct: [0] },
      { text: "Which editor is a popular free choice for writing HTML?", options: ["VS Code", "Excel", "Paint"], correct: [0] },
    ]),
  }),
  htmlLesson({
    moduleId: "54f9abd4-d14b-4926-af9c-7ebf39c6fef8",
    moduleTitle: "HTML Basics",
    lessonTitle: "Headings, paragraphs, links and images",
    intro: `<p>Four tags build most pages: <code>&lt;h1&gt;</code>–<code>&lt;h6&gt;</code> headings, <code>&lt;p&gt;</code> paragraphs, <code>&lt;a href&gt;</code> links, <code>&lt;img src alt&gt;</code> images.</p>`,
    starter: `<h1>Visit Rwanda</h1>
<p>Land of a thousand hills.</p>
<a href="https://www.visitrwanda.com">Official site</a>`,
    tasks: [
      "Add an <code>&lt;h2&gt;</code> called <em>Top places</em>.",
      'Add an image: <code>&lt;img src="https://placehold.co/300x150" alt="Hills"&gt;</code>.',
      "Add a paragraph under the image.",
    ],
    solution: `<h1>Visit Rwanda</h1>
<p>Land of a thousand hills.</p>
<a href="https://www.visitrwanda.com">Official site</a>
<h2>Top places</h2>
<img src="https://placehold.co/300x150" alt="Hills">
<p>Lake Kivu, Nyungwe and Volcanoes National Park.</p>`,
    quiz: quiz("HTML Basics", [
      { text: "Which tag makes a link?", options: ["<link>", "<a>", "<href>"], correct: [1] },
      { text: "Which attribute gives an image's file or URL?", options: ["href", "src", "alt"], correct: [1] },
      { text: "Which tag is a paragraph?", options: ["<p>", "<para>", "<text>"], correct: [0] },
    ]),
  }),
  htmlLesson({
    moduleId: "63bd5117-6317-4141-8222-ffda8b2758b6",
    moduleTitle: "HTML Elements",
    lessonTitle: "Elements: opening tag, content, closing tag",
    intro: `<p>An element = opening tag + content + closing tag. Elements can be nested. Some are <strong>empty</strong> and have no closing tag: <code>&lt;br&gt;</code>, <code>&lt;img&gt;</code>.</p>`,
    diagram: "element-anatomy.png",
    starter: `<p>This is <b>bold</b> text.</p>
<p>Line one<br>Line two</p>`,
    tasks: [
      "Nest an <code>&lt;i&gt;</code> inside the bold text.",
      "Remove the <code>&lt;/p&gt;</code> from the first paragraph and see what still works (then put it back: always close your tags).",
      "Add a third line using <code>&lt;br&gt;</code>.",
    ],
    solution: `<p>This is <b>bold and <i>italic</i></b> text.</p>
<p>Line one<br>Line two<br>Line three</p>`,
    quiz: quiz("HTML Elements", [
      { text: "Which is an empty element (no closing tag)?", options: ["<p>", "<br>", "<h1>"], correct: [1] },
      { text: "What does an element usually consist of?", options: ["Opening tag, content, closing tag", "Only a closing tag", "Only attributes"], correct: [0] },
      { text: "Which shows correct nesting?", options: ["<b><i>text</b></i>", "<b><i>text</i></b>", "<b>text<i></b>"], correct: [1] },
    ]),
  }),
  htmlLesson({
    moduleId: "0063b62b-5290-403c-b3fe-aea34d9356cb",
    moduleTitle: "HTML Attributes",
    lessonTitle: "Attributes add extra information",
    intro: `<p>Attributes live in the opening tag as <code>name="value"</code>: <code>href</code> on links, <code>src</code>/<code>alt</code>/<code>width</code> on images, <code>title</code> for tooltips. Correct syntax: <code>&lt;img src='img_girl.jpg'&gt;</code> or <code>&lt;img src="img_girl.jpg"&gt;</code>.</p>`,
    starter: `<img src="https://placehold.co/200x120" alt="Placeholder">
<p title="I am a tooltip">Hover me</p>`,
    tasks: [
      'Add <code>width="300"</code> to the image.',
      "Change the <code>alt</code> text to describe the image.",
      'Make a link to <code>https://withintech.org</code> that opens in a new tab with <code>target="_blank"</code>.',
    ],
    solution: `<img src="https://placehold.co/200x120" alt="Grey sample image" width="300">
<p title="I am a tooltip">Hover me</p>
<a href="https://withintech.org" target="_blank">WithinTech</a>`,
  }),
  htmlLesson({
    moduleId: "0bf503db-e6ce-4593-a38d-337155457be8",
    moduleTitle: "HTML Headings",
    lessonTitle: "Headings h1 to h6",
    intro: `<p><code>&lt;h1&gt;</code> is the largest and most important header; <code>&lt;h6&gt;</code> the smallest. Use one <code>&lt;h1&gt;</code> per page, then h2, h3… like a table of contents.</p>`,
    starter: `<h1>Main title</h1>
<h2>Section</h2>
<h3>Sub-section</h3>`,
    tasks: [
      "Add <code>&lt;h4&gt;</code>, <code>&lt;h5&gt;</code> and <code>&lt;h6&gt;</code> and compare sizes.",
      "Turn it into a real outline: a page about your school with 2 sections.",
    ],
    solution: `<h1>Green Hills Academy</h1>
<h2>Courses</h2>
<h3>Computer Science</h3>
<h2>Clubs</h2>
<h3>Coding Club</h3>`,
  }),
  htmlLesson({
    moduleId: "7bd4baf1-f332-4d88-905f-8667cb95e208",
    moduleTitle: "HTML Paragraphs",
    lessonTitle: "Paragraphs, line breaks and lines",
    intro: `<p><code>&lt;p&gt;</code> is a paragraph. Extra spaces and new lines in your code are ignored: use <code>&lt;br&gt;</code> for a line break, <code>&lt;hr&gt;</code> for a horizontal line, <code>&lt;pre&gt;</code> to keep spacing exactly.</p>`,
    starter: `<p>This    has    many    spaces
and a new line in the code.</p>
<hr>
<pre>This    keeps
   its spacing.</pre>`,
    tasks: [
      "Make the first paragraph break after <em>spaces</em> using <code>&lt;br&gt;</code>.",
      "Write a 3-line poem inside <code>&lt;pre&gt;</code>.",
    ],
    solution: `<p>This has many spaces<br>and a new line in the code.</p>
<hr>
<pre>Imisozi igihumbi,
   ikiyaga cya Kivu,
      izuba rirashe.</pre>`,
    quiz: quiz("HTML Paragraphs", [
      { text: "Which tag inserts a line break?", options: ["<lb>", "<br>", "<break>"], correct: [1] },
      { text: "What does the browser do with extra spaces in a <p>?", options: ["Keeps them", "Collapses them into one", "Shows an error"], correct: [1] },
      { text: "Which tag keeps text spacing exactly as written?", options: ["<pre>", "<p>", "<hr>"], correct: [0] },
    ]),
  }),
  htmlLesson({
    moduleId: "371f2f94-5df4-4b97-b8db-9a3c7e84f76a",
    moduleTitle: "HTML Styles",
    lessonTitle: "The style attribute",
    intro: `<p><code>style="property:value;"</code> changes how one element looks. Example: <code>&lt;body style='background-color:pink;'&gt;</code> adds a background color to the document.</p>`,
    starter: `<h1 style="color:blue;">Styled heading</h1>
<p style="font-size:20px;">Bigger text</p>`,
    tasks: [
      "Give the paragraph <code>text-align:center;</code>.",
      "Add a <code>&lt;div&gt;</code> with <code>background-color:pink;</code> and <code>padding:12px;</code>.",
      "Change the heading font with <code>font-family:Georgia;</code>.",
    ],
    solution: `<h1 style="color:blue; font-family:Georgia;">Styled heading</h1>
<p style="font-size:20px; text-align:center;">Bigger text</p>
<div style="background-color:pink; padding:12px;">A pink box</div>`,
  }),
  htmlLesson({
    moduleId: "d88a5968-057d-42f2-9b5e-55a710edadde",
    moduleTitle: "HTML Text Formatting",
    lessonTitle: "Bold, italic, highlight and more",
    intro: `<p><code>&lt;strong&gt;</code> and <code>&lt;b&gt;</code> make text bold (<code>strong</code> = important). Also: <code>&lt;em&gt;</code>/<code>&lt;i&gt;</code> italic, <code>&lt;mark&gt;</code> highlight, <code>&lt;del&gt;</code>, <code>&lt;ins&gt;</code>, <code>&lt;sub&gt;</code>, <code>&lt;sup&gt;</code>.</p>`,
    starter: `<p>Price: <del>5000 RWF</del> <ins>4000 RWF</ins></p>
<p>Water is H<sub>2</sub>O and 10<sup>2</sup> = 100.</p>`,
    tasks: [
      "Make <em>4000 RWF</em> bold with <code>&lt;strong&gt;</code>.",
      "Highlight one word with <code>&lt;mark&gt;</code>.",
      "Add a sentence in italics with <code>&lt;em&gt;</code>.",
    ],
    solution: `<p>Price: <del>5000 RWF</del> <ins><strong>4000 RWF</strong></ins></p>
<p>Water is H<sub>2</sub>O and 10<sup>2</sup> = 100.</p>
<p><em>Offer ends <mark>Friday</mark>.</em></p>`,
  }),
  htmlLesson({
    moduleId: "b18b92b5-4aa6-4b58-af24-21a65b72089b",
    moduleTitle: "HTML Quotation and Citation Elements",
    lessonTitle: "Quotes, abbreviations and citations",
    intro: `<p><code>&lt;blockquote&gt;</code> long quotes, <code>&lt;q&gt;</code> short inline quotes, <code>&lt;abbr title&gt;</code> abbreviations, <code>&lt;cite&gt;</code> titles of works, <code>&lt;address&gt;</code> contact info.</p>`,
    starter: `<blockquote>Education is the most powerful weapon which you can use to change the world.</blockquote>
<p><abbr title="Rwanda Revenue Authority">RRA</abbr> collects taxes.</p>`,
    tasks: [
      "Add who said the quote with <code>&lt;cite&gt;</code>.",
      "Write a sentence with a short <code>&lt;q&gt;</code> quote.",
      "Add your school's contact details in <code>&lt;address&gt;</code>.",
    ],
    solution: `<blockquote>Education is the most powerful weapon which you can use to change the world.</blockquote>
<p><cite>Nelson Mandela</cite></p>
<p>My teacher says <q>practice every day</q>.</p>
<address>WithinTech, Kigali, Rwanda</address>`,
    quiz: quiz("Quotations and Citations", [
      { text: "Which tag is for a long, block-level quote?", options: ["<q>", "<blockquote>", "<cite>"], correct: [1] },
      { text: "Which tag shows the full meaning of an abbreviation on hover?", options: ["<abbr title='...'>", "<short>", "<dfn>"], correct: [0] },
      { text: "Which tag marks the title of a work, like a book?", options: ["<cite>", "<title>", "<em>"], correct: [0] },
    ]),
  }),
  htmlLesson({
    moduleId: "f3efa763-8c63-4b07-a483-59ebaa6771ba",
    moduleTitle: "HTML Comments",
    lessonTitle: "Comments: notes the browser ignores",
    intro: `<p>The correct syntax for a comment is <code>&lt;!-- This is a comment --&gt;</code>. Comments don't show on the page. Use them for notes or to hide code temporarily.</p>`,
    starter: `<!-- Header -->
<h1>My page</h1>
<p>Visible paragraph</p>
<p>Another paragraph</p>`,
    tasks: [
      "Hide the second paragraph by wrapping it in a comment.",
      "Add a comment that says where the footer starts.",
    ],
    solution: `<!-- Header -->
<h1>My page</h1>
<p>Visible paragraph</p>
<!-- <p>Another paragraph</p> -->
<!-- Footer starts here -->`,
  }),
  htmlLesson({
    moduleId: "c7439ffa-1da0-442d-9a93-f6eadf6f7181",
    moduleTitle: "HTML Colors",
    lessonTitle: "Colors: names, HEX, RGB and HSL",
    intro: `<p>Four ways to write a color: names (<code>Tomato</code>, <code>DodgerBlue</code>), HEX <code>#ff6347</code> (00 lowest → FF highest per channel), <code>rgb(255, 99, 71)</code>, <code>hsl(9, 100%, 64%)</code>. Lightness 0% is always black: <code>hsl(0, 100%, 0%)</code>.</p>`,
    starter: `<p style="background-color:Tomato;">Tomato</p>
<p style="background-color:#3d006b; color:white;">#3d006b</p>
<p style="background-color:rgb(0, 128, 0); color:white;">rgb(0,128,0)</p>`,
    css: `p { padding: 10px; border-radius: 8px; }`,
    tasks: [
      "Add a paragraph with <code>hsl(0, 100%, 0%)</code> and see it's black.",
      "Change Tomato to another legal name, e.g. <code>Orange</code> or <code>SlateBlue</code>.",
      "Make a HEX color brighter by raising its digits toward <code>FF</code>.",
    ],
    solution: `<p style="background-color:SlateBlue; color:white;">SlateBlue</p>
<p style="background-color:#7a00d6; color:white;">#7a00d6 (brighter)</p>
<p style="background-color:hsl(0, 100%, 0%); color:white;">hsl(0,100%,0%) = black</p>`,
  }),
  htmlLesson({
    moduleId: "aa1ec375-a41a-4fa4-b333-c4a523ad37dc",
    moduleTitle: "HTML Styles - CSS",
    lessonTitle: "CSS: style many elements at once",
    intro: `<p>Three ways to add CSS: <strong>inline</strong> (<code>style=""</code>), <strong>internal</strong> (<code>&lt;style&gt;</code> in head), <strong>external</strong> (<code>&lt;link rel="stylesheet" href="styles.css"&gt;</code>). External is best: one file styles every page. This playground uses the external <code>styles.css</code> tab.</p>`,
    starter: `<h1>CSS demo</h1>
<p>First paragraph.</p>
<p class="note">A note.</p>`,
    css: `h1 { color: #3d006b; }`,
    tasks: [
      "In <strong>styles.css</strong>, make all <code>p</code> text dark grey: <code>p { color: #374151; }</code>.",
      "Style the <code>.note</code> class with a background and padding.",
      "Add a border to the heading.",
    ],
    solution: `/* styles.css */
h1 { color: #3d006b; border-bottom: 3px solid #ea7a28; }
p { color: #374151; }
.note { background: #f3e8ff; padding: 10px; border-radius: 8px; }`,
    quiz: quiz("HTML Styles - CSS", [
      { text: "Which way of adding CSS is best for styling many pages?", options: ["Inline style attribute", "External stylesheet with <link>", "Internal <style> on every page"], correct: [1] },
      { text: "Where does <link rel='stylesheet'> go?", options: ["In <head>", "At the end of <p>", "Inside <table>"], correct: [0] },
      { text: "How do you target elements with class='note' in CSS?", options: ["#note", ".note", "note()"], correct: [1] },
    ]),
  }),
  htmlLesson({
    moduleId: "ee8ed6fc-b7fc-426c-928f-424ef8e0c7cb",
    moduleTitle: "HTML Links",
    lessonTitle: "Links: to pages, sections and email",
    intro: `<p><code>&lt;a href="url"&gt;text&lt;/a&gt;</code>. <code>target="_blank"</code> opens a new tab; <code>href="#contact"</code> jumps to <code>id="contact"</code> on the same page; <code>mailto:</code> opens email.</p>`,
    starter: `<a href="https://www.irembo.gov.rw">Irembo</a>
<p>Scroll down to contact.</p>
<div style="height:400px"></div>
<h2>Contact</h2>`,
    tasks: [
      "Open the Irembo link in a new tab.",
      'Give the Contact heading <code>id="contact"</code> and add a link at the top that jumps to it.',
      "Add an email link with <code>mailto:</code>.",
    ],
    solution: `<a href="https://www.irembo.gov.rw" target="_blank">Irembo</a>
<p><a href="#contact">Jump to contact</a></p>
<div style="height:400px"></div>
<h2 id="contact">Contact</h2>
<a href="mailto:info@withintech.org">Email us</a>`,
    quiz: quiz("HTML Links", [
      { text: "Which attribute opens a link in a new tab?", options: ["new='tab'", "target='_blank'", "open='new'"], correct: [1] },
      { text: "How do you link to an element with id='contact' on the same page?", options: ["href='#contact'", "href='contact'", "href='.contact'"], correct: [0] },
      { text: "Which href opens the user's email app?", options: ["email:info@x.org", "mailto:info@x.org", "send:info@x.org"], correct: [1] },
    ]),
  }),
  htmlLesson({
    moduleId: "c68e262d-12aa-4566-b25f-5df2e433379a",
    moduleTitle: "HTML Images",
    lessonTitle: "Images: src, alt and size",
    intro: `<p><code>&lt;img src="…" alt="…"&gt;</code>. <code>alt</code> describes the image for screen readers and shows if it fails to load. Control size with <code>width</code>/<code>height</code> or CSS.</p>`,
    starter: `<img src="https://placehold.co/400x200" alt="Placeholder">
<img src="broken.jpg" alt="This image is missing">`,
    tasks: [
      "Make the first image 200px wide.",
      "Notice the alt text shown for the broken image.",
      "Turn the first image into a link by wrapping it in <code>&lt;a&gt;</code>.",
    ],
    solution: `<a href="https://withintech.org">
  <img src="https://placehold.co/400x200" alt="WithinTech banner" width="200">
</a>
<img src="broken.jpg" alt="This image is missing">`,
    quiz: quiz("HTML Images", [
      { text: "Which attribute describes an image for screen readers?", options: ["title", "alt", "desc"], correct: [1] },
      { text: "What does the browser show if an image fails to load?", options: ["Nothing at all", "The alt text", "An error popup"], correct: [1] },
      { text: "Which is a correct image tag?", options: ["<img href='a.png'>", "<img src='a.png' alt='Logo'>", "<image src='a.png'>"], correct: [1] },
    ]),
  }),
  htmlLesson({
    moduleId: "d2717dee-5b15-4447-acc3-091959701f5d",
    moduleTitle: "HTML Favicon",
    lessonTitle: "Favicons: the icon in the browser tab",
    intro: `<p>The favicon is defined in the <code>&lt;link&gt;</code> element inside <code>&lt;head&gt;</code>:</p>`,
    starter: `<!-- In a real page this goes in <head>: -->
<!-- <link rel="icon" type="image/png" href="favicon.png"> -->
<p>Look at the browser tab after adding a favicon to your own page.</p>`,
    tasks: [
      'On your own <code>index.html</code>: add <code>&lt;link rel="icon" href="favicon.png"&gt;</code> in <code>&lt;head&gt;</code>.',
      "Use a small square PNG (32×32 or 48×48).",
    ],
    solution: `<head>
  <title>My site</title>
  <link rel="icon" type="image/png" href="favicon.png">
</head>`,
  }),
  htmlLesson({
    moduleId: "05980897-9965-4f8e-b372-8c7cae155279",
    moduleTitle: "HTML Page Title",
    lessonTitle: "The page title",
    intro: `<p>The page title is defined in the <code>&lt;title&gt;</code> element in <code>&lt;head&gt;</code>. It shows in the browser tab, bookmarks and Google results.</p>`,
    starter: `<!-- The playground page has <title>My page</title> in its head. -->
<h1>Open the HTML tab and find &lt;title&gt;</h1>`,
    tasks: [
      "In the <strong>index.html</strong> tab, change <code>&lt;title&gt;My page&lt;/title&gt;</code> to something descriptive.",
      "Keep titles short and specific: <em>Contact | WithinTech</em>.",
    ],
    solution: `<head>
  <title>Contact | WithinTech</title>
</head>`,
  }),
  htmlLesson({
    moduleId: "b7a770fb-0cc5-4088-ab5a-7f593559511b",
    moduleTitle: "HTML Tables",
    lessonTitle: "Tables for real data",
    intro: `<p><code>&lt;table&gt;</code> → rows <code>&lt;tr&gt;</code> → header cells <code>&lt;th&gt;</code> and data cells <code>&lt;td&gt;</code>. Style with CSS <code>border</code>, <code>width</code>, <code>padding</code>. Merge cells with <code>rowspan</code> / <code>colspan</code>.</p>`,
    diagram: "table-structure.png",
    starter: `<table>
  <tr><th>Name</th><th>District</th><th>Score</th></tr>
  <tr><td>Aline</td><td>Gasabo</td><td>92</td></tr>
</table>`,
    css: `table, th, td { border: 1px solid #d1d5db; border-collapse: collapse; }`,
    tasks: [
      "Add two more students.",
      "In styles.css give the table <code>width: 100%</code> and cells <code>padding: 8px</code>.",
      'Add a row where one cell spans two columns with <code>colspan="2"</code>.',
    ],
    solution: `<table>
  <tr><th>Name</th><th>District</th><th>Score</th></tr>
  <tr><td>Aline</td><td>Gasabo</td><td>92</td></tr>
  <tr><td>Eric</td><td>Huye</td><td>88</td></tr>
  <tr><td>Grace</td><td>Musanze</td><td>95</td></tr>
  <tr><td colspan="2">Average</td><td>91.7</td></tr>
</table>
/* styles.css */
table { width: 100%; }
th, td { padding: 8px; }`,
  }),
  htmlLesson({
    moduleId: "65fd924d-0976-4868-aff8-1d6ed03ad76b",
    moduleTitle: "HTML Lists",
    lessonTitle: "Lists: unordered, ordered and description",
    intro: `<p><code>&lt;ul&gt;</code> bullets, <code>&lt;ol&gt;</code> numbers (change markers with the <code>type</code> attribute: <code>type="A"</code>, <code>type="i"</code>), <code>&lt;dl&gt;</code> description lists with <code>&lt;dt&gt;</code>/<code>&lt;dd&gt;</code>. Style bullets with CSS <code>list-style-type</code>.</p>`,
    starter: `<ul>
  <li>Isombe</li>
  <li>Brochettes</li>
</ul>
<ol>
  <li>Wash</li>
  <li>Cook</li>
</ol>`,
    tasks: [
      'Make the ordered list use letters: <code>type="A"</code>.',
      "In styles.css change bullets to squares: <code>ul { list-style-type: square; }</code>.",
      "Add a <code>&lt;dl&gt;</code> that defines <em>HTML</em> and <em>CSS</em>.",
    ],
    solution: `<ul>
  <li>Isombe</li>
  <li>Brochettes</li>
</ul>
<ol type="A">
  <li>Wash</li>
  <li>Cook</li>
</ol>
<dl>
  <dt>HTML</dt><dd>Structure of a page</dd>
  <dt>CSS</dt><dd>How the page looks</dd>
</dl>
/* styles.css */
ul { list-style-type: square; }`,
  }),
];

export const htmlFoundations: CourseDraft = {
  key: "html",
  courseSlug: "html-foundations-for-web-development-1774357046635",
  lessons,
};
