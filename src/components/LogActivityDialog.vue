<script setup>
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import SelectButton from 'primevue/selectbutton'
import Message from 'primevue/message'

const props = defineProps({
  visible: { type: Boolean, default: false },
  badge: { type: Object, default: null },
  current: { type: Number, default: 0 }
})

const emit = defineEmits(['update:visible', 'submit'])

/* ---------- estado del formulario ---------- */
const amount = ref(null)
const notes = ref('')
const files = ref([])
const previews = ref([])
const error = ref('')
const fileInput = ref(null)

/** Atajos rápidos según el tipo de badge */
const quickOptions = computed(() => {
  if (!props.badge) return []
  if (props.badge.unit === 'km') return [3, 5, 8, 10]
  if (props.badge.unit === 'min') return [20, 30, 45, 60]
  if (props.badge.unit === 'm') return [25, 50, 100, 150]
  return []
})

const remaining = computed(() => {
  if (!props.badge) return 0
  return Math.max(0, props.badge.goal - props.current)
})

const isNumeric = computed(() => props.badge?.type === 'numeric')
const isEvidence = computed(() => props.badge?.type === 'evidence')
const isCount = computed(() => ['count', 'weeks'].includes(props.badge?.type))

const suffix = computed(() => (props.badge?.unit ? ' ' + props.badge.unit : ''))

/* ---------- reset al abrir ---------- */
watch(
  () => props.visible,
  (open) => {
    if (open) {
      amount.value = null
      notes.value = ''
      files.value = []
      previews.value.forEach((p) => URL.revokeObjectURL(p.url))
      previews.value = []
      error.value = ''
    }
  }
)

/* ---------- archivos ---------- */
function pickFiles() {
  fileInput.value?.click()
}

function onFiles(event) {
  const list = Array.from(event.target.files || [])
  list.forEach((file) => {
    if (files.value.length >= 4) return
    files.value.push(file)
    previews.value.push({
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      isVideo: file.type.startsWith('video/')
    })
  })
  error.value = ''
  event.target.value = ''
}

function removeFile(index) {
  const p = previews.value[index]
  if (p?.url) URL.revokeObjectURL(p.url)
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

/* ---------- envío ---------- */
function submit() {
  if (!props.badge) return

  if (isNumeric.value) {
    if (!amount.value || amount.value <= 0) {
      error.value = 'Escribe una cantidad mayor a cero.'
      return
    }
    emit('submit', { badge: props.badge, amount: amount.value, notes: notes.value })
  } else if (isCount.value) {
    emit('submit', { badge: props.badge, amount: 1, notes: notes.value })
  } else if (isEvidence.value) {
    if (!files.value.length) {
      error.value = 'Sube al menos una foto o video como evidencia.'
      return
    }
    emit('submit', {
      badge: props.badge,
      amount: 1,
      notes: notes.value,
      evidence: files.value.length
    })
  }
  close()
}

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    dismissable-mask
    class="act-sheet log-dialog"
    :style="{ width: '440px' }"
    :breakpoints="{ '640px': '100vw' }"
    :draggable="false"
    @update:visible="emit('update:visible', $event)"
  >
    <template #header>
      <div v-if="badge" class="log__header" :style="{ '--badge-color': badge.color }">
        <span class="log__emoji">{{ badge.emoji }}</span>
        <div>
          <h3 class="log__title">{{ badge.name }}</h3>
          <span class="log__cat">{{ badge.cat }}</span>
        </div>
      </div>
    </template>

    <div v-if="badge" class="log" :style="{ '--badge-color': badge.color }">
      <!-- Progreso actual -->
      <div class="log__status">
        <div class="log__status-row">
          <span>Llevas</span>
          <strong>
            {{ badge.unit === 'km' ? Number(current.toFixed(1)) : Math.round(current) }}
            de {{ badge.goal }}{{ suffix }}
          </strong>
        </div>
        <div class="log__status-bar">
          <div class="log__status-fill" :style="{ width: (current / badge.goal) * 100 + '%' }" />
        </div>
        <p v-if="remaining > 0" class="log__status-hint">
          Te {{ remaining === 1 ? 'falta' : 'faltan' }}
          {{ badge.unit === 'km' ? Number(remaining.toFixed(1)) : Math.round(remaining) }}{{ suffix }}
          para completarlo
        </p>
        <p v-else class="log__status-hint log__status-hint--done">
          <i class="pi pi-check-circle" /> Badge completado — lo que sumes ya es extra
        </p>
      </div>

      <!-- NUMÉRICO -->
      <div v-if="isNumeric" class="log__field">
        <label class="log__label" :for="'amount-' + badge.id">{{ badge.fieldLabel }}</label>
        <InputNumber
          :input-id="'amount-' + badge.id"
          v-model="amount"
          :min="0"
          :max-fraction-digits="badge.unit === 'km' ? 2 : 0"
          :suffix="suffix"
          :step="badge.step"
          show-buttons
          button-layout="horizontal"
          increment-button-icon="pi pi-plus"
          decrement-button-icon="pi pi-minus"
          input-class="log__number"
          fluid
          placeholder="0"
        />

        <div v-if="quickOptions.length" class="log__quick">
          <span class="log__quick-label">Rápido:</span>
          <button
            v-for="q in quickOptions"
            :key="q"
            type="button"
            class="log__chip"
            :class="{ 'is-active': amount === q }"
            @click="amount = q"
          >
            +{{ q }}{{ badge.unit }}
          </button>
        </div>
      </div>

      <!-- CONTEO -->
      <div v-else-if="isCount" class="log__field">
        <Message severity="secondary" :closable="false" class="log__msg">
          {{ badge.fieldLabel }}
        </Message>
        <p class="log__count-hint">
          Al guardar sumarás <strong>1 de {{ badge.goal }}</strong>
          {{ badge.type === 'weeks' ? 'semanas' : 'sesiones' }}.
        </p>
      </div>

      <!-- EVIDENCIA -->
      <div v-else-if="isEvidence" class="log__field">
        <label class="log__label">Evidencia (foto o video)</label>

        <input
          ref="fileInput"
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          @change="onFiles"
        />

        <button v-if="files.length < 4" type="button" class="log__drop" @click="pickFiles">
          <i class="pi pi-camera" />
          <span class="log__drop-title">Toca para subir</span>
          <span class="log__drop-hint">Máximo 4 archivos · foto o video corto</span>
        </button>

        <div v-if="previews.length" class="log__previews">
          <div v-for="(p, i) in previews" :key="i" class="log__preview">
            <img v-if="p.url" :src="p.url" :alt="p.name" />
            <div v-else class="log__preview-file">
              <i class="pi pi-video" />
              <span>{{ p.name.slice(0, 12) }}</span>
            </div>
            <button type="button" class="log__preview-x" aria-label="Quitar" @click="removeFile(i)">
              <i class="pi pi-times" />
            </button>
          </div>
        </div>
      </div>

      <!-- NOTAS -->
      <div class="log__field">
        <label class="log__label" :for="'notes-' + badge.id">Notas <span>(opcional)</span></label>
        <Textarea
          :id="'notes-' + badge.id"
          v-model="notes"
          rows="2"
          auto-resize
          fluid
          placeholder="Ej: 5 km en el Parque Rodolfo Landeros, ritmo suave…"
        />
      </div>

      <Message v-if="error" severity="error" :closable="false" class="log__error">
        {{ error }}
      </Message>
    </div>

    <template #footer>
      <div class="log__actions">
        <Button label="Cancelar" severity="secondary" text rounded @click="close" />
        <Button label="Guardar" icon="pi pi-check" rounded class="log__save" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>

<style scoped>
/* Cabecera */
.log__header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.log__emoji {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-size: 1.35rem;
  background: color-mix(in srgb, var(--badge-color) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent);
}

.log__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: var(--act-text);
}

