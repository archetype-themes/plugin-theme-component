export type DeepObject = {
  [key: string]: DeepObject | boolean | null | number | string
}

export function deepMerge(target: DeepObject, source: DeepObject): DeepObject {
  for (const key in source) {
    if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
      deepMerge(target[key] as DeepObject, source[key] as DeepObject)
    } else {
      target[key] = source[key]
    }
  }

  return target
} 