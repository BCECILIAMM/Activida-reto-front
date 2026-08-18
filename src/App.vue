<script setup>
import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

import AppHeader from './components/AppHeader.vue'
import RunnerCard from './components/RunnerCard.vue'
import TierTrack from './components/TierTrack.vue'
import StatsRow from './components/StatsRow.vue'
import SyncCard from './components/SyncCard.vue'
import BadgeGrid from './components/BadgeGrid.vue'
import ActivityTimeline from './components/ActivityTimeline.vue'
import RulesPanel from './components/RulesPanel.vue'
import LogActivityDialog from './components/LogActivityDialog.vue'
import BadgeInfoDialog from './components/BadgeInfoDialog.vue'
import BadgeUnlockedOverlay from './components/BadgeUnlockedOverlay.vue'

import { useChallenge } from './composables/useChallenge.js'
import { useCountdown } from './composables/useCountdown.js'

const toast = useToast()
const confirm = useConfirm()

const {
  challenge,
  badges,
  tiers,
  runner,
  history,
  allCompleted,
  totalBadges,
  currentTier,
  nextTier,
  overallRatio,
  stats,
  isDone,
  ratio,
  currentValue,
  formatValue,
  logActivity,
  undoLast,
  resetAll,
  syncFromDevice
} = useChallenge()

const { parts, monthProgress, finished } = useCountdown(challenge.startsAt, challenge.endsAt)

/* ---------- diálogos ---------- */
const logVisible = ref(false)
const infoVisible = ref(false)
const selectedBadge = ref(null)
const unlockedBadge = ref(null)
const unlockedTier = ref(null)

const selectedCurrent = computed(() =>
  selectedBadge.value ? currentValue(selectedBadge.value) : 0
)

function openLog(badge) {
  selectedBadge.value = badge
  logVisible.value = true
}

function openInfo(badge) {
  selectedBadge.value = badge
  infoVisible.value = true
}

/* ---------- acciones ---------- */
function handleSubmit({ badge, amount, notes, evidence }) {
  const tierBefore = currentTier.value?.id || null
  const result = logActivity(badge, amount, { notes, evidence })

  if (result.unlocked) {
    const tierAfter = currentTier.value
    unlockedBadge.value = badge
    unlockedTier.value = tierAfter && tierAfter.id !== tierBefore ? tierAfter : null
  } else {
    toast.add({
      severity: 'success',
      summary: 'Actividad registrada',
      detail: `${badge.emoji} ${badge.name} · ${formatValue(badge)}`,
      life: 2600
    })
  }
}

function handleUndo() {
  const entry = undoLast()
  if (!entry) return
  toast.add({
    severity: 'info',
    summary: 'Registro deshecho',
    detail: `Se quitó ${entry.emoji} ${entry.name}`,
    life: 2400
  })
}

function handleSync() {
  const results = syncFromDevice()
  if (!results.length) {
    toast.add({ severity: 'info', summary: 'Todo al día', detail: 'No hay actividades nuevas.', life: 2400 })
    return
  }
  const unlocked = results.find((r) => r.unlocked)
  if (unlocked) {
    unlockedBadge.value = unlocked.badge
    unlockedTier.value = null
  } else {
    toast.add({
      severity: 'success',
      summary: 'Reloj sincronizado',
      detail: `Se importaron ${results.length} actividades.`,
      life: 2800
    })
  }
}

function handleReset() {
  confirm.require({
    header: 'Reiniciar el mes',
    message: 'Se borrarán todos tus registros de este mes. Esta acción no se puede deshacer.',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, reiniciar',
    rejectLabel: 'Cancelar',
    acceptProps: { severity: 'danger', rounded: true },
    rejectProps: { severity: 'secondary', text: true, rounded: true },
    accept: () => {
      resetAll()
      toast.add({ severity: 'info', summary: 'Mes reiniciado', detail: 'Empiezas de cero.', life: 2400 })
    }
  })
}

