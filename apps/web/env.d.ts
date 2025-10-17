type ImportMetaEnvAugmented = import('./env-schema').EnvSchema

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv extends ImportMetaEnvAugmented {}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
