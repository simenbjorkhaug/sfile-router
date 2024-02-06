import type { RequestHandlerArgs } from '../mod.ts'

export const GET = function ({ params }: RequestHandlerArgs) {
  return new Response(`Hello ${params.get('name')}!`)
}
