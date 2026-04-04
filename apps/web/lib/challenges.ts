import type { ChallengeLanguage } from '@/hooks/queries/challenges';

export const CHALLENGE_LANGUAGES: { value: ChallengeLanguage; label: string }[] = [
  { value: 'python', label: 'Python 3' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
];

export const DEFAULT_STARTER_CODE: Record<ChallengeLanguage, string> = {
  python: `def solution():
    # Type your solution here
`,
  java: `public static void solution() throws Exception {
    // Type your solution here
}
`,
  javascript: `function solution() {
  // Type your solution here
}
`,
  c: `void solution(void) {
    // Type your solution here
}
`,
  cpp: `void solution() {
    // Type your solution here
}
`,
  go: `func solution() {
    // Type your solution here
}
`,
};

export function normalizeVisibleChallengeCode(language: ChallengeLanguage, code?: string | null) {
  if (!code?.trim()) {
    return DEFAULT_STARTER_CODE[language];
  }

  switch (language) {
    case 'python':
      if (code.includes('__name__ == "__main__"') || code.includes('def main(')) {
        return DEFAULT_STARTER_CODE.python;
      }
      break;
    case 'java':
      if (code.includes('class Main') || code.includes('public static void main(')) {
        return DEFAULT_STARTER_CODE.java;
      }
      break;
    case 'javascript':
      if (code.includes('function main(') || code.includes('main();')) {
        return DEFAULT_STARTER_CODE.javascript;
      }
      break;
    case 'c':
    case 'cpp':
      if (code.includes('int main(')) {
        return DEFAULT_STARTER_CODE[language];
      }
      break;
    case 'go':
      if (code.includes('func main(') || code.includes('package main')) {
        return DEFAULT_STARTER_CODE.go;
      }
      break;
  }

  return code;
}
