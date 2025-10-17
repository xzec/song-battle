import { loadEnv, type PluginOption } from 'vite'
import type { ZodType } from 'zod'

const name = 'vite-plugin-validate-env'

const validateEnvPlugin = (schema: ZodType): PluginOption => [
  {
    name,
    config(_, { mode }) {
      const env = loadEnv(mode, process.cwd())
      const result = schema.safeParse(env)
      if (!result.success) {
        const lines = result.error.issues.map((issue) => {
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
