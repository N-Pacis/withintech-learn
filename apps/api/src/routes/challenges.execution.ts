import { badRequest } from '../utils/errors';
import {
  type FunctionParam,
  isArrayType,
  is2DArrayType,
  elemType,
  javaType,
  cppType,
  cBaseType,
  cReturnType,
  goType,
} from './challenges.constants';

const EXECUTOR_URL    = process.env.EXECUTOR_URL    ?? 'http://localhost:4001';
const EXECUTOR_SECRET = process.env.EXECUTOR_SECRET ?? '';

export const SUPPORTED_CHALLENGE_LANGUAGES = ['python', 'java', 'javascript', 'c', 'cpp', 'go'] as const;
export type SupportedChallengeLanguage = typeof SUPPORTED_CHALLENGE_LANGUAGES[number];

export interface ChallengeExecutorTestCase {
  input:          string;
  expectedOutput: string;
  isHidden?:      boolean;
}

export interface ExecutorResultCase {
  passed:         boolean;
  input:          string;
  actualOutput:   string;
  expectedOutput: string;
  stderr:         string;
}

export interface ExecutorResponse {
  status:        string;
  testsPassed:   number;
  totalTests:    number;
  compileError?: string;
  results:       ExecutorResultCase[];
}

// ─── Stdin format conversion ──────────────────────────────────────────────────
// Python + JS receive raw JSON:  [[2,7,11,15],9]
// Java / Go / C / C++ receive line-based tokens (easier to parse without external JSON libs)

function needsLineBased(language: SupportedChallengeLanguage): boolean {
  return language === 'java' || language === 'go' || language === 'c' || language === 'cpp';
}

function toLineBasedStdin(inputJson: string, params: FunctionParam[]): string {
  const values = JSON.parse(inputJson) as unknown[];
  const lines:  string[] = [];

  for (let i = 0; i < params.length; i++) {
    const { type } = params[i];
    const value    = values[i];

    if (is2DArrayType(type)) {
      const rows = (value as unknown[][]).length;
      const cols = rows > 0 ? (value as unknown[][])[0].length : 0;
      lines.push(`${rows} ${cols}`);
      const et = elemType(type);
      for (const row of value as unknown[][]) {
        if (et === 'string') {
          // each element on its own line; cols per row tracked by the count line
          for (const s of row as string[]) lines.push(String(s));
        } else {
          lines.push((row as number[]).join(' '));
        }
      }
    } else if (isArrayType(type)) {
      const et  = elemType(type);
      const arr = value as unknown[];
      if (et === 'string') {
        lines.push(String(arr.length));
        for (const s of arr) lines.push(String(s));
      } else {
        lines.push(`${arr.length} ${arr.join(' ')}`);
      }
    } else {
      lines.push(String(value));
    }
  }

  return lines.join('\n');
}

// ─── Output print code per return type ───────────────────────────────────────

function javaPrintResult(returnType: string): string {
  if (returnType === 'void') return '        solution(_CALL_ARGS_);\n';
  const et = elemType(returnType);
  if (is2DArrayType(returnType)) {
    return [
      '        StringBuilder _sb = new StringBuilder("[");',
      '        for (int _i = 0; _i < _result.length; _i++) {',
      '            if (_i > 0) _sb.append(",");',
      '            _sb.append("[");',
      '            for (int _j = 0; _j < _result[_i].length; _j++) {',
      '                if (_j > 0) _sb.append(",");',
      et === 'string'
        ? '                _sb.append("\\"").append(_result[_i][_j].replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"")).append("\\"");'
        : '                _sb.append(_result[_i][_j]);',
      '            }',
      '            _sb.append("]");',
      '        }',
      '        _sb.append("]");',
      '        System.out.println(_sb);',
    ].join('\n') + '\n';
  }
  if (isArrayType(returnType)) {
    return [
      '        StringBuilder _sb = new StringBuilder("[");',
      '        for (int _i = 0; _i < _result.length; _i++) {',
      '            if (_i > 0) _sb.append(",");',
      et === 'string'
        ? '            _sb.append("\\"").append(_result[_i].replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"")).append("\\"");'
        : '            _sb.append(_result[_i]);',
      '        }',
      '        _sb.append("]");',
      '        System.out.println(_sb);',
    ].join('\n') + '\n';
  }
  return '        System.out.println(_result);\n';
}

