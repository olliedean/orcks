import { runDemucs } from '../lib/demucs';

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args.find((a) => !a.startsWith('--'));
  if (!inputFile) throw new Error('Missing input file. Example: pnpm test-demucs -- path/to/song.mp3');

  function flagValue(flag: string) {
    const idx = args.indexOf(flag);
    if (idx < 0) return undefined;
    const v = args[idx + 1];
    if (!v || v.startsWith('--')) return undefined;
    return v;
  }

  function flagBool(flag: string, defaultValue: boolean) {
    const idx = args.indexOf(flag);
    if (idx < 0) return defaultValue;
    const v = args[idx + 1];
    if (!v || v.startsWith('--')) return true;
    const s = v.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
    if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
    return defaultValue;
  }

  const outputDir = flagValue('--out');
  const model = flagValue('--model');

  const result = await runDemucs({
    inputFile,
    outputDir,
    model,
    gpu: flagBool('--gpu', true),
    mp3output: flagBool('--mp3output', true),
  });

  console.log(`Output in: ${result.outputDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
