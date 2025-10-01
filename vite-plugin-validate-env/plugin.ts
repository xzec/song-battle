import { loadEnv, type PluginOption } from 'vite'
import type { ZodType } from 'zod'
import { schema } from './schema'

const name = 'vite-plugin-validate-env'

const validateEnvPlugin = (envSchema: ZodType = schema): PluginOption => [
  {
    name,
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd())
      const result = envSchema.safeParse(env)
      if (!result.success) {
        const lines = result.error.issues.map((issue) => {
          console.log(issue.input)
          return ` - ${issue.path}: ${issue.message}`
        })
        const error = [
          `[${name}] Invalid environment variables:`,
          ...lines,
        ].join('\n')
        throw new Error(error)
      }
    },
  },
]

export default validateEnvPlugin