function cppPrintResult(returnType: string): string {
  if (returnType === 'void') return '    solution(_CALL_ARGS_);\n';
  const et = elemType(returnType);
  if (is2DArrayType(returnType)) {
    return [
      '    cout << "[";',
      '    for (size_t _i = 0; _i < _result.size(); _i++) {',
      '        if (_i > 0) cout << ",";',
      '        cout << "[";',
      '        for (size_t _j = 0; _j < _result[_i].size(); _j++) {',
      '            if (_j > 0) cout << ",";',
      et === 'string' ? '            cout << "\\"" << _result[_i][_j] << "\\"";' : '            cout << _result[_i][_j];',
      '        }',
      '        cout << "]";',
      '    }',
      '    cout << "]" << endl;',
    ].join('\n') + '\n';
  }
  if (isArrayType(returnType)) {
    return [
      '    cout << "[";',
      '    for (size_t _i = 0; _i < _result.size(); _i++) {',
      '        if (_i > 0) cout << ",";',
      et === 'string' ? '        cout << "\\"" << _result[_i] << "\\"";' : '        cout << _result[_i];',
      '    }',
      '    cout << "]" << endl;',
    ].join('\n') + '\n';
  }
  if (et === 'char')   return '    cout << _result << endl;\n';
  if (et === 'string') return '    cout << _result << endl;\n';
  return '    cout << _result << endl;\n';
}

function cPrintResult(returnType: string): string {
  if (returnType === 'void') return '    solution(_CALL_ARGS_);\n';
  const et = elemType(returnType);
  if (isArrayType(returnType)) {
    // C array return: solution returns int* and fills *returnSize
    const fmt = et === 'float' ? '%g' : et === 'double' ? '%g' : et === 'char' ? '%c' : et === 'string' ? '%s' : '%d';
    return [
      '    printf("[");',
      '    for (int _i = 0; _i < _returnSize; _i++) {',
      '        if (_i > 0) printf(",");',
      et === 'string' ? '        printf("\\"%s\\"", _result[_i]);' : `        printf("${fmt}", _result[_i]);`,
      '    }',
      '    printf("]\\n");',
    ].join('\n') + '\n';
  }
  const fmts: Record<string, string> = { int: '%d', float: '%g', double: '%g', char: '%c', string: '%s' };
  return `    printf("${fmts[et] ?? '%d'}\\n", _result);\n`;
}

function goPrintResult(returnType: string): string {
  if (returnType === 'void') return '\tsolution(_CALL_ARGS_)\n';
  const et = elemType(returnType);
  if (is2DArrayType(returnType)) {
    return [
      '\tfmt.Print("[")',
      '\tfor _i, _row := range _result {',
      '\t\tif _i > 0 { fmt.Print(",") }',
      '\t\tfmt.Print("[")',
      '\t\tfor _j, _v := range _row {',
      '\t\t\tif _j > 0 { fmt.Print(",") }',
      et === 'string' ? '\t\t\tfmt.Printf("\\"%s\\"", _v)' : '\t\t\tfmt.Print(_v)',
      '\t\t}',
      '\t\tfmt.Print("]")',
      '\t}',
      '\tfmt.Println("]")',
    ].join('\n') + '\n';
  }
  if (isArrayType(returnType)) {
    return [
      '\tfmt.Print("[")',
      '\tfor _i, _v := range _result {',
      '\t\tif _i > 0 { fmt.Print(",") }',
      et === 'string' ? '\t\tfmt.Printf("\\"%s\\"", _v)' : '\t\tfmt.Print(_v)',
      '\t}',
      '\tfmt.Println("]")',
    ].join('\n') + '\n';
  }
  return '\tfmt.Println(_result)\n';
}

// ─── Stdin parsing code per language ─────────────────────────────────────────

