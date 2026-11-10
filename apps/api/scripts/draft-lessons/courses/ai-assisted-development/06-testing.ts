import { code, codeLines, image, playground, reveal, text, type LessonDraft } from "../../types";
import { testRunner } from "./widgets";

export const lesson: LessonDraft = {
  moduleId: "44e042a9-e8ae-42d6-ac93-abc82aacc8c9",
  moduleTitle: "Testing, Validation & Quality with AI",
  lessonTitle: "Get a real test suite in minutes with pytest",
  blocks: [
    text(`
<p>Tests are the safety net that lets you move fast with AI. The good news: writing them is exactly the kind of repetitive, pattern-heavy work AI is great at. The biggest benefit is reaching thorough coverage much faster.</p>
<h3>Step 1: generate tests from the code</h3>
<p>The fastest way to a solid unit test suite for a new function: ask AI to generate <strong>pytest</strong> tests from the function's code.</p>
`),
    image("ai-assisted-development/test-pyramid.png"),
    code(
      "text",
      `
Act as a QA engineer. Here is total_by_category() (pasted below).
Write pytest tests covering: normal input, empty list, negative amounts,
a single category, and float amounts. Use a fixture for sample expenses.
Test names must describe the behaviour. Return only the test file.
`,
    ),
    code(
      "python",
      `
import pytest
from tracker import total_by_category

@pytest.fixture
def expenses():
    return [
        {"category": "food", "amount": 3200.0},
        {"category": "transport", "amount": 1500.0},
        {"category": "food", "amount": 800.5},
    ]

def test_sums_amounts_per_category(expenses):
    assert total_by_category(expenses) == {"food": 4000.5, "transport": 1500.0}

def test_returns_empty_dict_for_no_expenses():
    assert total_by_category([]) == {}

def test_ignores_negative_amounts():
    assert total_by_category([{"category": "food", "amount": -50}]) == {}
`,
    ),
    text(`
<ul>
<li><strong>Fixtures</strong> give reusable setup; ask for them by name.</li>
<li><strong>Descriptive test names</strong> (<code>test_ignores_negative_amounts</code>) document behaviour; <code>test_1</code> tells you nothing when it fails.</li>
<li>"Act as a QA engineer" pushes the AI to find missing cases and improve quality, not just restate the happy path.</li>
</ul>
<h3>Step 2: run, then feed failures back</h3>
`),
    code("bash", "pytest -q"),
    text(`
<p>When generated tests fail, feed the failure output back to AI for fixes, and ask it to tell you whether the <em>test</em> or the <em>code</em> is wrong. Sometimes the test caught a real bug. That's the point.</p>
<h3>Step 3: mock what you don't control</h3>
<p>Mocking is most useful when your code calls external services or APIs, like an exchange-rate API or MoMo. You test your logic without network calls:</p>
`),
    code(
      "python",
      `
from unittest.mock import patch
from tracker import convert_to_usd

@patch("tracker.fetch_rate", return_value=1300.0)
def test_converts_rwf_to_usd(mock_rate):
    assert convert_to_usd(13000) == 10.0
`,
    ),
    playground(testRunner),
    text(`
<h3>Step 4: property-based tests</h3>
<p>Example tests check cases you thought of. Property-based tests (with the <code>hypothesis</code> library) check general invariants and rules across many generated inputs, e.g. "the total is never negative" or "the sum of category totals equals the sum of all amounts".</p>
<h3>Step 5: close the coverage gaps</h3>
<p>To reach high coverage quickly, prompt AI with the existing code plus your current tests and ask for tests that cover what's missing. Run <code>pytest --cov</code> to check.</p>
<h3>Try it</h3>
<p>Generate tests for <code>load_expenses()</code> from the last lesson, including a corrupt JSON file. Run them, and fix whatever fails.</p>
${reveal(
  "Show a sample answer",
  `<p>Good tests use pytest's <code>tmp_path</code> fixture so they never touch your real data file:</p>
${codeLines(`
def test_returns_empty_list_when_file_missing(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "DATA_FILE", tmp_path / "expenses.json")
    assert storage.load_expenses() == []

def test_returns_empty_list_when_file_is_corrupt(tmp_path, monkeypatch):
    bad = tmp_path / "expenses.json"
    bad.write_text("{not json")
    monkeypatch.setattr(storage, "DATA_FILE", bad)
    assert storage.load_expenses() == []
`)}`,
)}
<h3>Key takeaways</h3>
<ul>
<li>Generate pytest tests from the function; ask for fixtures and descriptive names.</li>
<li>Feed failures back; mock external services; use property-based tests for invariants.</li>
<li>Give the AI code + current tests to fill coverage gaps.</li>
</ul>
`),
  ],
};
