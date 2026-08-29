<script setup>
import Button from 'primevue/button'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'

defineProps({
  tiers: { type: Array, required: true },
  challenge: { type: Object, required: true }
})

const emit = defineEmits(['reset', 'change-password'])
</script>

<template>
  <section class="rules act-section">
    <h2 class="act-section-title"><i class="pi pi-book" /> Cómo funciona</h2>

    <Accordion :value="['0']" multiple class="rules__acc">
      <AccordionPanel value="0">
        <AccordionHeader>Las reglas en corto</AccordionHeader>
        <AccordionContent>
          <ul class="rules__list">
            <li>El reto dura todo <strong>{{ challenge.month }}</strong>. El día 1 del mes siguiente se reinicia.</li>
            <li>Hay <strong>10 badges</strong>. Cada uno mide algo distinto: volumen, calidad, fuerza y descanso.</li>
            <li>Mientras más badges consigas, <strong>más alto es tu nivel</strong> al cierre del mes.</li>
            <li>No hay que conseguirlos todos. Terminar con 5 ya es un gran mes.</li>
          </ul>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="1">
        <AccordionHeader>Cómo se comprueba cada badge</AccordionHeader>
        <AccordionContent>
          <div class="rules__proof">
            <div class="rules__proof-row">
              <span class="rules__proof-icon"><i class="pi pi-watch" /></span>
              <div>
                <strong>Kilómetros, minutos y desnivel</strong>
                <p>Se sincronizan desde Strava, Garmin o tu reloj. No necesitas subir nada.</p>
              </div>
            </div>
            <div class="rules__proof-row">
              <span class="rules__proof-icon"><i class="pi pi-camera" /></span>
              <div>
                <strong>Fuerza y movilidad</strong>
                <p>Sube una foto o video corto de cada sesión. Basta con que se vea que la hiciste.</p>
              </div>
            </div>
            <div class="rules__proof-row">
              <span class="rules__proof-icon"><i class="pi pi-pencil" /></span>
              <div>
                <strong>Constancia</strong>
                <p>La marcas tú al cerrar cada semana en la que corriste 2 días o más.</p>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionPanel>

      <AccordionPanel value="2">
        <AccordionHeader>Los niveles</AccordionHeader>
        <AccordionContent>
          <div class="rules__tiers">
            <div
              v-for="t in tiers"
              :key="t.id"
              class="rules__tier"
              :style="{ '--tier-color': t.color }"
            >
              <span class="rules__tier-emoji">{{ t.emoji }}</span>
              <strong>{{ t.label }}</strong>
              <span class="rules__tier-req">{{ t.min }} badges</span>
            </div>
          </div>
          <p class="rules__note">
            El nivel se calcula al cierre del mes, pero puedes verlo subir en tiempo real.
          </p>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div class="rules__account act-panel">
      <div>
        <strong>Mi cuenta</strong>
        <p>Cambia tu contraseña de acceso.</p>
      </div>
      <Button
        label="Cambiar contraseña"
        icon="pi pi-key"
        severity="secondary"
        outlined
        rounded
        size="small"
        @click="emit('change-password')"
      />
    </div>

    <div class="rules__danger act-panel">
      <div>
        <strong>Reiniciar mi progreso</strong>
        <p>Borra todos tus registros de este mes. No se puede deshacer.</p>
      </div>
      <Button
        label="Reiniciar"
        icon="pi pi-trash"
        severity="danger"
        outlined
        rounded
        size="small"
        @click="emit('reset')"
      />
    </div>
  </section>
</template>

<style scoped>
.rules__acc :deep(.p-accordionpanel) {
  border-color: var(--act-border);
  background: transparent;
}

.rules__acc :deep(.p-accordionheader) {
  font-size: 0.85rem;
  font-weight: 700;
  background: transparent;
  padding: 0.9rem 0.25rem;
}

.rules__acc :deep(.p-accordioncontent-content) {
  background: transparent;
  padding: 0 0.25rem 1rem;
}

.rules__list {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.rules__list li {
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--act-text-2);
}

.rules__list strong {
  color: var(--act-text);
}

.rules__proof {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.rules__proof-row {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.rules__proof-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  background: var(--act-accent-soft);
  color: var(--act-green-strong);
  font-size: 0.8rem;
}

.activida-dark .rules__proof-icon {
  color: var(--act-green);
}

.rules__proof-row strong {
  font-size: 0.82rem;
  color: var(--act-text);
}

.rules__proof-row p {
  margin: 0.15rem 0 0;
  font-size: 0.76rem;
  line-height: 1.5;
  color: var(--act-text-2);
}

.rules__tiers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.rules__tier {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.7rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--tier-color) 9%, transparent);
  border: 1px solid color-mix(in srgb, var(--tier-color) 25%, transparent);
}

.rules__tier-emoji {
  font-size: 1.1rem;
}

.rules__tier strong {
  font-size: 0.78rem;
  color: var(--tier-color);
}

.rules__tier-req {
  margin-left: auto;
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--act-text-3);
  white-space: nowrap;
}

.rules__note {
  margin: 0.75rem 0 0;
  font-size: 0.74rem;
  color: var(--act-text-3);
  line-height: 1.5;
}

.rules__account {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.85rem 0.95rem;
}

.rules__account strong {
  font-size: 0.8rem;
  color: var(--act-text);
}

.rules__account p {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  color: var(--act-text-3);
  line-height: 1.45;
}

.rules__danger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.6rem;
  padding: 0.85rem 0.95rem;
  border-color: color-mix(in srgb, #ef4444 22%, var(--act-border));
}

.rules__danger strong {
  font-size: 0.8rem;
  color: var(--act-text);
}

.rules__danger p {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  color: var(--act-text-3);
  line-height: 1.45;
}

.rules__account > div,
.rules__danger > div {
  flex: 1;
  min-width: 0;
}

.rules__account :deep(.p-button),
.rules__danger :deep(.p-button) {
  flex-shrink: 0;
}
</style>
