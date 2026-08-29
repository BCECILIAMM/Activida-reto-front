# ActiVida · Reto Running

App del reto mensual de badges de ActiVida. Vue 3 + PrimeVue 4 + Vite.
Diseñada primero para móvil, con modo claro y oscuro.

---

## Arrancar el proyecto

```bash
npm install
npm run dev          # http://localhost:5173
```

Otros comandos:

```bash
npm run build         # build normal → dist/
npm run build:single  # todo en un solo .html → dist-single/index.html
npm run preview       # sirve el build
```

El `build:single` genera **un único archivo HTML** que puedes mandar por WhatsApp
o subir a cualquier hosting sin configurar nada. Útil para probar el reto con las
corredoras antes de tener backend.

---

## Estructura

```
src/
├── main.js                     Arranque de Vue y registro de PrimeVue
├── App.vue                     Layout y orquestación (tabs, diálogos, toasts)
│
├── theme/
│   └── activida-preset.js      Preset de PrimeVue con el verde #2ee56f
│
├── assets/
│   └── styles.css              Tokens propios (claro/oscuro) y utilidades
│
├── data/
│   └── badges.js               ← EL RETO DEL MES VIVE AQUÍ
│
├── composables/
│   ├── useTheme.js             Modo claro/oscuro + persistencia
│   ├── useChallenge.js         Estado, reglas de negocio y persistencia
│   └── useCountdown.js         Cuenta regresiva del mes
│
└── components/
    ├── AppHeader.vue           Cabecera, marca y cuenta regresiva
    ├── CountdownTimer.vue      Días/horas/min + barra tipo pista
    ├── ThemeToggle.vue         Botón sol/luna
    ├── RunnerCard.vue          Dorsal, nombre, anillo de progreso y nivel
    ├── TierTrack.vue           Los 4 niveles conectados por la pista
    ├── StatsRow.vue            Km, minutos, desnivel y registros
    ├── SyncCard.vue            Conectar Strava / Garmin
    ├── BadgeGrid.vue           Rejilla responsiva de badges
    ├── BadgeCard.vue           Tarjeta de un badge
    ├── ProgressRing.vue        Anillo SVG reutilizable
    ├── LogActivityDialog.vue   Registrar actividad (número, conteo o evidencia)
    ├── BadgeInfoDialog.vue     Explicación de cómo se consigue
    ├── BadgeUnlockedOverlay.vue Celebración al desbloquear
    ├── ActivityTimeline.vue    Historial de registros
    └── RulesPanel.vue          Reglas del reto
```

---

## Cambiar el reto cada mes

Todo está en **`src/data/badges.js`**. No hace falta tocar componentes.

```js
export const CHALLENGE = {
  month: 'Octubre',
  year: 2026,
  startsAt: '2026-10-01T00:00:00-06:00',
  endsAt: '2026-11-01T00:00:00-06:00',
  title: 'Reto ActiVida',
  subtitle: 'Un mes. Diez badges. Tu mejor versión.'
}
```

Para agregar un badge nuevo, copia un objeto del array `BADGES` y cambia:

| Campo    | Para qué sirve                                                    |
| -------- | ----------------------------------------------------------------- |
| `id`     | Identificador único, sin espacios                                 |
| `type`   | `numeric`, `count`, `weeks`, `evidence` o `auto`                   |
| `goal`   | La meta a alcanzar                                                 |
| `unit`   | `km`, `min`, `m`… solo para los `numeric`                          |
| `source` | `device` (reloj), `photo` (evidencia), `manual` o `auto`           |
| `color`  | El color del badge en la interfaz                                  |

Los niveles se cambian en `TIERS`, en el mismo archivo.

### Weekend Challenge

Para un reto especial de fin de semana, agrega un badge más con
`type: 'count'` y `goal: 1`. Aparece solo en la rejilla.

---

## Modo claro y oscuro

