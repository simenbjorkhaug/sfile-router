export const methods = [
  'GET', 
  'POST', 
  'PUT', 
  'DELETE', 
  'PATCH', 
  'HEAD', 
  'OPTIONS', 
  'TRACE', 
  'CONNECT'
] as const

export type Methods = typeof methods[number]