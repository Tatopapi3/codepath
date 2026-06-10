'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Play, RotateCcw, Bot } from 'lucide-react';
import type { ChallengeContent } from '@/lib/content/types';
import TestResults from './TestResults';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  challenge: ChallengeContent;
  onComplete: (score: number) => void;
  lessonContext?: { language: string; unit: string; title: string };
}

interface TestResult {
  id: string;
  description: string;
  passed: boolean;
  expected: string;
  got: string;
}

export default function CodeEditor({ challenge, onComplete, lessonContext }: CodeEditorProps) {
  const [code, setCode] = useState(challenge.starterCode);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [allPassed, setAllPassed] = useState(false);
  const pyodideRef = useRef<unknown>(null);
  const pyodideLoadedRef = useRef(false);

  const isJS = challenge.language === 'javascript';
  const isPython = challenge.language === 'python';

  // Load Pyodide for Python
  useEffect(() => {
    if (!isPython || pyodideLoadedRef.current) return;
    pyodideLoadedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js';
    script.onload = async () => {
      // @ts-expect-error Pyodide global
      pyodideRef.current = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/',
      });
    };
    document.head.appendChild(script);
  }, [isPython]);

  async function runCode() {
    setRunning(true);
    setOutput('Running...');
    setTestResults(null);

    try {
      const results: TestResult[] = [];
      let capturedOutput = '';

      for (const tc of challenge.testCases) {
        if (isPython) {
          const result = await runPython(code, tc.input ?? '', tc.expected);
          results.push({ id: tc.id, description: tc.description, ...result });
          capturedOutput = result.got;
        } else if (isJS) {
          const result = runJavaScript(code, tc.input ?? '', tc.expected);
          results.push({ id: tc.id, description: tc.description, ...result });
          capturedOutput = result.got;
        }
      }

      const passedCount = results.filter((r) => r.passed).length;
      const score = Math.round((passedCount / results.length) * 100);
      const allPass = passedCount === results.length;

      setTestResults(results);
      setOutput(capturedOutput);
      setAllPassed(allPass);

      if (allPass) {
        setTimeout(() => onComplete(score), 1200);
      }
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunning(false);
    }
  }

  async function runPython(userCode: string, input: string, expected: string) {
    if (!pyodideRef.current) {
      return { passed: false, expected, got: 'Pyodide still loading, please wait...' };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const py = pyodideRef.current as any;
      py.runPython('import sys\nfrom io import StringIO\nsys.stdout = StringIO()');

      // Inject input and run
      const testCode = `${userCode}\n\nresult = solution(${input})\nprint(result)`;
      py.runPython(testCode);

      const got: string = py.runPython('sys.stdout.getvalue()').trim();
      py.runPython('sys.stdout = sys.__stdout__');

      return { passed: got === expected.trim(), expected: expected.trim(), got };
    } catch (e) {
      return { passed: false, expected, got: `Error: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  function runJavaScript(userCode: string, input: string, expected: string) {
    try {
      const logs: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const fn = new Function('console', `${userCode}\nreturn solution(${input});`);
      const result = fn({ log: (...a: unknown[]) => logs.push(a.map(String).join(' ')) });
      const got = String(result ?? logs.join('\n'));
      return { passed: got.trim() === expected.trim(), expected: expected.trim(), got: got.trim() };
    } catch (e) {
      return { passed: false, expected, got: `Error: ${e instanceof Error ? e.message : String(e)}` };
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Instructions */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
        <h3 className="text-sm font-bold text-white mb-1">{challenge.description}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{challenge.instructions}</p>
      </div>

      {/* Monaco Editor */}
      <div className="overflow-hidden rounded-xl border border-gray-700">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {challenge.language}
          </span>
          <button
            onClick={() => setCode(challenge.starterCode)}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
        <MonacoEditor
          height="200px"
          language={challenge.language === 'python' ? 'python' : 'javascript'}
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            tabSize: 4,
            automaticLayout: true,
          }}
        />
      </div>

      {/* Run button */}
      <button
        onClick={runCode}
        disabled={running}
        className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 text-sm font-bold text-white hover:bg-green-500 disabled:opacity-50 transition-colors focus-visible:outline-2 focus-visible:outline-green-400"
      >
        <Play size={16} />
        {running ? 'Running...' : 'Run Code'}
      </button>

      {/* Output */}
      {output && !testResults && (
        <div className="rounded-xl bg-gray-950 border border-gray-800 p-4 font-mono text-sm text-green-300">
          {output}
        </div>
      )}

      {/* Test Results */}
      {testResults && (
        <TestResults results={testResults} allPassed={allPassed} />
      )}
    </div>
  );
}