function javaParsing(params: FunctionParam[]): string {
  const lines: string[] = [
    '        BufferedReader _br = new BufferedReader(new InputStreamReader(System.in));',
    '        String[] _parts;',
  ];
  for (const { name, type } of params) {
    const et = elemType(type);
    const jt = javaType(type);
    if (is2DArrayType(type)) {
      const bjt = javaType(et);
      lines.push(
        `        _parts = _br.readLine().trim().split("\\\\s+");`,
        `        int _${name}Rows = Integer.parseInt(_parts[0]);`,
        `        int _${name}Cols = Integer.parseInt(_parts[1]);`,
        `        ${bjt}[][] ${name} = new ${bjt}[_${name}Rows][_${name}Cols];`,
        `        for (int _i = 0; _i < _${name}Rows; _i++) {`,
        et === 'string'
          ? `            for (int _j = 0; _j < _${name}Cols; _j++) ${name}[_i][_j] = _br.readLine();`
          : `            _parts = _br.readLine().trim().split("\\\\s+");` +
            `\n            for (int _j = 0; _j < _${name}Cols; _j++) ${name}[_i][_j] = ${javaParseScalar(et, '_parts[_j]')};`,
        `        }`,
      );
    } else if (isArrayType(type)) {
      const bjt = javaType(et);
      if (et === 'string') {
        lines.push(
          `        int _${name}Len = Integer.parseInt(_br.readLine().trim());`,
          `        ${bjt}[] ${name} = new ${bjt}[_${name}Len];`,
          `        for (int _i = 0; _i < _${name}Len; _i++) ${name}[_i] = _br.readLine();`,
        );
      } else {
        lines.push(
          `        _parts = _br.readLine().trim().split("\\\\s+");`,
          `        int _${name}Len = Integer.parseInt(_parts[0]);`,
          `        ${jt} ${name} = new ${bjt}[_${name}Len];`,
          `        for (int _i = 0; _i < _${name}Len; _i++) ${name}[_i] = ${javaParseScalar(et, '_parts[_i + 1]')};`,
        );
      }
    } else if (et === 'string') {
      lines.push(`        String ${name} = _br.readLine();`);
    } else if (et === 'char') {
      lines.push(`        char ${name} = _br.readLine().trim().charAt(0);`);
    } else {
      lines.push(`        ${jt} ${name} = ${javaParseScalar(et, '_br.readLine().trim()')};`);
    }
  }
  return lines.join('\n');
}

function javaParsingBody(params: FunctionParam[]): string {
  return javaParsing(params).split('\n').slice(2).join('\n');
}

function javaParseScalar(et: string, expr: string): string {
  if (et === 'int')    return `Integer.parseInt(${expr})`;
  if (et === 'float')  return `Float.parseFloat(${expr})`;
  if (et === 'double') return `Double.parseDouble(${expr})`;
  return expr;
}

function goParsing(params: FunctionParam[]): string {
  const lines: string[] = [
    '\t_reader := bufio.NewReader(os.Stdin)',
    '\tvar _line string',
    '\tvar _parts []string',
  ];
  for (const { name, type } of params) {
    const et = elemType(type);
    const gt = goType(type);
    if (is2DArrayType(type)) {
      lines.push(
        `\t_line, _ = _reader.ReadString('\\n')`,
        `\t_parts = strings.Fields(_line)`,
        `\t_${name}Rows, _ := strconv.Atoi(_parts[0])`,
        `\t_${name}Cols, _ := strconv.Atoi(_parts[1])`,
        `\t${name} := make(${gt}, _${name}Rows)`,
        `\tfor _i := range ${name} {`,
        `\t\t${name}[_i] = make([]${goType(et)}, _${name}Cols)`,
        `\t\t_line, _ = _reader.ReadString('\\n')`,
        et === 'string'
          ? `\t\t${name}[_i][0] = strings.TrimSpace(_line) // single string per cell (extend as needed)`
          : `\t\t_parts = strings.Fields(_line)\n\t\tfor _j := range ${name}[_i] { ${name}[_i][_j], _ = ${goParseScalar(et, '_parts[_j]')} }`,
        `\t}`,
      );
    } else if (isArrayType(type)) {
      if (et === 'string') {
        lines.push(
          `\t_line, _ = _reader.ReadString('\\n')`,
          `\t_${name}Len, _ := strconv.Atoi(strings.TrimSpace(_line))`,
          `\t${name} := make([]string, _${name}Len)`,
          `\tfor _i := range ${name} { _line, _ = _reader.ReadString('\\n'); ${name}[_i] = strings.TrimSpace(_line) }`,
        );
      } else {
        lines.push(
          `\t_line, _ = _reader.ReadString('\\n')`,
          `\t_parts = strings.Fields(_line)`,
          `\t_${name}Len, _ := strconv.Atoi(_parts[0])`,
          `\t${name} := make(${gt}, _${name}Len)`,
          `\tfor _i := range ${name} { ${name}[_i], _ = ${goParseScalar(et, '_parts[_i+1]')} }`,
        );
      }
    } else if (et === 'string') {
      lines.push(`\t_line, _ = _reader.ReadString('\\n')`, `\t${name} := strings.TrimSpace(_line)`);
    } else if (et === 'char') {
      lines.push(`\t_line, _ = _reader.ReadString('\\n')`, `\t${name} := strings.TrimSpace(_line)[0]`);
    } else {
      lines.push(
        `\t_line, _ = _reader.ReadString('\\n')`,
        `\t${name}, _ := ${goParseScalar(et, 'strings.TrimSpace(_line)')}`,
      );
    }
  }
  return lines.join('\n');
}

function goParsingBody(params: FunctionParam[]): string {
  return goParsing(params).split('\n').slice(3).join('\n');
}