- Arranca con la preferencia del sistema operativo.
- El botón sol/luna la cambia y **se recuerda** en `localStorage`.
- Internamente se añade la clase `.activida-dark` al `<html>`.
- PrimeVue lo respeta porque en `main.js` está configurado
  `darkModeSelector: '.activida-dark'`.

Si necesitas un color nuevo, agrégalo como variable en `assets/styles.css`
en los dos bloques (`:root` y `.activida-dark`) y úsalo con `var(--act-…)`.

---

## Backend

La app habla con la **API ActiVida** (Fastify + Postgres/Neon + Cloudflare R2).
Configura la URL en `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

Todo el acceso a datos está aislado en `src/services/api.js` y en los
composables:

| Archivo | Responsabilidad |
| --- | --- |
| `src/services/api.js` | Cliente HTTP, manejo de token, 401 global, subida a R2 |
| `src/composables/useAuth.js` | Sesión: registro, login, "quién soy", sesión caducada |
| `src/composables/useCatalog.js` | Reto activo (`GET /retos/activo`); si falla, usa `data/badges.js` |
| `src/composables/useChallenge.js` | Progreso, historial, registrar actividad, evidencias, sincronizar |

### Qué quedó conectado

- **Reto del mes**: se carga desde `GET /retos/activo`. `data/badges.js` es solo
  el respaldo para trabajar sin conexión y para el `build:single`.
- **Evidencias** (badges de fuerza y movilidad): subida real en 3 pasos
  (URL firmada → `PUT` directo a R2 → confirmar). Si R2 no está configurado en
  el backend, la actividad igual se guarda y se avisa que la foto no subió.
- **Sesión caducada**: cualquier `401` en una ruta autenticada cierra la sesión
  y muestra un aviso (el `401` de "cambiar contraseña" no cuenta).
- **Ranking**: pestaña propia contra `GET /retos/ranking`, con tu fila resaltada.
- **Cambiar contraseña**: en la pestaña *Reglas → Mi cuenta*.
- **Historial**: paginado con "Ver más" (`GET /actividades?limite&desde`).

### Sincronización con Strava/Garmin

El botón *Sincroniza tu reloj* es una **demo**: manda una carrera de ejemplo al
endpoint real `POST /actividades/sincronizar`. La integración con OAuth de
Strava/Garmin todavía no existe.

### Endpoints que consume la app

| Método | Ruta | Qué hace |
| --- | --- | --- |
| POST | `/api/auth/registro` · `/api/auth/login` | Crea cuenta / inicia sesión |
| GET | `/api/auth/yo` | Restaura la sesión guardada |
| POST | `/api/auth/cambiar-password` | Cambia la contraseña |
| GET | `/api/retos/activo` | Reto del mes con badges y niveles |
| GET | `/api/retos/mi-progreso` | Progreso, resumen, nivel e historial |
| GET | `/api/retos/ranking?limite` | Tabla de posiciones |
| POST | `/api/actividades` | Registra una actividad |
| GET | `/api/actividades?limite&desde` | Historial paginado |
| DELETE | `/api/actividades/:id` · `/api/actividades` | Deshacer / reiniciar el mes |
| POST | `/api/actividades/sincronizar` | Importa de Strava/Garmin (demo) |
| POST | `/api/evidencias/url-de-subida` | Pide la URL firmada de R2 |
| POST | `/api/evidencias/:id/confirmar` | Confirma que la subida terminó |

El esquema y los detalles del backend viven en su propio repo
(`Backend/Activida-reto-back`).

---

## Pruebas

```bash
npm test
```

Vitest cubre la lógica derivada del reto (metas, ratios, niveles, badge
maestro) y la validación de evidencias en `src/composables/useChallenge.spec.js`.

---

## Notas de accesibilidad

- Contraste verificado en modo claro y oscuro.
- Todos los campos tienen `<label>` asociado.
- El botón de tema anuncia su acción con `aria-label`.
- Se respeta `prefers-reduced-motion`: las animaciones se desactivan solas.
