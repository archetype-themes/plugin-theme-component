import {execSync} from 'node:child_process'

export async function cloneTheme(repoUrl: string, targetDir: string): Promise<void> {
  execSync(`git clone ${repoUrl} ${targetDir}`, { stdio: 'inherit' })
} 