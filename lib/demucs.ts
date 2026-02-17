import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export type DemucsRunOptions = {
  inputFile: string;
  outputDir?: string;
  model?: string;
  gpu?: boolean;
  mp3output?: boolean;
  image?: string;
  cacheDir?: string;
};

const DEFAULT_IMAGE = 'xserrat/facebook-demucs:latest';

function isWindows() {
  return process.platform === 'win32';
}

function run(command: string, args: string[], opts?: { captureStdout?: boolean }) {
  const result = spawnSync(command, args, {
    stdio: opts?.captureStdout ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    encoding: 'utf8',
    shell: false,
  });

  if (result.error) throw result.error;
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`${command} exited with code ${result.status}`);
  }

  return (result.stdout ?? '').toString().trim();
}

function findRepoRoot(startDir: string) {
  let dir = path.resolve(startDir);
  for (let i = 0; i < 20; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(startDir);
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function winPathToWslMountPath(winPath: string) {
  const normalized = path.resolve(winPath);
  const match = /^([A-Za-z]):[\\/](.*)$/.exec(normalized);
  if (match) {
    const drive = match[1].toLowerCase();
    const rest = match[2].replace(/\\/g, '/');
    return `/mnt/${drive}/${rest}`;
  }

  // Fallback: try wslpath, but pass a forward-slash Windows path.
  const slashPath = normalized.replace(/\\/g, '/');
  return run('wsl.exe', ['--', 'wslpath', '-a', '-u', slashPath], { captureStdout: true });
}

function ensureDocker() {
  if (isWindows()) {
    run('wsl.exe', ['--status']);
    run('wsl.exe', ['--', 'docker', 'version']);
  } else {
    run('docker', ['version']);
  }
}

function dockerCmd() {
  if (isWindows()) return { cmd: 'wsl.exe', prefix: ['--', 'docker'] as string[] };
  return { cmd: 'docker', prefix: [] as string[] };
}

function ensureWslKeepAlive() {
  if (!isWindows()) return;
  const script =
    'pgrep -f orcks-demucs-keepalive >/dev/null 2>&1 || ' +
    '(nohup bash -lc "exec -a orcks-demucs-keepalive tail -f /dev/null" >/dev/null 2>&1 &)';

  run('wsl.exe', ['--', 'bash', '-lc', script]);
}

function ensureImage(image: string) {
  const { cmd, prefix } = dockerCmd();

  try {
    run(cmd, [...prefix, 'image', 'inspect', image], { captureStdout: true });
    return;
  } catch {
    // ignore
  }

  run(cmd, [...prefix, 'pull', image]);
}

function sha256Prefix8(filePath: string) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex').slice(0, 8);
}

function tryParseExpectedPrefixFromFilename(filename: string) {
  const match = /-([0-9a-fA-F]{8})\.th$/.exec(filename);
  return match ? match[1].toLowerCase() : null;
}

function downloadCheckpointInWsl(params: { modelsDir: string; filename: string; url: string }) {
  const modelsDirWsl = winPathToWslMountPath(params.modelsDir);
  const destDir = `${modelsDirWsl}/hub/checkpoints`;
  const dest = `${destDir}/${params.filename}`;

  const script = [
    'set -e',
    `mkdir -p '${destDir}'`,
    `if command -v curl >/dev/null 2>&1; then curl -L --fail --retry 3 --retry-delay 1 '${params.url}' -o '${dest}'; ` +
      `elif command -v wget >/dev/null 2>&1; then wget -O '${dest}' '${params.url}'; ` +
      `else echo 'Need curl or wget in WSL to download model' 1>&2; exit 1; fi`,
  ].join('; ');

  run('wsl.exe', ['--', 'bash', '-lc', script]);
}

function downloadCheckpointOnHost(params: { modelsDir: string; filename: string; url: string }) {
  const destDir = path.join(params.modelsDir, 'hub', 'checkpoints');
  ensureDir(destDir);
  const dest = path.join(destDir, params.filename);

  try {
    run('curl', ['-L', '--fail', '--retry', '3', '--retry-delay', '1', params.url, '-o', dest]);
    return;
  } catch {
    // ignore
  }

  return fetch(params.url)
    .then(async (res) => {
      if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
      const arrayBuffer = await res.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(arrayBuffer));
    })
    .catch((err) => {
      throw err;
    });
}

