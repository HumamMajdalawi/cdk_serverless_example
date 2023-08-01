import * as dotenv from 'dotenv'

type Environment = 'local' | 'development' | 'production'
export const environment: Environment = (process.env.NODE_ENV ?? 'production') as Environment

dotenv.config({ path: `${__dirname}/.env.${environment}` })

export const getEnv = (key: string, fallback?: string): string => {
  return process.env[key] ?? fallback as string
}