function goParseScalar(et: string, expr: string): string {
  if (et === 'int')            return `strconv.Atoi(${expr})`;
  if (et === 'float' || et === 'double') return `strconv.ParseFloat(${expr}, 64)`;
  return `${expr}, nil`;
}

function cppParsing(params: FunctionParam[]): string {
  const lines: string[] = [];
  for (const { name, type } of params) {
    const et  = elemType(type);
    const cpt = cppType(type);
    if (is2DArrayType(type)) {
      lines.push(
        `    int _${name}Rows, _${name}Cols;`,
        `    cin >> _${name}Rows >> _${name}Cols;`,
        `    ${cpt} ${name}(_${name}Rows, ${cppType(et + '[]')}(_${name}Cols));`,
        `    for (int _i = 0; _i < _${name}Rows; _i++) {`,
        et === 'string'
          ? `        cin.ignore();\n        for (int _j = 0; _j < _${name}Cols; _j++) getline(cin, ${name}[_i][_j]);`
          : `        for (int _j = 0; _j < _${name}Cols; _j++) cin >> ${name}[_i][_j];`,
        `    }`,
      );
    } else if (isArrayType(type)) {
      lines.push(`    int _${name}N; cin >> _${name}N;`);
      if (et === 'string') {
        lines.push(
          `    cin.ignore();`,
          `    ${cpt} ${name}(_${name}N);`,
          `    for (int _i = 0; _i < _${name}N; _i++) getline(cin, ${name}[_i]);`,
        );
      } else {
        lines.push(
          `    ${cpt} ${name}(_${name}N);`,
          `    for (int _i = 0; _i < _${name}N; _i++) cin >> ${name}[_i];`,
        );
      }
    } else if (et === 'string') {
      lines.push(`    string ${name}; cin.ignore(); getline(cin, ${name});`);
    } else if (et === 'char') {
      lines.push(`    char ${name}; cin >> ${name};`);
    } else {
      lines.push(`    ${cpt} ${name}; cin >> ${name};`);
    }
  }
  return lines.join('\n');
}

function cParsing(params: FunctionParam[]): string {
  const lines: string[] = [];
  for (const { name, type } of params) {
    const et = elemType(type);
    if (is2DArrayType(type)) {
      const bt = cBaseType(et);
      lines.push(
        `    int _${name}Rows, _${name}Cols;`,
        `    scanf("%d %d", &_${name}Rows, &_${name}Cols);`,
        et === 'string'
          ? [
              `    char** ${name} = (char**)malloc(_${name}Rows * _${name}Cols * sizeof(char*));`,
              `    for (int _i = 0; _i < _${name}Rows * _${name}Cols; _i++) {`,
              `        ${name}[_i] = (char*)malloc(1024); scanf(" %1023s", ${name}[_i]);`,
              `    }`,
            ].join('\n')
          : [
              `    ${bt}** ${name} = (${bt}**)malloc(_${name}Rows * sizeof(${bt}*));`,
              `    for (int _i = 0; _i < _${name}Rows; _i++) {`,
              `        ${name}[_i] = (${bt}*)malloc(_${name}Cols * sizeof(${bt}));`,
              `        for (int _j = 0; _j < _${name}Cols; _j++) scanf(" ${cScanfFmt(et)}", &${name}[_i][_j]);`,
              `    }`,
            ].join('\n'),
      );
    } else if (isArrayType(type)) {
      const bt = cBaseType(et);
      lines.push(`    int _${name}N; scanf("%d", &_${name}N);`);
      if (et === 'string') {
        lines.push(
          `    char** ${name} = (char**)malloc(_${name}N * sizeof(char*));`,
          `    for (int _i = 0; _i < _${name}N; _i++) {`,
          `        ${name}[_i] = (char*)malloc(1024); scanf(" %1023s", ${name}[_i]);`,
          `    }`,
        );
      } else {
        lines.push(
          `    ${bt}* ${name} = (${bt}*)malloc(_${name}N * sizeof(${bt}));`,
          `    for (int _i = 0; _i < _${name}N; _i++) scanf(" ${cScanfFmt(et)}", &${name}[_i]);`,
        );
      }
    } else if (et === 'string') {
      lines.push(`    char* ${name} = (char*)malloc(65536); scanf(" %65535s", ${name});`);
    } else if (et === 'char') {
      lines.push(`    char ${name}; scanf(" %c", &${name});`);
    } else {
      lines.push(`    ${cBaseType(et)} ${name}; scanf("${cScanfFmt(et)}", &${name});`);
    }
  }
  return lines.join('\n');
}

