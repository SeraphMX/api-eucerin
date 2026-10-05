import express, { type ErrorRequestHandler, type Request, type Response } from 'express'
import cors from 'cors'
import * as React from 'react'
import { Resend } from 'resend'
import RegistrationEmail from './emails/registration.js'
import { getConfig } from './config.js'

type EmailRequestBody = {
  name?: unknown
  email?: unknown
}

const app = express()
const config = getConfig()
const resend = new Resend(config.resendApiKey)

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10kb' }))

app.options('/email', (_request, response) => {
  response.status(200).send('ok')
})

app.post('/email', async (request: Request<unknown, unknown, EmailRequestBody>, response: Response) => {
  const { name, email } = request.body

  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
    response.status(400).json({ ok: false, error: 'Falta el nombre o el correo' })
    return
  }

  const recipient = config.devMode ? config.testMailbox : email.trim()

  if (!recipient) {
    const message = config.devMode
      ? 'DEV_MODE está activo, pero TEST_MAILBOX no está configurado.'
      : 'No se recibió un correo destinatario válido.'
    console.error(message)
    response.status(500).json({ ok: false, error: message })
    return
  }

  try {
    const reactEmail = React.createElement(RegistrationEmail, {
      name: name.trim(),
      email: email.trim(),
      baseUrl: config.baseUrl
    })

    console.log(`Enviando correo a ${recipient} (DEV_MODE=${config.devMode})`)

    const { error } = await resend.emails.send({
      from: 'Evento Eucerin <notificaciones@unlockingskinlongevity.com>',
      to: recipient,
      subject: 'Registro exitoso',
      react: reactEmail
    })

    if (error) {
      console.error('Resend error:', error)
      response.status(502).json({ ok: false, error: error.message })
      return
    }

    console.log('Correo enviado a', recipient)
    response.status(200).json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al enviar el correo'
    console.error('Error al enviar correo:', error)
    response.status(500).json({ ok: false, error: message })
  }
})

app.all('/email', (_request, response) => {
  response.status(405).send('Method Not Allowed')
})

app.use((_request, response) => {
  response.status(404).json({ ok: false, error: 'Ruta no encontrada' })
})

const jsonErrorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ ok: false, error: 'JSON inválido en la solicitud' })
    return
  }

  next(error)
}

app.use(jsonErrorHandler)

app.use((error: unknown, _request: Request, response: Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Error interno del servidor'
  console.error('Error no controlado:', error)
  response.status(500).json({ ok: false, error: message })
})

app.listen(config.port, () => {
  console.log(`API escuchando en http://localhost:${config.port}`)
})
