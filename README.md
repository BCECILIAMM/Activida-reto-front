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

## Conectar con tu backend (Spring Boot + Oracle)

Hoy el progreso se guarda en `localStorage`. Todo el acceso a datos está
aislado en **`src/composables/useChallenge.js`**, en las funciones `load()` y
`persist()`. Sustituirlas por llamadas HTTP es el único cambio necesario:

```js
async function load() {
  const res = await fetch('/api/reto/mi-progreso', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

async function persist() {
  await fetch('/api/reto/mi-progreso', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ progress, history: history.value })
  })
}
```

### Tablas sugeridas (Oracle)

```sql
-- Un reto por mes
CREATE TABLE reto (
  id            NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre        VARCHAR2(120)  NOT NULL,
  fecha_inicio  DATE           NOT NULL,
  fecha_fin     DATE           NOT NULL,
  activo        NUMBER(1)      DEFAULT 1
);

-- Definición de cada badge del reto
CREATE TABLE badge (
  id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reto_id     NUMBER         NOT NULL REFERENCES reto(id),
  codigo      VARCHAR2(40)   NOT NULL,   -- 'k25', 'strong'…
  nombre      VARCHAR2(80)   NOT NULL,
  categoria   VARCHAR2(60),
  descripcion VARCHAR2(400),
  tipo        VARCHAR2(20)   NOT NULL,   -- numeric | count | weeks | evidence | auto
  unidad      VARCHAR2(10),
  meta        NUMBER(10,2)   NOT NULL,
  fuente      VARCHAR2(20)   NOT NULL,   -- device | photo | manual | auto
  color       VARCHAR2(9),
  CONSTRAINT uk_badge UNIQUE (reto_id, codigo)
);

-- Inscripción de una corredora a un reto
CREATE TABLE inscripcion (
  id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reto_id    NUMBER NOT NULL REFERENCES reto(id),
  usuario_id NUMBER NOT NULL,
  dorsal     VARCHAR2(10),
  nivel      VARCHAR2(20),               -- bronce | plata | oro | legend
  CONSTRAINT uk_inscripcion UNIQUE (reto_id, usuario_id)
);

-- Cada registro que hace la usuaria
CREATE TABLE actividad (
  id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  inscripcion_id NUMBER        NOT NULL REFERENCES inscripcion(id),
  badge_id       NUMBER        NOT NULL REFERENCES badge(id),
  cantidad       NUMBER(10,2)  NOT NULL,
  notas          VARCHAR2(500),
  origen         VARCHAR2(20),           -- manual | strava | garmin
  externo_id     VARCHAR2(80),           -- id de Strava, para no duplicar
  registrado_en  TIMESTAMP     DEFAULT SYSTIMESTAMP
);

-- Fotos o videos de fuerza y movilidad
CREATE TABLE evidencia (
  id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actividad_id NUMBER        NOT NULL REFERENCES actividad(id),
  url          VARCHAR2(500) NOT NULL,
  tipo         VARCHAR2(20),             -- image | video
  subido_en    TIMESTAMP     DEFAULT SYSTIMESTAMP
);

-- Progreso acumulado (se puede calcular, pero cachearlo es más rápido)
CREATE TABLE progreso (
  inscripcion_id NUMBER       NOT NULL REFERENCES inscripcion(id),
  badge_id       NUMBER       NOT NULL REFERENCES badge(id),
  acumulado      NUMBER(10,2) DEFAULT 0,
  completado_en  TIMESTAMP,
  CONSTRAINT pk_progreso PRIMARY KEY (inscripcion_id, badge_id)
);
```

### Endpoints sugeridos

| Método | Ruta                          | Qué hace                                     |
| ------ | ----------------------------- | -------------------------------------------- |
| GET    | `/api/retos/activo`           | El reto del mes con sus badges                |
| GET    | `/api/retos/{id}/mi-progreso` | Progreso, historial y nivel de la usuaria     |
| POST   | `/api/actividades`            | Registra una actividad y recalcula el badge   |
| POST   | `/api/actividades/{id}/evidencia` | Sube la foto o video (multipart)         |
| DELETE | `/api/actividades/{id}`       | Deshace un registro                           |
| GET    | `/api/retos/{id}/ranking`     | Tabla de posiciones del mes                   |
| POST   | `/api/integraciones/strava/sync` | Importa actividades desde Strava           |

**Ojo con Strava:** guarda el `externo_id` de cada actividad importada. Sin eso,
cada sincronización vuelve a sumar los mismos kilómetros.

---

## Notas de accesibilidad

- Contraste verificado en modo claro y oscuro.
- Todos los campos tienen `<label>` asociado.
- El botón de tema anuncia su acción con `aria-label`.
- Se respeta `prefers-reduced-motion`: las animaciones se desactivan solas.
