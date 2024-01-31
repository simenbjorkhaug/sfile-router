import { configureRoutes, createRequestHandler } from '../mod.ts'

await configureRoutes()

Deno.serve((request) => {
    return createRequestHandler(request)
})