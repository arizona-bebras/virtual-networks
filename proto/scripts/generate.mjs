#!/usr/bin/env node
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const protoDir = resolve(scriptDir, '..');
const tsOutDir = resolve(protoDir, 'gen', 'ts');
const goOutDir = resolve(protoDir, 'gen', 'go');

const target = process.argv[2] ?? 'all';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const commandExists = (command) => {
  const checker = process.platform === 'win32' ? 'where' : 'command';
  const checkerArgs = process.platform === 'win32' ? [command] : ['-v', command];
  const result = spawnSync(checker, checkerArgs, {
    stdio: 'ignore',
    shell: process.platform !== 'win32',
  });

  return result.status === 0;
};

const ensureGoPlugins = () => {
  if (!commandExists('protoc-gen-go')) {
    console.log('Installing protoc-gen-go...');
    run('go', ['install', 'google.golang.org/protobuf/cmd/protoc-gen-go@v1.36.6']);
  }

  if (!commandExists('protoc-gen-go-grpc')) {
    console.log('Installing protoc-gen-go-grpc...');
    run('go', ['install', 'google.golang.org/grpc/cmd/protoc-gen-go-grpc@v1.5.1']);
  }
};

const generateTs = () => {
  mkdirSync(tsOutDir, { recursive: true });

  run('pnpm', [
    'exec',
    'pbjs',
    '-t',
    'static-module',
    '-w',
    'commonjs',
    '-o',
    resolve(tsOutDir, 'helloworld.js'),
    resolve(protoDir, 'helloworld.proto'),
  ], { cwd: protoDir });

  run('pnpm', [
    'exec',
    'pbts',
    '-o',
    resolve(tsOutDir, 'helloworld.d.ts'),
    resolve(tsOutDir, 'helloworld.js'),
  ], { cwd: protoDir });
};

const generateGo = () => {
  if (!commandExists('protoc')) {
    console.error('Error: protoc is required for Go generation. Install protoc and rerun generate:go.');
    process.exit(1);
  }

  ensureGoPlugins();
  mkdirSync(goOutDir, { recursive: true });

  const gopathResult = spawnSync('go', ['env', 'GOPATH'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    cwd: protoDir,
  });

  if (gopathResult.status !== 0) {
    process.exit(gopathResult.status ?? 1);
  }

  const gopath = gopathResult.stdout.trim();
  const pathSeparator = process.platform === 'win32' ? ';' : ':';
  const env = {
    ...process.env,
    PATH: `${resolve(gopath, 'bin')}${pathSeparator}${process.env.PATH ?? ''}`,
  };

  run(
    'protoc',
    [
      `--go_out=${goOutDir}`,
      '--go_opt=paths=source_relative',
      `--go-grpc_out=${goOutDir}`,
      '--go-grpc_opt=paths=source_relative',
      `-I${protoDir}`,
      resolve(protoDir, 'helloworld.proto'),
    ],
    { cwd: protoDir, env },
  );
};

const clean = () => {
  for (const path of [resolve(protoDir, 'gen')]) {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
    }
  }
};

switch (target) {
  case 'ts':
    generateTs();
    break;
  case 'go':
    generateGo();
    break;
  case 'all':
    generateTs();
    generateGo();
    break;
  case 'clean':
    clean();
    break;
  default:
    console.error(`Unknown target '${target}'. Use ts, go, all, or clean.`);
    process.exit(1);
}
