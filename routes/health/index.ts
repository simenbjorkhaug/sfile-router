import { health_service } from './health.service.ts'

export function GET() {
  return new Response(JSON.stringify(health_service()))
}
