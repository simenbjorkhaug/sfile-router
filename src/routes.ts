import { expandGlob } from 'https://deno.land/std@0.213.0/fs/mod.ts'
import { existsSync } from 'https://deno.land/std@0.213.0/fs/exists.ts'
import { methods, type Methods } from './methods.ts'

type Handler = ({
  params,
  request,
  context,
}: {
  params: Map<string, null | string>
  request: Request
  context: unknown
}) => Promise<Response> | Response

/** I need to sort routes so that /health is before /:name etc, so that specified paths are matched against first */
export const routes: [string, Map<Methods, { handler: Handler }>][] = []

export const Config = {
  shouldThrow: false,
  ignore: ['.service', '.test'] as string[],
}

export async function configureRoutes({
  directory = './routes',
  config,
}: { directory?: string; config?: typeof Config } = {}) {
  const _routes = new Map<
    string,
    Map<
      (typeof methods)[number],
      {
        handler: ({
          params,
          request,
          context,
        }: {
          params: Map<string, null | string>
          request: Request
          context: unknown
        }) => Promise<Response> | Response
      }
    >
  >()

  if (!directory) {
    directory = './routes'
  }

  if (
    !existsSync(directory, {
      isDirectory: true,
      isReadable: true,
    })
  ) {
    throw new Error('No routes directory found, please create one.')
  }

  if (config) {
    Object.assign(Config, config)
  }

  outerLoop: for await (const file of expandGlob(`${directory}/**/*.ts`, {
    followSymlinks: false,
  })) {
    const fileContents = await import(file.path)

    const [, file_path] = file.path.split('routes')

    if (Array.isArray(Config.ignore)) {
      for (const ignore of Config.ignore) {
        if (file_path.includes(ignore)) {
          continue outerLoop
        }
      }
    }

    let router_path = `/${file_path
      .replace(/^\/+/, '') // replacing leading slash from file_path
      .replace(/(index)/i, 'REPLACED_INDEX')
      .replace(/^_[^\.]*\./, '') // allow for grouping routes
      .replace(/^\./, '') // remove leading dot
      .replace(/\(\.\)/g, 'ESCAPED_DOT') // temporarily replace dots in parentheses
      .replace('.ts', '') // replace extension
      .replace(/\./g, '/') // replace dots with slashes
      .replace(/ESCAPED_DOT/g, '.') // put dots in parentheses back in
      .replace(/REPLACED_INDEX/, '')
      .replace(/^\/+/, '') // replacing leading slash from file_path
      .replace(/\/+$/, '') // replacing trailing slash from file_path
      .replace(/\[(.*?)\]/g, ':$1')}` // replace square brackets with colons

    if (router_path === '/index') {
      router_path = '/'
    }

    _routes.set(router_path, new Map())

    for (const method of methods) {
      if (fileContents[method]) {
        _routes.get(router_path)?.set(method, {
          handler: fileContents[method],
        })
      }
    }
  }

  const sorted = Array.from(_routes.entries()).sort((a, b) => {
    if (a[0].includes(':') && !b[0].includes(':')) {
      return 1
    }

    if (!a[0].includes(':') && b[0].includes(':')) {
      return -1
    }

    return a[0].localeCompare(b[0])
  })

  routes.push(...sorted)

  console.log(routes)
}
