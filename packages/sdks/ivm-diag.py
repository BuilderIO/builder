"""Temporary CI diagnostics for the isolated-vm teardown assertion. Not for merge."""
import os
import re
import subprocess

EVAL_TEST = 'src/functions/evaluate/evaluate.test.ts'
NODE_RUNTIME = 'src/functions/evaluate/node-runtime/node-runtime.ts'
ASSERTION = "Assertion `environment != nullptr' failed"


def read(path):
    with open(path) as f:
        return f.read()


def write(path, text):
    with open(path, 'w') as f:
        f.write(text)


def remove_test(name):
    def apply():
        s = read(EVAL_TEST)
        start = s.index(f"  '{name}':")
        nxt = re.compile(r"\n  '[^']+':|\n};").search(s, start + 1)
        write(EVAL_TEST, s[:start] + s[nxt.start() + 1:])
    return apply


def replace_in(path, old, new):
    def apply():
        s = read(path)
        assert old in s, f'{old!r} not in {path}'
        write(path, s.replace(old, new))
    return apply


def append_after_all():
    s = read(EVAL_TEST)
    write(EVAL_TEST, s + "\nafterAll(() => new Promise((r) => setTimeout(r, 10)));\n")


EXPERIMENTS = [
    ('baseline', None, None),
    ('no nested write/delete test', remove_test('nested writes and deletes in jsCode reach root state at their full path'), None),
    ('no context write/delete test', remove_test('writes and deletes on context do not reach root state'), None),
    ('no Object.assign test', remove_test('Object.assign on state sets every value, including after a method'), None),
    ('no unref on dispose timer', replace_in(NODE_RUNTIME, 'DISPOSE_TIMER.unref?.();', ''), None),
    ('no delete callback in trap', replace_in(NODE_RUNTIME, "if (path) ${BUILDER_DELETE_STATE_NAME}(path.concat(key));", ''), None),
    ('no isProxy lookup', replace_in(NODE_RUNTIME, "safeDynamicRequire('node:util')?.types?.isProxy ?? null", 'null'), None),
    ('afterAll waits 10ms', append_after_all, None),
    ('vitest --no-threads', None, ['--no-threads']),
]


def run(extra):
    env = dict(os.environ, SDK_ENV='node')
    cmd = ['npx', 'vitest', 'run', EVAL_TEST] + (extra or [])
    p = subprocess.run(cmd, env=env, capture_output=True, text=True)
    out = p.stdout + p.stderr
    crashed = ASSERTION in out
    tests = re.findall(r'Tests\s+(.*)', re.sub(r'\x1b\[[0-9;]*m', '', out))
    return p.returncode, crashed, tests[-1].strip() if tests else '?'


rows = []
for name, apply, extra in EXPERIMENTS:
    subprocess.run(['git', 'checkout', '--', EVAL_TEST, NODE_RUNTIME], check=True)
    if apply:
        apply()
    results = [run(extra) for _ in range(3)]
    crashes = sum(1 for _, crashed, _ in results if crashed)
    rows.append((name, crashes, [code for code, _, _ in results], results[-1][2]))
subprocess.run(['git', 'checkout', '--', EVAL_TEST, NODE_RUNTIME], check=True)

p = subprocess.run(['yarn', 'test:node'], capture_output=True, text=True)
full_crash = ASSERTION in (p.stdout + p.stderr)

print('\n==== IVM DIAGNOSTICS ====')
for name, crashes, codes, tests in rows:
    print(f'{name:<32} crashes={crashes}/3 exit={codes} tests: {tests}')
print(f'{"full node suite (yarn test:node)":<32} crashed={full_crash} exit={p.returncode}')
print('==== END IVM DIAGNOSTICS ====')