function cScanfFmt(et: string): string {
  return et === 'float' ? '%f' : et === 'double' ? '%lf' : et === 'char' ? '%c' : '%d';
}

// ─── Call arguments per language ─────────────────────────────────────────────

function callArgs(language: SupportedChallengeLanguage, params: FunctionParam[], returnType: string): string {
  if (language === 'c') {
    const args = params.flatMap(({ name, type }) => {
      if (is2DArrayType(type))  return [name, `_${name}Rows`, `_${name}Cols`];
      if (isArrayType(type))    return [name, `_${name}N`];
      return [name];
    });
    if (isArrayType(returnType) && !is2DArrayType(returnType)) args.push('&_returnSize');
    return args.join(', ');
  }
  if (language === 'cpp') {
    return params.map(({ name }) => name).join(', ');
  }
  return params.map(({ name }) => name).join(', ');
}

// ─── Code wrapper builders ────────────────────────────────────────────────────

export function buildExecutableChallengeCode(
  language: SupportedChallengeLanguage,
  userCode: string,
  params?: FunctionParam[],
  returnType?: string,
): string {
  // Legacy mode: no function params defined, fall back to old stdin-passthrough behaviour
  if (!params || params.length === 0 || !returnType) {
    return buildLegacyWrapper(language, userCode);
  }

  const call = callArgs(language, params, returnType);

  switch (language) {
    case 'python':
      return buildPythonWrapper2(userCode, params, returnType, call);
    case 'javascript':
      return buildJsWrapper(userCode, params, returnType, call);
    case 'java':
      return buildJavaWrapper(userCode, params, returnType, call);
    case 'cpp':
      return buildCppWrapper(userCode, params, returnType, call);
    case 'c':
      return buildCWrapper(userCode, params, returnType, call);
    case 'go':
      return buildGoWrapper(userCode, params, returnType, call);
  }
}

// ─── Per-language wrappers ────────────────────────────────────────────────────

function buildPythonWrapper2(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const bindings   = params.map((p, i) => `${p.name} = _args[${i}]`).join('\n');
  const lines: string[] = [
    userCode.trimEnd(),
    '',
    'import sys as _sys, json as _json',
    '_args = _json.loads(_sys.stdin.read().strip())',
    bindings,
  ];
  if (returnType === 'void') {
    lines.push(`solution(${call})`);
  } else if (isArrayType(returnType)) {
    lines.push(`_result = solution(${call})`);
    lines.push('print(_json.dumps(_result, separators=(\',\', \':\')))', '');
  } else {
    lines.push(`_result = solution(${call})`, 'print(_result)', '');
  }
  return lines.join('\n');
}

function buildJsWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const bindings = params.map((p, i) => `const ${p.name} = _args[${i}];`).join('\n');
  return [
    userCode.trimEnd(),
    '',
    "const _args = JSON.parse(require('fs').readFileSync(0, 'utf8').trim());",
    bindings,
    returnType === 'void'
      ? `solution(${call});`
      : `const _result = solution(${call});`,
    returnType !== 'void'
      ? (isArrayType(returnType)
          ? "process.stdout.write(JSON.stringify(_result) + '\\n');"
          : "process.stdout.write(String(_result) + '\\n');")
      : '',
  ].filter(l => l !== '').join('\n') + '\n';
}

function buildJavaWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing  = javaParsing(params);
  const jRetType = returnType === 'void' ? 'void' : javaType(returnType);

  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`        solution(${call});`);
  } else {
    resultLines.push(`        ${jRetType} _result = solution(${call});`);
    resultLines.push(javaPrintResult(returnType).trimEnd());
  }

  return [
    'import java.io.*;',
    'import java.util.*;',
    '',
    'public class Main {',
    indentBlock(userCode.trimEnd(), 1),
    '',
    '    @SuppressWarnings("all")',
    '    public static void main(String[] args) throws Exception {',
    parsing,
    resultLines.join('\n'),
    '    }',
    '}',
    '',
  ].join('\n');
}

function buildCppWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing   = cppParsing(params);
  const cppRetType = returnType === 'void' ? 'void' : cppType(returnType);

  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`    solution(${call});`);
  } else {
    resultLines.push(`    ${cppRetType} _result = solution(${call});`);
    resultLines.push(cppPrintResult(returnType).trimEnd());
  }

  return [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    '#include <sstream>',
    'using namespace std;',
    '',
    userCode.trimEnd(),
    '',
    'int main() {',
    parsing,
    resultLines.join('\n'),
    '    return 0;',
    '}',
    '',
  ].join('\n');
}

function buildCWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing   = cParsing(params);
  const cRetType  = returnType === 'void' ? 'void' : cReturnType(returnType);

  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`    solution(${call});`);
  } else {
    if (isArrayType(returnType) && !is2DArrayType(returnType)) {
      resultLines.push('    int _returnSize = 0;');
    }
    resultLines.push(`    ${cRetType} _result = solution(${call});`);
    resultLines.push(cPrintResult(returnType).trimEnd());
  }

  return [
    '#include <stdio.h>',
    '#include <stdlib.h>',
    '#include <string.h>',
    '',
    userCode.trimEnd(),
    '',
    'int main(void) {',
    parsing,
    resultLines.join('\n'),
    '    return 0;',
    '}',
    '',
  ].join('\n');
}

function buildGoWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing   = goParsing(params);
  const goRetType = returnType === 'void' ? '' : ` ${goType(returnType)}`;

  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`\tsolution(${call})`);
  } else {
    resultLines.push(`\t_result := solution(${call})`);
    resultLines.push(goPrintResult(returnType).trimEnd());
  }

  return [
    'package main',
    '',
    'import (',
    '\t"bufio"',
    '\t"fmt"',
    '\t"os"',
    '\t"strconv"',
    '\t"strings"',
    ')',
    '',
    userCode.trimEnd(),
    '',
    'func main() {',
    parsing,
    resultLines.join('\n'),
    '}',
    '',
  ].join('\n');
}

function buildBatchedExecutableChallengeCode(
  language: SupportedChallengeLanguage,
  userCode: string,
  params: FunctionParam[],
  returnType: string,
): string {
  const call = callArgs(language, params, returnType);

  switch (language) {
    case 'python':
      return buildBatchedPythonWrapper(userCode, params, returnType, call);
    case 'javascript':
      return buildBatchedJsWrapper(userCode, params, returnType, call);
    case 'java':
      return buildBatchedJavaWrapper(userCode, params, returnType, call);
    case 'cpp':
      return buildBatchedCppWrapper(userCode, params, returnType, call);
    case 'c':
      return buildBatchedCWrapper(userCode, params, returnType, call);
    case 'go':
      return buildBatchedGoWrapper(userCode, params, returnType, call);
  }
}

function buildBatchedPythonWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const bindings = params.map((p, i) => `    ${p.name} = _args[${i}]`).join('\n');
  const resultLines = returnType === 'void'
    ? ['    solution(' + call + ')', '    print("")']
    : isArrayType(returnType)
      ? ['    _result = solution(' + call + ')', '    print(_json.dumps(_result, separators=(\',\', \':\')))']
      : ['    _result = solution(' + call + ')', '    print(_result)'];

  return [
    userCode.trimEnd(),
    '',
    'import sys as _sys, json as _json',
    '_lines = _sys.stdin.read().splitlines()',
    '_cases = int(_lines[0].strip()) if _lines and _lines[0].strip() else 0',
    'for _case_idx in range(_cases):',
    '    _args = _json.loads(_lines[_case_idx + 1])',
    bindings,
    ...resultLines,
    '',
  ].join('\n');
}

function buildBatchedJsWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const bindings = params.map((p, i) => `  const ${p.name} = _args[${i}];`).join('\n');
  const resultLines = returnType === 'void'
    ? ['  solution(' + call + ');', "  process.stdout.write('\\n');"]
    : isArrayType(returnType)
      ? ['  const _result = solution(' + call + ');', "  process.stdout.write(JSON.stringify(_result) + '\\n');"]
      : ['  const _result = solution(' + call + ');', "  process.stdout.write(String(_result) + '\\n');"];

  return [
    userCode.trimEnd(),
    '',
    "const _lines = require('fs').readFileSync(0, 'utf8').split(/\\r?\\n/);",
    "const _cases = Number((_lines[0] || '0').trim() || '0');",
    'for (let _caseIdx = 0; _caseIdx < _cases; _caseIdx++) {',
    '  const _args = JSON.parse(_lines[_caseIdx + 1]);',
    bindings,
    ...resultLines,
    '}',
    '',
  ].join('\n');
}

function buildBatchedJavaWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing = javaParsingBody(params);
  const jRetType = returnType === 'void' ? 'void' : javaType(returnType);
  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`            solution(${call});`);
    resultLines.push('            System.out.println();');
  } else {
    resultLines.push(`            ${jRetType} _result = solution(${call});`);
    resultLines.push(indentBlock(javaPrintResult(returnType).trimEnd(), 3));
  }

  return [
    'import java.io.*;',
    'import java.util.*;',
    '',
    'public class Main {',
    indentBlock(userCode.trimEnd(), 1),
    '',
    '    @SuppressWarnings("all")',
    '    public static void main(String[] args) throws Exception {',
    '        BufferedReader _br = new BufferedReader(new InputStreamReader(System.in));',
    '        int _cases = Integer.parseInt(_br.readLine().trim());',
    '        String[] _parts;',
    '        for (int _case = 0; _case < _cases; _case++) {',
    indentBlock(parsing, 3),
    resultLines.join('\n'),
    '        }',
    '    }',
    '}',
    '',
  ].join('\n');
}

function buildBatchedCppWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing = cppParsing(params);
  const cppRetType = returnType === 'void' ? 'void' : cppType(returnType);
  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`        solution(${call});`);
    resultLines.push('        cout << endl;');
  } else {
    resultLines.push(`        ${cppRetType} _result = solution(${call});`);
    resultLines.push(indentBlock(cppPrintResult(returnType).trimEnd(), 2));
  }

  return [
    '#include <iostream>',
    '#include <vector>',
    '#include <string>',
    '#include <sstream>',
    'using namespace std;',
    '',
    userCode.trimEnd(),
    '',
    'int main() {',
    '    int _cases; cin >> _cases;',
    '    for (int _case = 0; _case < _cases; _case++) {',
    indentBlock(parsing, 2),
    resultLines.join('\n'),
    '    }',
    '    return 0;',
    '}',
    '',
  ].join('\n');
}

function buildBatchedCWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing = cParsing(params);
  const cRetType = returnType === 'void' ? 'void' : cReturnType(returnType);
  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`        solution(${call});`);
    resultLines.push('        printf("\\n");');
  } else {
    if (isArrayType(returnType) && !is2DArrayType(returnType)) {
      resultLines.push('        int _returnSize = 0;');
    }
    resultLines.push(`        ${cRetType} _result = solution(${call});`);
    resultLines.push(indentBlock(cPrintResult(returnType).trimEnd(), 2));
  }

  return [
    '#include <stdio.h>',
    '#include <stdlib.h>',
    '#include <string.h>',
    '',
    userCode.trimEnd(),
    '',
    'int main(void) {',
    '    int _cases; scanf("%d", &_cases);',
    '    for (int _case = 0; _case < _cases; _case++) {',
    indentBlock(parsing, 2),
    resultLines.join('\n'),
    '    }',
    '    return 0;',
    '}',
    '',
  ].join('\n');
}

function buildBatchedGoWrapper(
  userCode: string,
  params: FunctionParam[],
  returnType: string,
  call: string,
): string {
  const parsing = goParsingBody(params);
  const resultLines: string[] = [];
  if (returnType === 'void') {
    resultLines.push(`\t\tsolution(${call})`);
    resultLines.push('\t\tfmt.Println()');
  } else {
    resultLines.push(`\t\t_result := solution(${call})`);
    resultLines.push(indentBlock(goPrintResult(returnType).trimEnd().replace(/\t/g, '    '), 2));
  }

  return [
    'package main',
    '',
    'import (',
    '\t"bufio"',
    '\t"fmt"',
    '\t"os"',
    '\t"strconv"',
    '\t"strings"',
    ')',
    '',
    userCode.trimEnd(),
    '',
    'func main() {',
    '\t_reader := bufio.NewReader(os.Stdin)',
    "\t_line, _ := _reader.ReadString('\\n')",
    "\t_cases, _ := strconv.Atoi(strings.TrimSpace(_line))",
    '\tvar _parts []string',
    '\tfor _case := 0; _case < _cases; _case++ {',
    indentBlock(parsing.replace(/\t/g, '    '), 2),
    resultLines.join('\n'),
    '\t}',
    '}',
    '',
  ].join('\n');
}

// ─── Legacy wrapper (stdin passthrough — no function params) ──────────────────

function looksLikeCompleteProgram(language: SupportedChallengeLanguage, code: string): boolean {
  switch (language) {
    case 'python':     return code.includes('__name__ == "__main__"') || code.includes('def main(');
    case 'java':       return code.includes('class Main') || code.includes('public static void main(');
    case 'javascript': return code.includes('function main(') || code.includes('main();');
    case 'c':
    case 'cpp':        return code.includes('int main(');
    case 'go':         return code.includes('func main(') || code.includes('package main');
  }
}

