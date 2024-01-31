import { expandGlob } from "https://deno.land/std@0.213.0/fs/mod.ts"
import { existsSync } from 'https://deno.land/std@0.213.0/fs/exists.ts'
import { methods } from "./methods.ts"

export const routes = new Map<string, Map<typeof methods[number], {
    // deno-lint-ignore no-explicit-any
    handler: ({ params, request, context }: { params: Map<string, null | string>, request: Request, context: any }) => Promise<Response> | Response
}>>()

export const Config = {
  shouldThrow: false
}

export async function configureRoutes({ directory = './routes', config }: { directory?: string , config?: typeof Config } = {}) {
  if (!directory) {
    directory = './routes'
  }
  
  if (!existsSync(directory, {
    isDirectory: true,
    isReadable: true
  })) {
    throw new Error('No routes directory found, please create one.')
  }

  if (config) {
    Object.assign(Config, config)
  }

  for await (const file of expandGlob(`${directory}/*.ts`)) {
    const fileContents = await import(file.path)

    const [,file_path] = file.path.split('routes')

    let router_path = `/${file_path
      .replace(/^\//, '') // replacing leading slash from file_path
      .replace(/^_[^\.]*\./, '') // allow for grouping routes
      .replace(/^\./, '') // remove leading dot
      .replace(/\(\.\)/g, 'ESCAPED_DOT') // temporarily replace dots in parentheses
      .replace('.ts', '') // replace extension
      .replace(/\./g , '/') // replace dots with slashes
      .replace(/ESCAPED_DOT/g, '.') // put dots in parentheses back in
      .replace(/\[(.*?)\]/g, ':$1')}` // replace square brackets with colons


    if (router_path === '/index') {
      router_path = '/'
    }

    routes.set(router_path, new Map())

    for (const method of methods) {
      if (fileContents[method]) {
        routes.get(router_path)?.set(method, {
          handler: fileContents[method]
        })
      }
    }
  }
}