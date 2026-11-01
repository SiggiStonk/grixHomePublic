export const STORAGE_KEY = 'grix-home-design-v1';
export const SAVED_KEY = 'grix-home-shortlist-v1';
export const emptyDesign = () => Array(6).fill(null);
export function normalizeHex(value) {
  const text = String(value).trim();
  return /^#?[0-9a-f]{6}$/i.test(text) ? '#' + text.replace('#', '').toUpperCase() : null;
}
export function validateDesign(input) {
  if (!Array.isArray(input) || input.length !== 6) return null;
  const result = [];
  for (const shade of input) {
    if (shade === null) { result.push(null); continue; }
    if (!shade || typeof shade !== 'object' || !normalizeHex(shade.hex)) return null;
    const clean = { hex: normalizeHex(shade.hex), name: String(shade.name || 'Custom color').slice(0, 100), collection: String(shade.collection || 'Free palette').slice(0, 60) };
    if (typeof shade.source === 'string') {
      try { const url = new URL(shade.source); if (url.protocol === 'https:' && url.hostname === 'gima-profi.de') clean.source = url.href; } catch { /* No untrusted links. */ }
    }
    if (typeof shade.hbw === 'string') clean.hbw = shade.hbw.slice(0, 12);
    if (typeof shade.priceGroup === 'string') clean.priceGroup = shade.priceGroup.slice(0, 8);
    result.push(clean);
  }
  return result;
}
export function encodeDesign(design) { return '#design=' + encodeURIComponent(JSON.stringify(design)); }
export function decodeDesign(hash) {
  if (!hash.startsWith('#design=') || hash.length > 15000) return null;
  try { return validateDesign(JSON.parse(decodeURIComponent(hash.slice(8)))); } catch { return null; }
}
export const freeColors = [
  ['Chalk', '#F2EFE6'], ['Linen', '#E6DED0'], ['Oat', '#D4C7B3'], ['Sandstone', '#BEAA91'], ['Clay', '#AF8B74'],
  ['Mist', '#DDE1DC'], ['Sage', '#B7C0AA'], ['Olive', '#8E997C'], ['Moss', '#69765C'], ['Forest', '#3D5547'],
  ['Shell', '#E7D9D1'], ['Rose clay', '#CAA49A'], ['Terracotta', '#B77B62'], ['Cocoa', '#876D5E'], ['Umber', '#5F534B'],
  ['Pearl', '#D7D7D1'], ['Pebble', '#B8B8AE'], ['Stone', '#93968E'], ['Slate', '#666E6D'], ['Charcoal', '#3F4647'],
  ['Cloud', '#DBE1E3'], ['Coastal', '#B3C4CA'], ['Blue grey', '#8B9FA6'], ['Storm', '#677F8B'], ['Midnight', '#3D5361'],
].map(([name, hex]) => ({ name, hex, collection: 'Free palette' }));
