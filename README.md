# API de correo Eucerin

API Express con TypeScript que renderiza el correo con React Email y lo envía mediante Resend.

La API permite solicitudes CORS desde cualquier origen (`*`). Esta configuración es adecuada
para un endpoint público sin cookies ni credenciales de navegador.

## Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env` y configura:

   - `RESEND_API_KEY`: API key de Resend.
   - `HOST_URL`: dominio público usado para los enlaces e imágenes de la plantilla.
   - `DEV_MODE=true`: redirige todos los correos a `TEST_MAILBOX`.
   - `TEST_MAILBOX`: destinatario usado durante desarrollo.
   - `PORT`: opcional; por defecto es `3000`.

3. Inicia el servidor:

   ```bash
   npm run dev
   ```

Para producción:

```bash
npm run build
npm start
```

## Endpoint

### `POST /email`

Body JSON:

```json
{
  "name": "Nombre del usuario",
  "email": "usuario@ejemplo.com"
}
```

Respuestas:

- `200`: `{ "ok": true }`
- `400`: JSON inválido o faltan `name`/`email`.
- `405`: método no permitido.
- `502`: Resend rechazó el envío.
- `500`: error de configuración o del servidor.

`OPTIONS /email` responde `200` con `ok` para solicitudes de preflight. Los demás métodos no disponibles responden `404`.
