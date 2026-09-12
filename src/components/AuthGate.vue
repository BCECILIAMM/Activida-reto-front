<script setup>
import { ref, computed, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuth, ApiError } from '../composables/useAuth.js'

const { login, registro, olvidePassword, restablecerPassword, loading } = useAuth()

// 'login' | 'registro' | 'olvide' (pedir enlace) | 'restablecer' (ya con token)
const mode = ref('login')
const nombre = ref('')
const email = ref('')
const telefono = ref('')
const password = ref('')
const confirmar = ref('')
const error = ref('')
const aviso = ref('') // mensaje de éxito (p. ej. "revisa tu correo")

// Token del enlace del correo: la app abre en /?restablecer=TOKEN
const resetToken = ref('')

const PARAM_RESET = 'restablecer'

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get(PARAM_RESET)
  if (!token) return
  resetToken.value = token
  mode.value = 'restablecer'
  // Se quita el token de la barra para que no quede en el historial ni se
  // comparta por accidente al copiar la dirección.
  params.delete(PARAM_RESET)
  const limpia = `${window.location.pathname}${params.size ? `?${params}` : ''}${window.location.hash}`
  window.history.replaceState(null, '', limpia)
})

const titulo = computed(
  () =>
    ({
      login: 'Inicia sesión',
      registro: 'Crea tu cuenta',
      olvide: '¿Olvidaste tu contraseña?',
      restablecer: 'Elige una contraseña nueva'
    })[mode.value]
)

const subtitulo = computed(
  () =>
    ({
      login: 'Entra para ver tu progreso del reto.',
      registro: 'Regístrate y te inscribimos al reto activo.',
      olvide: 'Escribe tu correo y te mandamos un enlace para elegir una nueva.',
      restablecer: 'Mínimo 8 caracteres. Al guardarla entras directo a la app.'
    })[mode.value]
)

const textoBoton = computed(() => {
  if (loading.value) return 'Un momento…'
  return { login: 'Entrar', registro: 'Crear cuenta', olvide: 'Enviar enlace', restablecer: 'Guardar y entrar' }[
    mode.value
  ]
})

function setMode(next) {
  mode.value = next
  error.value = ''
  aviso.value = ''
  password.value = ''
  confirmar.value = ''
}

function toggleMode() {
  setMode(mode.value === 'login' ? 'registro' : 'login')
}

async function submit() {
  error.value = ''
  aviso.value = ''
  try {
    if (mode.value === 'login') {
      await login(email.value.trim(), password.value)
    } else if (mode.value === 'registro') {
      if (!nombre.value.trim()) {
        error.value = 'Escribe tu nombre.'
        return
      }
      await registro({
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        password: password.value,
        telefono: telefono.value.trim()
      })
    } else if (mode.value === 'olvide') {
      if (!email.value.trim()) {
        error.value = 'Escribe tu correo.'
        return
      }
      const data = await olvidePassword(email.value.trim())
      aviso.value = data.message
    } else if (mode.value === 'restablecer') {
      if (password.value.length < 8) {
        error.value = 'La contraseña debe tener al menos 8 caracteres.'
        return
      }
      if (password.value !== confirmar.value) {
        error.value = 'Las dos contraseñas no coinciden.'
        return
      }
      await restablecerPassword(resetToken.value, password.value)
    }
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'Algo salió mal. Intenta de nuevo.'
  }
}
</script>

