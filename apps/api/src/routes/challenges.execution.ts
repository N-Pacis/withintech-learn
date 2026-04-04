import { badRequest } from '../utils/errors';

const EXECUTOR_URL = process.env.EXECUTOR_URL ?? 'http://localhost:4001';
const EXECUTOR_SECRET = process.env.EXECUTOR_SECRET ?? '';

export const SUPPORTED_CHALLENGE_LANGUAGES = ['python', 'java', 'javascript', 'c', 'cpp', 'go'] as const;
export type SupportedChallengeLanguage = typeof SUPPORTED_CHALLENGE_LANGUAGES[number];

export interface ChallengeExecutorTestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface ExecutorResultCase {
  passed: boolean;
  input: string;
  actualOutput: string;
  expectedOutput: string;
  stderr: string;
}

export interface ExecutorResponse {
  status: string;
  testsPassed: number;
  totalTests: number;
  compileError?: string;
  results: ExecutorResultCase[];
}

function looksLikeCompleteProgram(language: SupportedChallengeLanguage, code: string) {
  switch (language) {
    case 'python':
      return code.includes('__name__ == "__main__"') || code.includes('def main(');
    case 'java':
      return code.includes('class Main') || code.includes('public static void main(');
    case 'javascript':
      return code.includes('function main(') || code.includes('main();');
    case 'c':
      return code.includes('int main(');
    case 'cpp':
      return code.includes('int main(');
    case 'go':
      return code.includes('func main(') || code.includes('package main');
    default:
      return false;
  }
}

export function buildExecutableChallengeCode(language: SupportedChallengeLanguage, code: string) {
  if (looksLikeCompleteProgram(language, code)) {
    return code;
  }

  switch (language) {
    case 'python':
      return `${code.trimEnd()}

if __name__ == "__main__":
    solution()
`;
    case 'java':
      return `import java.io.*;
import java.util.*;

public class Main {
${indentBlock(code.trimEnd(), 1)}

    public static void main(String[] args) throws Exception {
        solution();
    }
}
`;
    case 'javascript':
      return `${code.trimEnd()}

solution();
`;
    case 'c':
      return `#include <stdio.h>

${code.trimEnd()}

int main(void) {
    solution();
    return 0;
}
`;
    case 'cpp':
      return `#include <iostream>
using namespace std;

${code.trimEnd()}

int main() {
    solution();
    return 0;
}
`;
    case 'go':
      return `package main

${code.trimEnd()}

func main() {
    solution()
}
`;
  }
}

function indentBlock(code: string, depth: number) {
  const indent = '    '.repeat(depth);
  return code
    .split('\n')
    .map((line) => line ? `${indent}${line}` : '')
    .join('\n');
}

export async function executeChallengeSubmission(data: {
  language: string;
  code: string;
  testCases: ChallengeExecutorTestCase[];
  timeLimit: number;
}) {
  if (!SUPPORTED_CHALLENGE_LANGUAGES.includes(data.language as SupportedChallengeLanguage)) {
    throw badRequest(`Unsupported language: ${data.language}`);
  }
  const language = data.language as SupportedChallengeLanguage;
  if (!data.code.trim()) {
    throw badRequest('Code cannot be empty');
  }
  if (data.testCases.length === 0) {
    throw badRequest('This challenge has no test cases yet');
  }

  try {
    const response = await fetch(`${EXECUTOR_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(EXECUTOR_SECRET ? { Authorization: `Bearer ${EXECUTOR_SECRET}` } : {}),
      },
      body: JSON.stringify({
        language: data.language,
        code: buildExecutableChallengeCode(language, data.code),
        testCases: data.testCases.map((testCase) => ({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
        })),
        timeLimit: data.timeLimit,
      }),
    });

    if (!response.ok) {
      throw new Error(`executor responded with ${response.status}`);
    }

    return await response.json() as ExecutorResponse;
  } catch (err) {
    throw badRequest(`Execution service unavailable: ${(err as Error).message}`);
  }
}

export function formatChallengeResults(
  executorResult: ExecutorResponse,
  testCases: ChallengeExecutorTestCase[],
  options?: { revealHidden?: boolean },
) {
  return executorResult.results.map((result, index) => {
    const testCase = testCases[index];
    if (!testCase) return result;

    if (testCase.isHidden && !options?.revealHidden && executorResult.status !== 'accepted') {
      return {
        passed: result.passed,
        input: null,
        actualOutput: null,
        expectedOutput: null,
        stderr: result.stderr,
      };
    }

    return result;
  });
}
