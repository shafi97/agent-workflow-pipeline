// Small secret scanner. It looks for common token shapes in tracked files.
// It is a first line of defence; CI also runs a dedicated scanner (gitleaks).
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const PATTERNS = [
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['GitHub token', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['Slack token', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['Private key block', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['Generic secret assignment', /\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*['"][A-Za-z0-9_\-/+=]{16,}['"]/i],
]

const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' })
  .split('\n')
  .filter((f) => f && !f.endsWith('package-lock.json') && !f.startsWith('scripts/secret-scan'))

let found = 0
for (const file of files) {
  let text
  try { text = readFileSync(file, 'utf8') } catch { continue }
  text.split('\n').forEach((line, i) => {
    for (const [name, re] of PATTERNS) {
      if (re.test(line)) {
        found += 1
        console.error(`${file}:${i + 1}: possible ${name}`)
      }
    }
  })
}
if (found > 0) {
  console.error(`\n${found} possible secret(s) found.`)
  process.exit(1)
}
console.log(`Secret scan clean (${files.length} files checked).`)
