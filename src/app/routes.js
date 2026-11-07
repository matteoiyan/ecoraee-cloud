export function routeFromHash(hash = window.location.hash) {
  return hash.replace(/^#\/?/, '') || 'panel';
}

export function resourceReferences(resource) {
  return [...new Set((resource?.fields ?? []).filter((field) => field.type === 'ref').map((field) => field.ref))];
}