<template>
  <div class="auth act-shell">
    <div class="auth__card act-panel act-rise">
      <div class="auth__brand">
        <span class="auth__mark"><i class="pi pi-bolt" /></span>
        <span class="auth__wordmark">Acti<em>Vida</em></span>
      </div>

      <h1 class="auth__title">{{ titulo }}</h1>
      <p class="auth__sub">{{ subtitulo }}</p>

      <form class="auth__form" @submit.prevent="submit">
        <div v-if="mode === 'registro'" class="auth__field">
          <label class="auth__label" for="auth-nombre">Nombre</label>
          <InputText id="auth-nombre" v-model="nombre" fluid placeholder="Tu nombre" autocomplete="name" />
        </div>

        <div v-if="mode !== 'restablecer'" class="auth__field">
          <label class="auth__label" for="auth-email">Correo</label>
          <InputText
            id="auth-email"
            v-model="email"
            type="email"
            fluid
            placeholder="tu@correo.com"
            autocomplete="email"
          />
        </div>

        <div v-if="mode === 'registro'" class="auth__field">
          <label class="auth__label" for="auth-telefono">Teléfono <span>(opcional)</span></label>
          <InputText
            id="auth-telefono"
            v-model="telefono"
            type="tel"
            fluid
            placeholder="Para avisos del reto"
            autocomplete="tel"
            maxlength="20"
          />
        </div>

        <div v-if="mode !== 'olvide'" class="auth__field">
          <label class="auth__label" for="auth-password">
            {{ mode === 'restablecer' ? 'Nueva contraseña' : 'Contraseña' }}
          </label>
          <Password
            id="auth-password"
            v-model="password"
            fluid
            :feedback="mode === 'registro' || mode === 'restablecer'"
            toggle-mask
            :input-props="{ autocomplete: mode === 'login' ? 'current-password' : 'new-password' }"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <div v-if="mode === 'restablecer'" class="auth__field">
          <label class="auth__label" for="auth-confirmar">Repite la nueva</label>
          <Password
            id="auth-confirmar"
            v-model="confirmar"
            fluid
            :feedback="false"
            toggle-mask
            :input-props="{ autocomplete: 'new-password' }"
            placeholder="Otra vez, para estar seguras"
          />
        </div>

        <Message v-if="error" severity="error" :closable="false" class="auth__msg">{{ error }}</Message>
        <Message v-if="aviso" severity="success" :closable="false" class="auth__msg">{{ aviso }}</Message>

        <Button
          v-if="!aviso"
          type="submit"
          :label="textoBoton"
          :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-right'"
          icon-pos="right"
          rounded
          fluid
          :disabled="loading"
          class="auth__submit"
        />
      </form>

      <button v-if="mode === 'login'" type="button" class="auth__link" @click="setMode('olvide')">
        ¿Olvidaste tu contraseña?
      </button>

      <button
        v-if="mode === 'login' || mode === 'registro'"
        type="button"
        class="auth__switch"
        @click="toggleMode"
      >
        {{ mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
      </button>

      <button v-else type="button" class="auth__switch" @click="setMode('login')">
        <i class="pi pi-arrow-left" /> Volver a iniciar sesión
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem 1rem;
}

.auth__card {
  width: 100%;
  max-width: 380px;
  padding: 1.75rem 1.5rem;
  text-align: center;
}

.auth__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.1rem;
}

.auth__mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--act-green-strong), var(--act-green));
  color: var(--act-on-accent);
  font-size: 0.9rem;
  box-shadow: 0 6px 16px -6px rgba(10, 164, 71, 0.7);
}

.auth__wordmark {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--act-text);
}

.auth__wordmark em {
  font-style: normal;
  color: var(--act-green-strong);
}

.auth__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--act-text);
}

.auth__sub {
  margin: 0.4rem 0 1.4rem;
  font-size: 0.8rem;
  color: var(--act-text-2);
}

.auth__form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  text-align: left;
}

.auth__label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--act-text-3);
  margin-bottom: 0.4rem;
}

.auth__msg {
  margin: 0 !important;
}

.auth__submit {
  margin-top: 0.3rem;
  font-weight: 800 !important;
}

.auth__link {
  display: block;
  margin: 0.9rem auto 0;
  background: none;
  border: none;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--act-text-2);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth__link:hover {
  color: var(--act-text);
}

.auth__switch {
  display: block;
  margin: 1.1rem auto 0;
  background: none;
  border: none;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--act-green-strong);
  cursor: pointer;
}

.auth__switch .pi {
  font-size: 0.7rem;
  margin-right: 0.2rem;
}

.activida-dark .auth__switch {
  color: var(--act-green);
}
</style>
