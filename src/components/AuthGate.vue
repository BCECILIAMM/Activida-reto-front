<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useAuth, ApiError } from '../composables/useAuth.js'

const { login, registro, loading } = useAuth()

const mode = ref('login') // 'login' | 'registro'
const nombre = ref('')
const email = ref('')
const telefono = ref('')
const password = ref('')
const error = ref('')

function toggleMode() {
  mode.value = mode.value === 'login' ? 'registro' : 'login'
  error.value = ''
}

async function submit() {
  error.value = ''
  try {
    if (mode.value === 'login') {
      await login(email.value.trim(), password.value)
    } else {
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

      <h1 class="auth__title">{{ mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta' }}</h1>
      <p class="auth__sub">
        {{ mode === 'login' ? 'Entra para ver tu progreso del reto.' : 'Regístrate y te inscribimos al reto activo.' }}
      </p>

      <form class="auth__form" @submit.prevent="submit">
        <div v-if="mode === 'registro'" class="auth__field">
          <label class="auth__label" for="auth-nombre">Nombre</label>
          <InputText id="auth-nombre" v-model="nombre" fluid placeholder="Tu nombre" autocomplete="name" />
        </div>

        <div class="auth__field">
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

        <div class="auth__field">
          <label class="auth__label" for="auth-password">Contraseña</label>
          <Password
            id="auth-password"
            v-model="password"
            fluid
            :feedback="mode === 'registro'"
            toggle-mask
            :input-props="{ autocomplete: mode === 'login' ? 'current-password' : 'new-password' }"
            placeholder="Mínimo 8 caracteres"
          />
        </div>

        <Message v-if="error" severity="error" :closable="false" class="auth__error">{{ error }}</Message>

        <Button
          type="submit"
          :label="loading ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'"
          :icon="loading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-right'"
          icon-pos="right"
          rounded
          fluid
          :disabled="loading"
          class="auth__submit"
        />
      </form>

      <button type="button" class="auth__switch" @click="toggleMode">
        {{ mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
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

.auth__error {
  margin: 0 !important;
}

.auth__submit {
  margin-top: 0.3rem;
  font-weight: 800 !important;
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

.activida-dark .auth__switch {
  color: var(--act-green);
}
</style>
