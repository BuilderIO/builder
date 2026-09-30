"""Temporary CI diagnostics for the isolated-vm teardown assertion. Not for merge."""
import os
import re
import subprocess

ASSERTION = "Assertion `environment != nullptr' failed"
EVAL = 'src/functions/evaluate/evaluate.test.ts'
PROCESSED = 'src/functions/get-processed-block.test.ts'
SAFE = 'src/functions/evaluate/safe-state-expression.test.ts'
NODE_RUNTIME = 'src/functions/evaluate/node-runtime/node-runtime.ts'


def run(args):
    env = dict(os.environ, SDK_ENV='node')
    p = subprocess.run(['npx', 'vitest', 'run'] + args, env=env, capture_output=True, text=True)
    out = re.sub(r'\x1b\[[0-9;]*m', '', p.stdout + p.stderr)
    files = re.findall(r'Test Files\s+(.*)', out)
    return p.returncode, ASSERTION in out, files[-1].strip() if files else '?', out


def unref_off():
    s = open(NODE_RUNTIME).read()
    open(NODE_RUNTIME, 'w').write(s.replace('DISPOSE_TIMER.unref?.();', ''))


EXPERIMENTS = [
    ('full suite', [], None),
    ('full suite --no-threads', ['--no-threads'], None),
    ('full suite --single-thread', ['--single-thread'], None),
    ('full suite, no unref', [], unref_off),
    ('evaluate + processed-block', [EVAL, PROCESSED], None),
    ('evaluate + safe-state', [EVAL, SAFE], None),
    ('processed-block alone', [PROCESSED], None),
    ('full suite at 0dbc18d36', [], 'checkout-0dbc'),
]

rows = []
first_crash_log = None
for name, args, prep in EXPERIMENTS:
    subprocess.run(['git', 'checkout', 'HEAD', '--', 'src'], check=True)
    if prep == 'checkout-0dbc':
        subprocess.run(['git', 'fetch', '--quiet', '--depth=50', 'origin', '0dbc18d36'], check=False)
        subprocess.run(['git', 'checkout', '0dbc18d36', '--', 'src'], check=False)
    elif prep:
        prep()
    results = [run(args) for _ in range(3)]
    crashes = sum(1 for r in results if r[1])
    if crashes and first_crash_log is None:
        crash_out = next(r[3] for r in results if r[1])
        i = crash_out.index(ASSERTION)
        first_crash_log = (name, crash_out[max(0, i - 1500):i + 200])
    rows.append((name, crashes, [r[0] for r in results], results[-1][2]))
subprocess.run(['git', 'checkout', 'HEAD', '--', 'src'], check=True)

print('\n==== IVM DIAGNOSTICS ====')
for name, crashes, codes, files in rows:
    print(f'{name:<30} crashes={crashes}/3 exit={codes} files: {files}')
if first_crash_log:
    print(f'---- context before first crash ({first_crash_log[0]}) ----')
    print(first_crash_log[1])
print('==== END IVM DIAGNOSTICS ====')
