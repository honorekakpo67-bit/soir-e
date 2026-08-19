import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const npm = isWin ? 'npm.cmd' : 'npm';

const children = ['api', 'dev'].map((script) =>
  spawn(npm, ['run', script], { stdio: 'inherit', shell: isWin })
);

for (const child of children) {
  child.on('exit', (code) => {
    if (code && code !== 0) process.exit(code);
  });
}