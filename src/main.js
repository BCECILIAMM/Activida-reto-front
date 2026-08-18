import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

import ActividaPreset from './theme/activida-preset.js'

import 'primeicons/primeicons.css'
import './assets/styles.css'

import App from './App.vue'

const app = createApp(App)

app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: ActividaPreset,
    options: {
      // El modo oscuro se activa añadiendo .activida-dark al <html>
      darkModeSelector: '.activida-dark',
      cssLayer: false
    }
  },
  locale: {
    accept: 'Sí',
    reject: 'No',
    choose: 'Elegir',
    upload: 'Subir',
    cancel: 'Cancelar',
    emptyMessage: 'Sin resultados'
  }
})

app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)

app.mount('#app')
