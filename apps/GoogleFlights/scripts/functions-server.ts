import { createServer } from 'http'
import { join, basename } from 'path'
import { readdirSync } from 'fs'

const functionsDir = join(import.meta.dirname, '..', 'netlify', 'functions')
const port = parseInt(process.argv[2] || '9999')

// Load all function modules
const functionModules: Record<string, { default: (req: Request, ctx: unknown) => Promise<Response> }> = {}

const files = readdirSync(functionsDir).filter(f => f.endsWith('.ts') && f !== 'db.ts')
for (const file of files) {
  const name = basename(file, '.ts')
  functionModules[name] = await import(join(functionsDir, file))
}

console.log(`Loaded ${Object.keys(functionModules).length} functions: ${Object.keys(functionModules).join(', ')}`)

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`)

  // Match /api/<function-name> or /.netlify/functions/<function-name>
  let funcName: string | null = null
  const apiMatch = url.pathname.match(/^\/api\/([^/]+)/)
  const netlifyMatch = url.pathname.match(/^\/.netlify\/functions\/([^/]+)/)

  if (apiMatch?.[1]) {
    funcName = apiMatch[1]
  } else if (netlifyMatch?.[1]) {
    funcName = netlifyMatch[1]
  }

  if (!funcName || !functionModules[funcName]) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  try {
    // Build a Request object from the incoming HTTP request
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value[0]! : value)
    }

    const requestUrl = `http://localhost:${port}${req.url}`
    const requestInit: RequestInit = {
      method: req.method,
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks: Buffer[] = []
      for await (const chunk of req) {
        chunks.push(chunk as Buffer)
      }
      requestInit.body = Buffer.concat(chunks)
    }

    const request = new Request(requestUrl, requestInit)
    const response = await functionModules[funcName]!.default(request, {})

    // Send response
    res.writeHead(response.status, {
      'Content-Type': response.headers.get('content-type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    })
    const body = await response.text()
    res.end(body)
  } catch (err: unknown) {
    const error = err as Error
    console.error(`Function ${funcName} error:`, error.message)
    res.writeHead(500)
    res.end(JSON.stringify({ error: error.message }))
  }
})

server.listen(port, () => {
  console.log(`Functions server ready on port ${port}`)
})