async function ensureCheckpoint(params: {
  modelsDir: string;
  filename: string;
  expectedPrefix: string;
  url: string;
}) {
  const destDir = path.join(params.modelsDir, 'hub', 'checkpoints');
  ensureDir(destDir);
  const dest = path.join(destDir, params.filename);

  const isValid = () => {
    if (!fs.existsSync(dest)) return false;
    try {
      return sha256Prefix8(dest) === params.expectedPrefix;
    } catch {
      return false;
    }
  };

  if (isValid()) return;
  try {
    fs.rmSync(dest, { force: true });
  } catch {
    // ignore
  }

  if (isWindows()) {
    downloadCheckpointInWsl({ modelsDir: params.modelsDir, filename: params.filename, url: params.url });
  } else {
    await downloadCheckpointOnHost({ modelsDir: params.modelsDir, filename: params.filename, url: params.url });
  }

  if (!isValid()) {
    throw new Error(`Model download failed integrity check for ${params.filename}`);
  }
}

function repairTorchHubCheckpoints(params: { modelsDir: string }) {
  const checkpointsDir = path.join(params.modelsDir, 'hub', 'checkpoints');
  if (!fs.existsSync(checkpointsDir)) return;

  const entries = fs.readdirSync(checkpointsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.th')) continue;
    const expected = tryParseExpectedPrefixFromFilename(entry.name);
    if (!expected) continue;

    const filePath = path.join(checkpointsDir, entry.name);
    let actual: string;
    try {
      actual = sha256Prefix8(filePath);
    } catch {
      continue;
    }

    if (actual === expected) continue;

    try {
      fs.rmSync(filePath, { force: true });
    } catch {
      // ignore
    }
  }
}

export async function runDemucs(options: DemucsRunOptions) {
  const root = findRepoRoot(process.cwd());

  const inputAbs = path.resolve(process.cwd(), options.inputFile);
  if (!fs.existsSync(inputAbs)) throw new Error(`Input file not found: ${inputAbs}`);

  const image = options.image ?? DEFAULT_IMAGE;
  const model = options.model ?? 'htdemucs';
  const gpu = options.gpu ?? true;
  const mp3output = options.mp3output ?? true;

  const cacheDir = path.resolve(root, options.cacheDir ?? '.demucs');
  const modelsDir = path.join(cacheDir, 'models');
  const outputDirAbs = path.resolve(process.cwd(), options.outputDir ?? path.join(cacheDir, 'output'));

  ensureDir(modelsDir);
  ensureDir(outputDirAbs);

  ensureWslKeepAlive();
  ensureDocker();
  ensureImage(image);
  repairTorchHubCheckpoints({ modelsDir });

  if ((options.model ?? 'htdemucs') === 'htdemucs') {
    const filename = '955717e8-8726e21a.th';
    const expectedPrefix = '8726e21a';
    const url = `https://dl.fbaipublicfiles.com/demucs/hybrid_transformer/${filename}`;

    await ensureCheckpoint({ modelsDir, filename, expectedPrefix, url });
  }

  const inputDirAbs = path.dirname(inputAbs);
  const trackName = path.basename(inputAbs);

  const wantsTty = Boolean(process.stdout.isTTY);
  const dockerArgs = [
    'run',
    '--rm',
    '-i',
    ...(wantsTty ? ['-t'] : []),
    ...(gpu ? ['--gpus', 'all'] : []),
    '--entrypoint',
    'python3',
  ];

  if (isWindows()) {
    dockerArgs.push(
      '-v',
      `${winPathToWslMountPath(inputDirAbs)}:/data/input:ro`,
      '-v',
      `${winPathToWslMountPath(outputDirAbs)}:/data/output`,
      '-v',
      `${winPathToWslMountPath(modelsDir)}:/data/models`,
      image
    );
  } else {
    dockerArgs.push(
      '-v',
      `${inputDirAbs}:/data/input:ro`,
      '-v',
      `${outputDirAbs}:/data/output`,
      '-v',
      `${modelsDir}:/data/models`,
      image
    );
  }

  dockerArgs.push(
    '-m',
    'demucs',
    '-n',
    model,
    '--out',
    '/data/output',
    ...(mp3output ? ['--mp3'] : []),
    `/data/input/${trackName}`
  );

  const { cmd, prefix } = dockerCmd();
  run(cmd, [...prefix, ...dockerArgs]);

  return { outputDir: outputDirAbs };
}
