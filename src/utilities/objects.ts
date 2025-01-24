export type DeepObject = {
  [key: string]: DeepObject | boolean | null | number | string
}

export function deepMerge(target: DeepObject, source: DeepObject): DeepObject {
  for (const key in source) {
    if (!Object.hasOwn(source, key) || key === "__proto__" || key === "constructor") continue;
    if (source[key] instanceof Object && Object.hasOwn(target, key) && target[key] instanceof Object) {
      deepMerge(target[key] as DeepObject, source[key] as DeepObject)
    } else {
      target[key] = source[key]
    }
  }

  return target
}

export function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey))
    } else {
      result[newKey] = value
    }
  }

  return result
}

export function unflattenObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.')
    let current = result

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      current[part] = current[part] || {}
      current = current[part] as Record<string, unknown>
    }

    current[parts.at(-1)!] = value
  }

  return result
}
