import http from 'http'
import { spawn, type ChildProcess } from 'child_process'
import { join, basename } from 'path'
import { readdirSync } from 'fs'

const appDir = join(import.meta.dirname, '..')
const functionsDir = join(appDir, 'netlify', 'functions')
const PORT = parseInt(process.env.DEV_PORT || '8888', 10)
const VITE_PORT = 5173

let viteProcess: ChildProcess | null = null

// Load all function handlers
async function loadFunctions(): Promise<Map<string, (req: Request) => Promise<Response>>> {
  const handlers = new Map<string, (req: Request) => Promise<Response>>()
  const files = readdirSync(functionsDir).filter(f => f.endsWith('.ts') && f !== 'db.ts')
  for (const file of files) {
    const name = basename(file, '.ts')
    try {
      const mod = await import(join(functionsDir, file))
      const handler = mod.default
      if (typeof handler === 'function') {
        handlers.set(name, handler)
      }
    } catch (err) {
      console.warn(`Failed to load function ${name}:`, err)
    }
  }
  return handlers
}

async function startVite(): Promise<void> {
  const viteBin = join(appDir, 'node_modules', '.bin', 'vite')
  viteProcess = spawn(viteBin, ['--port', String(VITE_PORT), '--strictPort'], {
    cwd: appDir,
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  viteProcess.on('exit', (code) => {
    console.error(`Vite process exited with code ${code}`)
  })

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Vite failed to start within 30s')), 30000)
    let output = ''
    const check = (data: Buffer) => {
      output += data.toString()
      if (output.includes('ready') || output.includes(`localhost:${VITE_PORT}`)) {
        clearTimeout(timeout)
        resolve()
      }
    }
    viteProcess!.stdout?.on('data', check)
    viteProcess!.stderr?.on('data', check)
    viteProcess!.on('error', (err) => { clearTimeout(timeout); reject(err) })
  })
}

function collectBody(req: http.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

async function main() {
  const handlers = await loadFunctions()
  console.log(`Loaded ${handlers.size} functions: ${[...handlers.keys()].join(', ')}`)

  await startVite()
  console.log(`Vite dev server ready on port ${VITE_PORT}`)

  const server = http.createServer(async (req, res) => {
    const url = req.url || '/'

    // Handle API routes -> netlify functions
    const apiMatch = url.match(/^\/api\/([^/?]+)/)
    if (apiMatch) {
      const fnName = apiMatch[1]!
      const handler = handlers.get(fnName)
      if (!handler) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: `Function ${fnName} not found` }))
        return
      }

      try {
        const body = await collectBody(req)
        const headers: Record<string, string> = {}
        for (const [key, val] of Object.entries(req.headers)) {
          if (val) headers[key] = Array.isArray(val) ? val.join(', ') : val
        }

        const fnReq = new Request(`http://localhost:${PORT}${url}`, {
          method: req.method,
          headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? body : undefined,
        })

        const fnRes = await handler(fnReq)
        const resBody = await fnRes.text()

        const resHeaders: Record<string, string> = {}
        fnRes.headers.forEach((val, key) => { resHeaders[key] = val })
        res.writeHead(fnRes.status, resHeaders)
        res.end(resBody)
      } catch (err) {
        console.error(`Error in function ${fnName}:`, err)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Internal server error' }))
      }
      return
    }

    // Proxy everything else to Vite
    const proxyReq = http.request(
      { hostname: '::1', port: VITE_PORT, path: url, method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 200, proxyRes.headers)
        proxyRes.pipe(res)
      }
    )
    proxyReq.on('error', (err) => {
      console.error(`Proxy error to Vite: ${err.message}`)
      res.writeHead(502)
      res.end(`Proxy error: ${err.message}`)
    })

    req.pipe(proxyReq)
  })

  // Handle WebSocket upgrades for Vite HMR
  server.on('upgrade', (req, socket, _head) => {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: VITE_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    })
    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write(`HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`)
      for (let i = 0; i < proxyRes.rawHeaders.length; i += 2) {
        socket.write(`${proxyRes.rawHeaders[i]}: ${proxyRes.rawHeaders[i + 1]}\r\n`)
      }
      socket.write('\r\n')
      if (proxyHead.length) socket.write(proxyHead)
      proxySocket.pipe(socket)
      socket.pipe(proxySocket)
    })
    proxyReq.on('error', () => socket.end())
    proxyReq.end()
  })

  server.listen(PORT, () => {
    console.log(`Dev server ready on http://localhost:${PORT}`)
  })

  // Keep process alive
  process.on('SIGTERM', () => {
    if (viteProcess) viteProcess.kill()
    process.exit(0)
  })
  process.on('SIGINT', () => {
    if (viteProcess) viteProcess.kill()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error('Dev server failed:', err)
  process.exit(1)
})
