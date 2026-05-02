# Instalacion local de UnidevFront

## Que es

Frontend Angular 19 de UniDev. En desarrollo consume el backend en `http://localhost:8081/api`.

## Requisitos

- Node.js 20.x
- npm 10.x o compatible

## Configuracion local

Este proyecto no usa `.env`. La configuracion local esta hardcodeada en:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Para local, revisa especialmente estos campos en `src/environments/environment.ts`:

- `apiUrl`: por defecto `http://localhost:8081/api`
- `auth.oidc.redirectUrl`: por defecto `http://localhost:5050/callback`
- `auth.oidc.postLogoutRedirectUri`: por defecto `http://localhost:5050/`

## Instalacion

```bash
npm install
```

## Ejecutar en local

Recomendado: levantarlo en `5050` para que coincida con la configuracion OIDC actual.

```bash
npm start -- --host 0.0.0.0 --port 5050
```

Abrir:

- `http://localhost:5050`

Si no vas a probar login y solo quieres interfaz, tambien puedes usar el puerto por defecto de Angular:

```bash
npm start
```

Pero si usas `4200`, debes ajustar tambien:

- `src/environments/environment.ts`
- `APP_FRONTEND_BASE_URL` en el backend
- `COGNITO_REDIRECT_URI` en el backend

## Build local

```bash
npm run build
```

## Dependencias que espera

- Backend UniDev en `http://localhost:8081`
- Cognito configurado si vas a probar autenticacion real

## Flujo recomendado

1. Levanta `ImagesService` si vas a subir documentos o logos.
2. Levanta `UniDev-BackEnd`.
3. Levanta este frontend en `5050`.

## Problemas comunes

- Si el login redirige mal, revisa `redirectUrl` y `postLogoutRedirectUri`.
- Si el frontend carga pero las peticiones fallan, revisa `environment.ts` y CORS del backend.
