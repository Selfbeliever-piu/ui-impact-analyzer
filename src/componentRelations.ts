import path from "path";
import { collectFiles } from "./readFolderFiles.js";
import fs from 'fs/promises';
import type { ImpactByLevel } from "./types.js";

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const PROJECT_ROOT = path.resolve(process.cwd());

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * PathStrategy:
 * - All paths are normalized
 * - Relative to project root
 * - POSIX format (forward slashes)
 * - No './', '../', or absolute OS paths
 */

function normalizePath(filePath: string): string {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(PROJECT_ROOT, filePath);

  return path
    .relative(PROJECT_ROOT, absolute)
    .replace(/\\/g, '/'); // windows-safe
}

function stripJsExtension(importPath: string) {
  return importPath.endsWith('.js')
    ? importPath.slice(0, -3)
    : importPath;
}

export function validateGraph(graph: Record<string, (string | undefined)[]>) {
  for (const [from, tos] of Object.entries(graph)) {
    if (!from.includes('sample-app/src')) {
      console.error('❌ Unnormalized key:', from);
    }
    for (const to of tos) {
      if (to && !to.includes('sample-app/src')) {
        console.error('❌ Unnormalized value:', to);
      }
    }
  }
}

export async function resolveImport(fromFile: string, importPath: string) {
  if (!importPath.startsWith('.')) return null;

  const cleanedImport = stripJsExtension(importPath);
  const baseDir = path.dirname(fromFile);
  const absoluteBase = path.resolve(baseDir, cleanedImport);

  // try file extensions
  for (const ext of EXTENSIONS) {
    const filePath = absoluteBase + ext;
    if (await exists(filePath)) return filePath;
  } 

  // try index files
  for (const ext of EXTENSIONS) {
    const indexPath = path.join(absoluteBase, 'index' + ext);
    if (await exists(indexPath)) return indexPath;
  }
  return null;
}

function extractImports(code: string) {
    const regex = /from\s+['"](.+?)['"]/g;
    const imports = [];
    let match;
  
    while ((match = regex.exec(code))) {
      imports.push(match[1]);
    }
  
    return imports;
}

export async function buildDependencyGraph(rootDir: string) {
    const files = await collectFiles(rootDir);
    const graph: Record<string, (string | undefined) []> = {};
  
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const importedFiles = extractImports(content)

      for (const index in importedFiles) {
        let _f: string | null = null
        if (typeof importedFiles[index] !== undefined){
          _f = await resolveImport(file, importedFiles[index] as string)
        }

        const from = normalizePath(file);
        console.log('form: ', from)
        if (_f) {
          const to = normalizePath(_f);
          console.log('to: ', to)
          graph[from] ??= [];
          graph[from]?.push(to);
        }
      }
    }
  
    return graph;

  }

export function buildReverseGraph(graph: { [x: string]: any; }) {
  const reverse:{ [x: string]: any; } = {};
  for (const file in graph) {
    if (!reverse[file]) reverse[file] = [];

    for (const dep of graph[file]) {
      if (!reverse[dep]) reverse[dep] = [];
      reverse[dep].push(file);
    }
  }

  return reverse;
}

export function findImpactedFiles(reverseGraph:{ [x: string]: any; }, changedFile: string) {
  const impacted = new Set();
  const queue = [changedFile];

  while (queue.length > 0) {
    const current = queue.shift();

    if (current)
      for (const parent of reverseGraph[current] || []) {
        if (!impacted.has(parent)) {
          impacted.add(parent);
          queue.push(parent);
        }
      }
  }

  return [...impacted];
}

export function getImpactByLevel(
  graph: Record<string, (string | undefined)[]>,
  start: string
): ImpactByLevel {
  const visited = new Set<string>();
  const levelsMap = new Map<number, string[]>();

  const queue: Array<{ file: string; level: number }> = [];

  visited.add(start);
  queue.push({ file: start, level: 0 });

  while (queue.length > 0) {
    const { file, level } = queue.shift()!;

    if (!levelsMap.has(level)) {
      levelsMap.set(level, []);
    }

    levelsMap.get(level)!.push(file);

    for (const next of graph[file] ?? []) {
      if (next && !visited.has(next)) {
        console.log(next)
        visited.add(next);
        queue.push({ file: next, level: level + 1 });
      }
    }
  }

  console.log('levelsMap: ', levelsMap)

  return {
    source: start,
    levels: Array.from(levelsMap.entries()).map(
      ([level, files]) => ({ level, files })
    ),
  };
}