function buildLegacyWrapper(language: SupportedChallengeLanguage, code: string): string {
  if (looksLikeCompleteProgram(language, code)) return code;

  switch (language) {
    case 'python':
      return `${code.trimEnd()}\n\nif __name__ == "__main__":\n    solution()\n`;
    case 'java':
      return `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n${indentBlock(code.trimEnd(), 1)}\n\n    public static void main(String[] args) throws Exception {\n        solution();\n    }\n}\n`;
    case 'javascript':
      return `${code.trimEnd()}\n\nsolution();\n`;
    case 'c':
      return `#include <stdio.h>\n\n${code.trimEnd()}\n\nint main(void) {\n    solution();\n    return 0;\n}\n`;
    case 'cpp':
      return `#include <iostream>\nusing namespace std;\n\n${code.trimEnd()}\n\nint main() {\n    solution();\n    return 0;\n}\n`;
    case 'go':
      return `package main\n\n${code.trimEnd()}\n\nfunc main() {\n    solution()\n}\n`;
  }
}

// ─── Executor call ────────────────────────────────────────────────────────────

export async function executeChallengeSubmission(data: {
  language:       string;
  code:           string;
  testCases:      ChallengeExecutorTestCase[];
  timeLimit:      number;
  functionParams?: FunctionParam[];
  returnType?:    string;
}) {
  if (!SUPPORTED_CHALLENGE_LANGUAGES.includes(data.language as SupportedChallengeLanguage)) {
    throw badRequest(`Unsupported language: ${data.language}`);
  }
  const language = data.language as SupportedChallengeLanguage;
  if (!data.code.trim())          throw badRequest('Code cannot be empty');
  if (data.testCases.length === 0) throw badRequest('This challenge has no test cases yet');

  const supportsBatchExecution = Boolean(data.functionParams && data.functionParams.length > 0 && data.returnType);
  const executableCode = supportsBatchExecution
    ? buildBatchedExecutableChallengeCode(
        language,
        data.code,
        data.functionParams!,
        data.returnType!,
      )
    : buildExecutableChallengeCode(
        language,
        data.code,
        data.functionParams,
        data.returnType,
      );

  const formattedTestCases = data.testCases.map(tc => ({
    input: formatTestCaseInput(language, tc.input, data.functionParams),
    expectedOutput: tc.expectedOutput,
  }));

  const batchedInput = supportsBatchExecution
    ? formatBatchedTestCaseInput(language, formattedTestCases.map(tc => tc.input))
    : undefined;

  try {
    const response = await fetch(`${EXECUTOR_URL}/execute`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(EXECUTOR_SECRET ? { Authorization: `Bearer ${EXECUTOR_SECRET}` } : {}),
      },
      body: JSON.stringify({
        language:        data.language,
        code:            executableCode,
        testCases:       formattedTestCases,
        timeLimit:       data.timeLimit,
        batchedInput,
        expectedOutputs: supportsBatchExecution ? formattedTestCases.map(tc => tc.expectedOutput) : undefined,
      }),
    });

    if (!response.ok) throw new Error(`executor responded with ${response.status}`);
    return await response.json() as ExecutorResponse;
  } catch (err) {
    throw badRequest(`Execution service unavailable: ${(err as Error).message}`);
  }
}

function formatBatchedTestCaseInput(
  language: SupportedChallengeLanguage,
  inputs: string[],
): string {
  if (!needsLineBased(language)) {
    return [String(inputs.length), ...inputs].join('\n');
  }

  return `${inputs.length}\n${inputs.join('\n')}`;
}

function formatTestCaseInput(
  language: SupportedChallengeLanguage,
  inputJson: string,
  params?: FunctionParam[],
): string {
  // No function params = legacy mode, pass stdin as-is
  if (!params || params.length === 0) return inputJson;

  // Python and JS parse JSON natively
  if (!needsLineBased(language)) return inputJson;

  // Java / Go / C / C++ need line-based format
  try {
    return toLineBasedStdin(inputJson, params);
  } catch {
    return inputJson; // fallback on parse error
  }
}

// ─── Result formatting ────────────────────────────────────────────────────────

export function formatChallengeResults(
  executorResult: ExecutorResponse,
  testCases:       ChallengeExecutorTestCase[],
  options?:        { revealHidden?: boolean },
) {
  return executorResult.results.map((result, index) => {
    const testCase = testCases[index];
    if (!testCase) return result;

    if (testCase.isHidden && !options?.revealHidden && executorResult.status !== 'accepted') {
      return {
        passed:         result.passed,
        input:          null,
        actualOutput:   null,
        expectedOutput: null,
        stderr:         result.stderr,
      };
    }

    return result;
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function indentBlock(code: string, depth: number): string {
  const indent = '    '.repeat(depth);
  return code
    .split('\n')
    .map(line => (line ? `${indent}${line}` : ''))
    .join('\n');
}
