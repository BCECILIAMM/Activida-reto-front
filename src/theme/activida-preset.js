import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'

/**
 * Preset de PrimeVue con la identidad de ActiVida.
 * Color de marca: #2ee56f (verde neón) — tomado de miactivida.com
 *
 * Se define una escala completa 50→950 para que PrimeVue pueda generar
 * estados hover/active/focus coherentes en modo claro y oscuro.
 */
const ActividaPreset = definePreset(Aura, {
  primitive: {
    // Escala construida alrededor de #2ee56f
    activida: {
      50: '#eafdf1',
      100: '#c9f9dc',
      200: '#96f2bd',
      300: '#5cea9a',
      400: '#2ee56f',
      500: '#16c95a',
      600: '#0aa447',
      700: '#0b813a',
      800: '#0d6631',
      900: '#0c542a',
      950: '#022f16'
    }
  },

  semantic: {
    primary: {
      50: '{activida.50}',
      100: '{activida.100}',
      200: '{activida.200}',
      300: '{activida.300}',
      400: '{activida.400}',
      500: '{activida.500}',
      600: '{activida.600}',
      700: '{activida.700}',
      800: '{activida.800}',
      900: '{activida.900}',
      950: '{activida.950}'
    },

    // Radios más suaves, estilo app deportiva
    borderRadius: {
      none: '0',
      xs: '4px',
      sm: '8px',
      md: '12px',
      lg: '16px',
      xl: '22px'
    },

    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.color}',
      offset: '2px'
    },

    colorScheme: {
      light: {
        primary: {
          color: '{activida.600}',
          contrastColor: '#ffffff',
          hoverColor: '{activida.700}',
          activeColor: '{activida.800}'
        },
        highlight: {
          background: '{activida.50}',
          focusBackground: '{activida.100}',
          color: '{activida.800}',
          focusColor: '{activida.900}'
        },
        surface: {
          0: '#ffffff',
          50: '#f6faf7',
          100: '#eaf3ec',
          200: '#d7e7db',
          300: '#b8d2be',
          400: '#8fb497',
          500: '#6b9174',
          600: '#52735a',
          700: '#425c48',
          800: '#36493a',
          900: '#2c3b2f',
          950: '#16201a'
        }
      },

      dark: {
        primary: {
          color: '{activida.400}',
          contrastColor: '#08120c',
          hoverColor: '{activida.300}',
          activeColor: '{activida.200}'
        },
        highlight: {
          background: 'rgba(46, 229, 111, 0.14)',
          focusBackground: 'rgba(46, 229, 111, 0.22)',
          color: '{activida.200}',
          focusColor: '{activida.100}'
        },
        surface: {
          0: '#ffffff',
          50: '#eefaf1',
          100: '#c9e6d1',
          200: '#a3cfae',
          300: '#7fae8b',
          400: '#5c8868',
          500: '#41654c',
          600: '#2f4c38',
          700: '#22392a',
          800: '#182a1e',
          900: '#111b14',
          950: '#0a0f0b'
        }
      }
    }
  },

  components: {
    button: {
      root: {
        paddingX: '1rem',
        paddingY: '0.6rem',
        gap: '0.5rem',
        roundedBorderRadius: '999px',
        label: { fontWeight: '700' }
      }
    },
    dialog: {
      root: { borderRadius: '22px' }
    },
    card: {
      root: { borderRadius: '18px', shadow: 'none' },
      body: { padding: '1rem' }
    },
    progressbar: {
      root: { height: '0.55rem', borderRadius: '999px' },
      value: { background: '{primary.color}' }
    },
    tag: {
      root: { fontWeight: '700', borderRadius: '999px', padding: '0.25rem 0.7rem' }
    },
    inputtext: {
      root: { borderRadius: '12px', paddingY: '0.7rem' }
    },
    textarea: {
      root: { borderRadius: '12px' }
    },
    selectbutton: {
      root: { borderRadius: '999px' }
    },
    tabs: {
      tab: { fontWeight: '700' },
      tablist: { background: 'transparent' },
      tabpanel: { background: 'transparent', padding: '0' }
    },
    timeline: {
      eventMarker: {
        size: '1.4rem',
        borderRadius: '50%',
        borderWidth: '2px'
      }
    },
    toast: {
      root: { borderRadius: '14px' }
    }
  }
})

export default ActividaPreset