function closeUnlocked() {
  unlockedBadge.value = null
  unlockedTier.value = null
}
</script>

<template>
  <div class="act-shell">
    <AppHeader
      :challenge="challenge"
      :parts="parts"
      :month-progress="monthProgress"
      :finished="finished"
    />

    <RunnerCard
      :runner="runner"
      :completed="allCompleted"
      :total="totalBadges"
      :ratio="overallRatio"
      :tier="currentTier"
      :next-tier="nextTier"
      @update:name="runner.name = $event"
    />

    <Tabs value="reto" class="act-tabs">
      <TabList>
        <Tab value="reto"><i class="pi pi-bolt" /> Mi reto</Tab>
        <Tab value="actividad"><i class="pi pi-history" /> Actividad</Tab>
        <Tab value="reglas"><i class="pi pi-book" /> Reglas</Tab>
      </TabList>

      <TabPanels>
        <!-- ── MI RETO ── -->
        <TabPanel value="reto">
          <TierTrack
            :tiers="tiers"
            :completed="allCompleted"
            :total="totalBadges"
            :current-tier="currentTier"
          />

          <StatsRow :stats="stats" />

          <SyncCard @sync="handleSync" />

          <BadgeGrid
            :badges="badges"
            :ratio-fn="ratio"
            :label-fn="formatValue"
            :done-fn="isDone"
            @log="openLog"
            @info="openInfo"
          />
        </TabPanel>

        <!-- ── ACTIVIDAD ── -->
        <TabPanel value="actividad">
          <StatsRow :stats="stats" />
          <ActivityTimeline :history="history" @undo="handleUndo" />
        </TabPanel>

        <!-- ── REGLAS ── -->
        <TabPanel value="reglas">
          <RulesPanel :tiers="tiers" :challenge="challenge" @reset="handleReset" />
        </TabPanel>
      </TabPanels>
    </Tabs>

    <footer class="act-footer">
      <span>ActiVida · Aguascalientes</span>
      <span class="act-footer__dot">·</span>
      <span>Reto {{ challenge.month }} {{ challenge.year }}</span>
    </footer>

    <!-- Diálogos -->
    <LogActivityDialog
      v-model:visible="logVisible"
      :badge="selectedBadge"
      :current="selectedCurrent"
      @submit="handleSubmit"
    />

    <BadgeInfoDialog
      v-model:visible="infoVisible"
      :badge="selectedBadge"
      @log="openLog"
    />

    <BadgeUnlockedOverlay :badge="unlockedBadge" :tier="unlockedTier" @close="closeUnlocked" />

    <Toast position="top-center" />
    <ConfirmDialog :draggable="false" :style="{ width: '340px' }" />
  </div>
</template>

<style scoped>
.act-tabs {
  margin-top: 0.25rem;
}

.act-tabs :deep(.p-tablist) {
  padding: 0 1rem;
  border-bottom: 1px solid var(--act-border);
  background: transparent;
}

.act-tabs :deep(.p-tablist-tab-list) {
  background: transparent;
  border: none;
  gap: 0.25rem;
}

.act-tabs :deep(.p-tab) {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  padding: 0.7rem 0.85rem;
  border-width: 0 0 2px 0;
  background: transparent;
  color: var(--act-text-3);
}

.act-tabs :deep(.p-tab .pi) {
  font-size: 0.8rem;
}

.act-tabs :deep(.p-tab:hover) {
  color: var(--act-text);
}

.act-tabs :deep(.p-tab-active) {
  color: var(--act-green-strong);
}

:global(.activida-dark) .act-tabs :deep(.p-tab-active) {
  color: var(--act-green);
}

.act-tabs :deep(.p-tabpanels) {
  background: transparent;
  padding: 0.25rem 0 0;
}

.act-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 2rem;
  padding: 1.25rem 1rem;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--act-text-3);
  border-top: 1px solid var(--act-border);
}

.act-footer__dot {
  opacity: 0.5;
}
</style>
