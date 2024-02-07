export function extractParamsAndMatch(
  path: string,
  route: string,
): null | Map<string, string> {
  const params = new Map<string, string>()

  if (route.includes(':')) {
    const routeParts = route.split('/').filter(Boolean)
    const pathParts = path.split('/').filter(Boolean)

    if (routeParts.length !== pathParts.length) {
      return null
    }

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params.set(routeParts[i].slice(1), pathParts[i])
      } else if (routeParts[i] !== pathParts[i]) {
        return null
      }
    }

    return params
  } else if (path !== route) {
    return null
  }

  return new Map()
}
