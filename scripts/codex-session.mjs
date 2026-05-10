#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import net from 'node:net'

const root = resolve(import.meta.dirname, '..')
const sessionId = slug(process.env.CODEX_SESSION_ID || process.env.TERM_SESSION_ID || `codex-${process.pid}`)
const profileRoot = resolve(root, '.codex', 'chrome-profiles')
const profileDir = resolve(profileRoot, sessionId)
const stateFile = resolve(root, '.codex', `session-${sessionId}.json`)
const requestedAppPort = Number(process.env.CODEX_APP_PORT || process.env.PORT || 5173)
const requestedDebugPort = Number(process.env.CHROME_DEBUGGING_PORT || 9222)

const appPort = await findOpenPort(requestedAppPort)
const debugPort = await findOpenPort(requestedDebugPort)
const chromePath = getChromePath()
const appUrl = `http://127.0.0.1:${appPort}/`

mkdirSync(profileDir, { recursive: true })
writeFileSync(
  stateFile,
  JSON.stringify(
    {
      sessionId,
      appUrl,
      appPort,
      debugPort,
      profileDir,
      chromePath,
      startedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
)

console.log(`Codex browser session: ${sessionId}`)
console.log(`App URL: ${appUrl}`)
console.log(`Chrome DevTools: http://127.0.0.1:${debugPort}`)
console.log(`Chrome profile: ${profileDir}`)

const vite = spawn(
  'pnpm',
  ['exec', 'vite', '--host', '127.0.0.1', '--port', String(appPort), '--strictPort'],
  {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, BROWSER: 'none' },
  },
)

let chrome
if (process.env.CODEX_OPEN_CHROME === '0') {
  console.log('Chrome launch skipped because CODEX_OPEN_CHROME=0.')
} else if (chromePath) {
  chrome = spawn(
    chromePath,
    [
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      appUrl,
    ],
    {
      stdio: 'ignore',
      detached: true,
    },
  )
  chrome.unref()
} else {
  console.warn('Chrome executable was not found. Set CHROME_PATH to launch it automatically.')
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown(signal))
}

vite.on('exit', (code, signal) => {
  cleanupProfile()
  if (signal) process.kill(process.pid, signal)
  process.exit(code ?? 0)
})

function shutdown(signal) {
  vite.kill(signal)
  cleanupProfile()
  process.exit(signal === 'SIGINT' ? 130 : 143)
}

function cleanupProfile() {
  if (process.env.KEEP_CODEX_CHROME_PROFILE === '1') return
  try {
    rmSync(join(profileDir, 'SingletonLock'), { force: true })
    rmSync(join(profileDir, 'SingletonCookie'), { force: true })
    rmSync(join(profileDir, 'SingletonSocket'), { force: true })
  } catch {
    // Chrome can leave these behind briefly; stale singleton files are harmless after profile isolation.
  }
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function findChrome() {
  const candidates =
    process.platform === 'darwin'
      ? [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
          '/Applications/Chromium.app/Contents/MacOS/Chromium',
        ]
      : process.platform === 'win32'
        ? [
            join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google\\Chrome\\Application\\chrome.exe'),
            join(process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)', 'Google\\Chrome\\Application\\chrome.exe'),
          ]
        : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser']

  return candidates.find((candidate) => existsSync(candidate))
}

function getChromePath() {
  if (process.env.CHROME_PATH) {
    if (existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH
    console.warn(`CHROME_PATH does not exist: ${process.env.CHROME_PATH}`)
    return undefined
  }

  return findChrome()
}

function findOpenPort(startAt) {
  return new Promise((resolvePort, reject) => {
    const tryPort = (port) => {
      const server = net.createServer()
      server.unref()
      server.on('error', () => tryPort(port + 1))
      server.listen(port, '127.0.0.1', () => {
        const address = server.address()
        server.close(() => resolvePort(typeof address === 'object' && address ? address.port : port))
      })
    }

    if (!Number.isInteger(startAt) || startAt <= 0 || startAt > 65535) {
      const server = net.createServer()
      server.unref()
      server.on('error', reject)
      server.listen(0, '127.0.0.1', () => {
        const address = server.address()
        server.close(() => resolvePort(typeof address === 'object' && address ? address.port : 0))
      })
      return
    }

    tryPort(startAt)
  })
}
