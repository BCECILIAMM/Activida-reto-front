/**
 * Resultados oficiales de cada reto, por código de reto (`reto.codigo`).
 *
 * Se llenan a mano al cerrar el mes. El podio lo decide la organización con
 * los datos limpios del panel del coach, no el ranking en vivo: así nadie ve
 * un lugar que después cambia por un registro tardío o una corrección.
 *
 * Mientras un reto no tenga entrada aquí, la app no anuncia resultados
 * aunque el mes ya haya terminado.
 *
 *  - imagen: ruta dentro de public/ (la que se comparte en redes)
 *  - podio:  dorsales en orden → 1.er, 2.º y 3.er lugar
 *
 * Ejemplo:
 *   '2026-09': {
 *     imagen: 'resultados/reto-2026-09.jpg',
 *     podio: ['108', '118', '133']
 *   }
 */
export const RESULTADOS = {}

export const LUGARES = ['1.er lugar', '2.º lugar', '3.er lugar']
