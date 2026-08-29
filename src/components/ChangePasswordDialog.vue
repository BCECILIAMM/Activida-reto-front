<script setup>
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Password from 'primevue/password'
import Message from 'primevue/message'
import { api } from '../services/api.js'
import { ApiError } from '../composables/useAuth.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'done'])

const actual = ref('')
const nueva = ref('')
const confirmar = ref('')
const error = ref('')
const saving = ref(false)

watch(
  () => props.visible,
  (open) => {
    if (open) {
      actual.value = ''
      nueva.value = ''
      confirmar.value = ''
      error.value = ''
      saving.value = false
    }
  }
)

function close() {
  emit('update:visible', false)
}

async function submit() {
  error.value = ''
  if (nueva.value.length < 8) {
    error.value = 'La nueva contraseña debe tener al menos 8 caracteres.'
    return
  }
  if (nueva.value !== confirmar.value) {
    error.value = 'La confirmación no coincide con la nueva contraseña.'
    return
  }
  saving.value = true
  try {
    await api.auth.cambiarPassword({ actual: actual.value, nueva: nueva.value })
    emit('done')
    close()
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'No se pudo cambiar la contraseña.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    dismissable-mask
    :draggable="false"
    header="Cambiar contraseña"
    class="act-sheet"
    :style="{ width: '380px' }"
    :breakpoints="{ '640px': '100vw' }"
    @update:visible="emit('update:visible', $event)"
  >
    <form class="cpw" @submit.prevent="submit">
      <div class="cpw__field">
        <label class="cpw__label" for="cpw-actual">Contraseña actual</label>
        <Password
          id="cpw-actual"
          v-model="actual"
          fluid
          :feedback="false"
          toggle-mask
          :input-props="{ autocomplete: 'current-password' }"
        />
      </div>

      <div class="cpw__field">
        <label class="cpw__label" for="cpw-nueva">Nueva contraseña</label>
        <Password
          id="cpw-nueva"
          v-model="nueva"
          fluid
          toggle-mask
          :input-props="{ autocomplete: 'new-password' }"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div class="cpw__field">
        <label class="cpw__label" for="cpw-confirmar">Repite la nueva</label>
        <Password
          id="cpw-confirmar"
          v-model="confirmar"
          fluid
          :feedback="false"
          toggle-mask
          :input-props="{ autocomplete: 'new-password' }"
        />
      </div>

      <Message v-if="error" severity="error" :closable="false" class="cpw__error">{{ error }}</Message>
    </form>

    <template #footer>
      <div class="cpw__actions">
        <Button label="Cancelar" severity="secondary" text rounded :disabled="saving" @click="close" />
        <Button
          :label="saving ? 'Guardando…' : 'Guardar'"
          :icon="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          rounded
          :disabled="saving"
          @click="submit"
        />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
.cpw {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.cpw__label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--act-text-3);
  margin-bottom: 0.4rem;
}

.cpw__error {
  margin: 0 !important;
}

.cpw__actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.cpw__actions :deep(.p-button) {
  flex: 1;
}
</style>
