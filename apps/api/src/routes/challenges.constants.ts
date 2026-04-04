// ─── Supported param types ────────────────────────────────────────────────────

export const PARAM_TYPES = [
  'int', 'float', 'double', 'char', 'string',
  'int[]', 'float[]', 'double[]', 'char[]', 'string[]',
  'int[][]', 'float[][]', 'double[][]', 'char[][]', 'string[][]',
] as const;

export type ParamType = typeof PARAM_TYPES[number];

export interface FunctionParam {
  name: string;
  type: ParamType;
}

// ─── Type helpers ─────────────────────────────────────────────────────────────

export function isArrayType(t: string): boolean  { return t.endsWith('[]'); }
export function is2DArrayType(t: string): boolean { return t.endsWith('[][]'); }
export function elemType(t: string): string {
  if (t.endsWith('[][]')) return t.slice(0, -4);
  if (t.endsWith('[]'))   return t.slice(0, -2);
  return t;
}

// ─── Language type mappings ───────────────────────────────────────────────────

const PYTHON_BASE: Record<string, string> = {
  int: 'int', float: 'float', double: 'float', char: 'str', string: 'str',
};
export function pythonTypeHint(t: string): string {
  const base = PYTHON_BASE[elemType(t)] ?? 'Any';
  if (is2DArrayType(t)) return `List[List[${base}]]`;
  if (isArrayType(t))   return `List[${base}]`;
  return base;
}

const JAVA_BASE: Record<string, string> = {
  int: 'int', float: 'float', double: 'double', char: 'char', string: 'String',
};
export function javaType(t: string): string {
  const base = JAVA_BASE[elemType(t)] ?? 'Object';
  if (is2DArrayType(t)) return `${base}[][]`;
  if (isArrayType(t))   return `${base}[]`;
  return base;
}

const CPP_BASE: Record<string, string> = {
  int: 'int', float: 'float', double: 'double', char: 'char', string: 'string',
};
export function cppType(t: string, asParam = false): string {
  const base = CPP_BASE[elemType(t)] ?? 'auto';
  if (is2DArrayType(t)) return asParam ? `vector<vector<${base}>>&` : `vector<vector<${base}>>`;
  if (isArrayType(t))   return asParam ? `vector<${base}>&`          : `vector<${base}>`;
  return base;
}

const C_BASE: Record<string, string> = {
  int: 'int', float: 'float', double: 'double', char: 'char', string: 'char*',
};
export function cBaseType(et: string): string {
  return C_BASE[et] ?? 'void*';
}
export function cReturnType(t: string): string {
  if (is2DArrayType(t)) return `${cBaseType(elemType(t))}**`;
  if (isArrayType(t))   return `${cBaseType(elemType(t))}*`;
  return cBaseType(t);
}

const GO_BASE: Record<string, string> = {
  int: 'int', float: 'float64', double: 'float64', char: 'byte', string: 'string',
};
export function goType(t: string): string {
  const base = GO_BASE[elemType(t)] ?? 'interface{}';
  if (is2DArrayType(t)) return `[][]${base}`;
  if (isArrayType(t))   return `[]${base}`;
  return base;
}

const JSDOC_BASE: Record<string, string> = {
  int: 'number', float: 'number', double: 'number', char: 'string', string: 'string',
};
export function jsDocType(t: string): string {
  const base = JSDOC_BASE[elemType(t)] ?? 'any';
  if (is2DArrayType(t)) return `${base}[][]`;
  if (isArrayType(t))   return `${base}[]`;
  return base;
}

// ─── Default return value per language ───────────────────────────────────────

export function defaultReturnValue(language: string, t: string): string {
  if (t === 'void') return '';
  const et = elemType(t);
  if (is2DArrayType(t) || isArrayType(t)) {
    switch (language) {
      case 'python':     return '[]';
      case 'javascript': return '[]';
      case 'java':       return is2DArrayType(t) ? 'null' : `new ${JAVA_BASE[et] ?? 'Object'}[0]`;
      case 'cpp':        return '{}';
      case 'c':          return 'NULL';
      case 'go':         return 'nil';
    }
  }
  if (et === 'int')                        return '0';
  if (et === 'float' || et === 'double')   return language === 'python' || language === 'javascript' ? '0.0' : '0.0';
  if (et === 'char')                       return language === 'java' ? "'\\0'" : language === 'python' ? "' '" : "' '";
  if (et === 'string')                     return language === 'java' ? '""' : language === 'c' ? 'NULL' : '""';
  return '0';
}

// ─── Starter code generation ──────────────────────────────────────────────────