.log__cat {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--act-text-3);
}

/* Cuerpo */
.log__status {
  padding: 0.75rem 0.85rem;
  border-radius: 14px;
  background: color-mix(in srgb, var(--badge-color) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--badge-color) 22%, transparent);
  margin-bottom: 1.1rem;
}

.log__status-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--act-text-2);
  margin-bottom: 0.4rem;
}

.log__status-row strong {
  color: var(--act-text);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.log__status-bar {
  height: 5px;
  border-radius: 99px;
  background: var(--act-track);
  overflow: hidden;
}

.log__status-fill {
  height: 100%;
  border-radius: 99px;
  background: var(--badge-color);
  transition: width 0.5s;
}

.log__status-hint {
  margin: 0.45rem 0 0;
  font-size: 0.7rem;
  color: var(--act-text-3);
}

.log__status-hint--done {
  color: var(--badge-color);
  font-weight: 700;
}

.log__field {
  margin-bottom: 1.1rem;
}

.log__label {
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--act-text-3);
  margin-bottom: 0.45rem;
}

.log__label span {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
}

:deep(.log__number) {
  text-align: center;
  font-weight: 800;
  font-size: 1.05rem;
}

/* Atajos */
.log__quick {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.6rem;
}

.log__quick-label {
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--act-text-3);
  margin-right: 0.15rem;
}

.log__chip {
  padding: 0.3rem 0.7rem;
  border-radius: 99px;
  border: 1px solid var(--act-border);
  background: var(--act-panel-2);
  color: var(--act-text-2);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.log__chip:hover,
.log__chip.is-active {
  border-color: var(--badge-color);
  color: var(--badge-color);
  background: color-mix(in srgb, var(--badge-color) 12%, transparent);
}

.log__count-hint {
  margin: 0.6rem 0 0;
  font-size: 0.78rem;
  color: var(--act-text-2);
}

.log__count-hint strong {
  color: var(--act-text);
}

/* Evidencia */
.log__drop {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 1.3rem 1rem;
  border: 2px dashed var(--act-border-strong);
  border-radius: 16px;
  background: var(--act-panel-2);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  color: var(--act-text-2);
}

.log__drop:hover {
  border-color: var(--badge-color);
  background: color-mix(in srgb, var(--badge-color) 6%, transparent);
}

.log__drop .pi-camera {
  font-size: 1.5rem;
  color: var(--badge-color);
  margin-bottom: 0.3rem;
}

.log__drop-title {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--act-text);
}

.log__drop-hint {
  font-size: 0.68rem;
  color: var(--act-text-3);
}

.log__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.65rem;
}

.log__preview {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--act-border);
  background: var(--act-panel-2);
}

.log__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.log__preview-file {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  gap: 0.15rem;
  font-size: 0.55rem;
  color: var(--act-text-3);
  text-align: center;
  padding: 0.3rem;
}

.log__preview-file .pi {
  font-size: 1rem;
  color: var(--badge-color);
}

.log__preview-x {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 0.55rem;
  cursor: pointer;
}

.log__msg {
  margin: 0 !important;
}

.log__error {
  margin: 0 !important;
}

/* Pie */
.log__actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.log__actions :deep(.p-button) {
  flex: 1;
}

.log__save {
  font-weight: 800 !important;
}
</style>
