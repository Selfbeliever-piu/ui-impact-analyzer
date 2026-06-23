import fs from 'fs/promises';
import path from 'path';

export async function collectFiles(dir: string, result: Array<string> = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath: string = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await collectFiles(fullPath, result);
    } else if (fullPath.match(/\.(js|jsx|ts|tsx)$/)) {
      result.push(fullPath);
    }
  }

  console.log('result: ', result)

  return result;
}