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