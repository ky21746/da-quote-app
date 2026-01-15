#!/usr/bin/env node

const { spawn } = require('child_process');
const { execSync } = require('child_process');

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch (_) {
    return '';
  }
}

const reactScript = process.argv[2]; // start | build | test | eject

if (!reactScript) {
  console.error('Usage: node scripts/run-with-version.js <start|build|test|eject>');
  process.exit(1);
}

const revision = safeExec('git rev-list --count HEAD') || '0';
const sha = safeExec('git rev-parse --short HEAD') || 'nogit';

process.env.REACT_APP_REVISION = revision;
process.env.REACT_APP_GIT_SHA = sha;

const command = process.platform === 'win32' ? 'react-scripts.cmd' : 'react-scripts';

const child = spawn(command, [reactScript, ...process.argv.slice(3)], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
