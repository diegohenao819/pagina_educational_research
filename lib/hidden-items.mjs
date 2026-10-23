/**
 * Columnas del Excel que no son parte del avance del estudiante.
 *
 * Siguen en el Excel (y en la base, si ya se habían importado), pero no se
 * muestran en la página ni en el panel, y no cuentan para el total.
 * Se comparan sin tildes ni mayúsculas.
 */

// Fases completas que no se muestran
const HIDDEN_PHASES = ["fase 5"];

// Ítems sueltos que no se muestran, en cualquier fase
const HIDDEN_ITEMS = ["webinar", "epica", "forum phase 3", "forum fase 4"];

const slug = (s) =>
  String(s ?? "").toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, " ").trim();

/**
 * @param {string} phase
 * @param {string} label
 * @returns {boolean}
 */
export const isHiddenItem = (phase, label) =>
  HIDDEN_PHASES.includes(slug(phase)) || HIDDEN_ITEMS.includes(slug(label));
