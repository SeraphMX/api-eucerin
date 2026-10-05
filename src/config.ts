import 'dotenv/config'

function requiredEnv(name: 'RESEND_API_KEY' | 'HOST_URL'): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Configura ${name} en las variables de entorno.`)
  }

  return value
}

export function getConfig() {
  const configuredBaseUrl = requiredEnv('HOST_URL')

  return {
    resendApiKey: requiredEnv('RESEND_API_KEY'),
    baseUrl: /^https?:\/\//i.test(configuredBaseUrl)
      ? configuredBaseUrl.replace(/\/$/, '')
      : `https://${configuredBaseUrl.replace(/\/$/, '')}`,
    devMode: process.env.DEV_MODE?.trim().toLowerCase() === 'true',
    testMailbox: process.env.TEST_MAILBOX?.trim(),
    port: Number.parseInt(process.env.PORT ?? '3000', 10)
  }
}
