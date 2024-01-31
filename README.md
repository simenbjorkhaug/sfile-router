# Deno file based router ( simple poc )

Contains code to setup a file based routing system. Does not support splat
routes, but handles 404. Must be run with read file permission, `--allow-read`.
Routes must be defined in a top level `routes` folder, i.e
`routes/example.ts -> /example` You expose the method from named exports in the
file. See example.

## Setup

```typescript
import {
  configureRoutes,
  createRequestHandler,
} from 'npm:@bjorkhaug/sfile-router'

await configureRoutes()

Deno.serve((request) => {
  return createRequestHandler(request)
})
```

### Usage

```typescript
import type { RequestHandlerArgs } from 'npm:@bjorkhaug/sfile-router'

export const GET = function({ params }: RequestHandlerArgs) {
    return new Response(JSON.stringify({ hello: params.get('message') })), {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
```

You can export any http method as an all capsed function name, this is because
in strict mode delete in lowercase is reserved. The router only supports one
method decleration per file, so you cannot have multiple get.\
Routes support params by enclosing the route segment in brackets `[param]`. An
example of a param route: `example.[param].ts -> /example/:param`. A route can
be grouped by prepending a prefix with an underscore, meaning that part of the
url will be ignored, not this is only for the first part of the path at this
time, example: `_auth.login.password.ts -> /login/password`. If you need to
escape a dot in the path, you can do so by using parantesis:
`_auth.auth.(.)well-known.ts -> /auth/.well-known`

You can customize the behavior of not found or method not allowed ( non defined
methods, but the route exists ) to handle this with custom logic as
createRequestHandler just returns a response by default. By passing an option to
the configureRoutes function.

```typescript
import { configureRoutes } from 'npm:@bjorkhaug/sfile-router'

await configureRoutes({
  config: {
    shouldThrow: true,
  },
})
```