export function generateStarterCode(params: FunctionParam[], returnType: string) {
  return {
    python:     buildPythonStarter(params, returnType),
    java:       buildJavaStarter(params, returnType),
    javascript: buildJsStarter(params, returnType),
    c:          buildCStarter(params, returnType),
    cpp:        buildCppStarter(params, returnType),
    go:         buildGoStarter(params, returnType),
  };
}

function buildPythonStarter(params: FunctionParam[], returnType: string): string {
  const needsList = params.some(p => isArrayType(p.type)) || isArrayType(returnType);
  const imports   = needsList ? 'from typing import List\n\n' : '';
  const paramList = params.map(p => `${p.name}: ${pythonTypeHint(p.type)}`).join(', ');
  const retHint   = returnType === 'void' ? '' : ` -> ${pythonTypeHint(returnType)}`;
  const body      = returnType === 'void'
    ? '\n    # Type your solution here\n    pass\n'
    : `\n    # Type your solution here\n    return ${defaultReturnValue('python', returnType)}\n`;
  return `${imports}def solution(${paramList})${retHint}:${body}`;
}

function buildJsStarter(params: FunctionParam[], returnType: string): string {
  const jsDocs    = params.map(p => ` * @param {${jsDocType(p.type)}} ${p.name}`).join('\n');
  const retDoc    = returnType === 'void' ? '' : `\n * @return {${jsDocType(returnType)}}`;
  const paramList = params.map(p => p.name).join(', ');
  const body      = returnType === 'void'
    ? '\n  // Type your solution here\n'
    : `\n  // Type your solution here\n  return ${defaultReturnValue('javascript', returnType)};\n`;
  return `/**\n${jsDocs}${retDoc}\n */\nfunction solution(${paramList}) {${body}}\n`;
}

function buildJavaStarter(params: FunctionParam[], returnType: string): string {
  const jRetType  = javaType(returnType === 'void' ? 'void' : returnType);
  const paramList = params.map(p => `${javaType(p.type)} ${p.name}`).join(', ');
  const body      = returnType === 'void'
    ? '\n    // Type your solution here\n'
    : `\n    // Type your solution here\n    return ${defaultReturnValue('java', returnType)};\n`;
  return `public static ${jRetType} solution(${paramList}) {${body}}\n`;
}

function buildCppStarter(params: FunctionParam[], returnType: string): string {
  const cppRetType = returnType === 'void' ? 'void' : cppType(returnType);
  const paramList  = params.map(p => `${cppType(p.type, true)} ${p.name}`).join(', ');
  const body       = returnType === 'void'
    ? '\n    // Type your solution here\n'
    : `\n    // Type your solution here\n    return ${defaultReturnValue('cpp', returnType)};\n`;
  return `${cppRetType} solution(${paramList}) {${body}}\n`;
}

function buildCStarter(params: FunctionParam[], returnType: string): string {
  // For C, array params become (type* name, int nameSize)
  // For C, array returns: (type* name, int* returnSize) — returnSize is an out-param
  const cParams: string[] = params.flatMap(p => {
    if (is2DArrayType(p.type)) {
      const bt = cBaseType(elemType(p.type));
      return [`${bt}** ${p.name}`, `int ${p.name}Rows`, `int ${p.name}Cols`];
    }
    if (isArrayType(p.type)) {
      const bt = cBaseType(elemType(p.type));
      return [`${bt}* ${p.name}`, `int ${p.name}Size`];
    }
    return [`${cBaseType(p.type)} ${p.name}`];
  });
  // Array return type: add int* returnSize param
  if (isArrayType(returnType) && !is2DArrayType(returnType)) {
    cParams.push('int* returnSize');
  }
  const cRetType  = returnType === 'void' ? 'void' : cReturnType(returnType);
  const paramList = cParams.join(', ') || 'void';
  const body      = returnType === 'void'
    ? '\n    // Type your solution here\n'
    : isArrayType(returnType)
      ? `\n    // Type your solution here\n    *returnSize = 0;\n    return ${defaultReturnValue('c', returnType)};\n`
      : `\n    // Type your solution here\n    return ${defaultReturnValue('c', returnType)};\n`;
  return `${cRetType} solution(${paramList}) {${body}}\n`;
}

function buildGoStarter(params: FunctionParam[], returnType: string): string {
  const paramList = params.map(p => `${p.name} ${goType(p.type)}`).join(', ');
  const retDecl   = returnType === 'void' ? '' : ` ${goType(returnType)}`;
  const body      = returnType === 'void'
    ? '\n\t// Type your solution here\n'
    : `\n\t// Type your solution here\n\treturn ${defaultReturnValue('go', returnType)}\n`;
  return `func solution(${paramList})${retDecl} {${body}}\n`;
}

// ─── Default starter code (no function params — fallback) ─────────────────────

export const DEFAULT_CHALLENGE_STARTER_CODE = {
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
} as const;
