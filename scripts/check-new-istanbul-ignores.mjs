#!/usr/bin/env node
/**
 * Fails if the current PR/branch introduces a new `istanbul ignore` comment
 * that doesn't include a reason (e.g. `// istanbul ignore next -- reason`).
 *
 * Only lines *added* in the diff against the base ref are checked, so
 * existing ignores without a reason are left untouched.
 */
import { execFileSync } from 'node:child_process';

const baseRef = process.argv[2];

if (!baseRef) {
  console.error('Usage: node check-new-istanbul-ignores.mjs <base-ref>');
  process.exit(1);
}

const diff = execFileSync(
  'git',
  [
    'diff',
    '--unified=0',
    `${baseRef}...HEAD`,
    '--',
    ':(glob)**/*.ts',
    ':(glob)**/*.tsx',
  ],
  { encoding: 'utf8', maxBuffer: 1024 * 1024 * 50 }
);

const IGNORE_DIRECTIVE = /istanbul ignore (next|else|if|file)\b/;
const HAS_REASON =
  /istanbul ignore (?:next|else|if|file)\b\s*(?:--?|—|–)\s*\S+/;

let currentFile = null;
let newLineNumber = 0;
const violations = [];

for (const line of diff.split('\n')) {
  if (line.startsWith('+++ ')) {
    const path = line.slice(4).trim();
    currentFile = path === '/dev/null' ? null : path.replace(/^b\//, '');
    continue;
  }

  const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (hunkMatch) {
    newLineNumber = Number(hunkMatch[1]);
    continue;
  }

  if (!currentFile || !line.startsWith('+') || line.startsWith('+++')) {
    if (line.startsWith('+') && !line.startsWith('+++')) newLineNumber += 1;
    continue;
  }

  const content = line.slice(1);

  if (IGNORE_DIRECTIVE.test(content) && !HAS_REASON.test(content)) {
    violations.push({
      file: currentFile,
      line: newLineNumber,
      content: content.trim(),
    });
  }

  newLineNumber += 1;
}

if (violations.length > 0) {
  console.error('New istanbul ignore comments must include a reason, e.g.:');
  console.error('  // istanbul ignore next -- reason this cannot be tested\n');
  console.error('The following new ignores are missing a reason:\n');
  for (const { file, line, content } of violations) {
    console.error(`  ${file}:${line}: ${content}`);
  }
  process.exit(1);
}

console.log('No new istanbul ignore comments without a reason.');
