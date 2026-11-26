export const tableCache = new Map()
export let cacheGeneration = 0

export function clearTableCache() {
  tableCache.clear()
  cacheGeneration += 1
}
