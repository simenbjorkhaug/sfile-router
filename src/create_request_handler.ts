import type { Methods } from './methods.ts'
import { Config, routes } from './routes.ts'
import { extractParamsAndMatch } from './extract_params_and_match.ts'

export type Options = {
  shouldThrow?: boolean
}

export class NotFoundError extends Error {}

export class MethodNotAllowedError extends Error {}

// deno-lint-ignore no-explicit-any
export const createRequestHandler = function <T extends typeof routes, C = any>(
  _routes: T,
  request: Request,
  context?: C,
) {
  const url = new URL(request.url)

  const path = url.pathname

  for (const [route, methods] of _routes) {
    const params = extractParamsAndMatch(path, route)

    if (params) {
      const method = request.method.toUpperCase() as Methods

      if (methods.has(method)) {
        const { handler } = methods.get(method)!

        return handler({ request, params, context: context ?? {} })
      }

      if (Config.shouldThrow) {
        throw new MethodNotAllowedError(`Method ${method} not allowed`)
      }

      return new Response('Method not allowed', { status: 405 })
    }
  }

  if (Config.shouldThrow) {
    throw new NotFoundError('Not found')
  }

  return new Response('Not found', { status: 404 })
  // deno-lint-ignore no-explicit-any
}.bind(null, routes) as <T = any>(
  request: Request,
  context?: T,
) => Promise<Response> | Response

// deno-lint-ignore no-explicit-any
export type RequestHandlerArgs<T = Map<string, string>, C = any> = {
  request: Request
  params: T
  context: C
}

// deno-lint-ignore no-explicit-any
export type RequestHandler<T, C = any> = (
  arg: RequestHandlerArgs<T, C>,
) => Promise<Response> | Response
