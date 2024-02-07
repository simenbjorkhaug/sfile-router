import { configureRoutes, createRequestHandler } from '../mod.ts'

await configureRoutes({
  config: {
    ignore: ['.test', '.service'],
  },
})

Deno.serve((request) => {
  return createRequestHandler(request)
})
