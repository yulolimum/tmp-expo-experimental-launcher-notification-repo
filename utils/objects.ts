export function getObjPath<T = any>(obj: unknown, path: string): T | undefined {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce((acc, key) => (acc && typeof acc === "object" ? (acc as any)[key] : undefined), obj) as T | undefined
}

export function isObjEmpty(obj: unknown): boolean {
  return obj === null || obj === undefined || (typeof obj === "object" && Object.keys(obj).length === 0)
}

export function getObjectKeys<Obj extends object>(obj: Obj): (keyof Obj)[] {
  return Object.keys(obj) as (keyof Obj)[]
}

export function getObjectValues<Obj extends object>(obj: Obj): Obj[keyof Obj][] {
  return Object.values(obj) as Obj[keyof Obj][]
}

export function getObjectEntries<Obj extends object>(obj: Obj): [keyof Obj, Obj[keyof Obj]][] {
  return Object.entries(obj) as [keyof Obj, Obj[keyof Obj]][]
}
