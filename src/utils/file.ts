import { access, mkdir, writeFile as fsWriteFile } from 'fs/promises';

export async function writeFile(path: string, data: string) {
  // Check if the directory exists
  const dir = path.replace(/\/[^/]*$/, '');
  try {
    await access(dir);
  } catch {
    // Directory does not exist, create it
    await mkdir(dir, { recursive: true });
  }

  // Write to the file
  await fsWriteFile(path, data);
}
