/**
 * Shared filter engine for Verter list pages.
 * Parses URL params, applies filters, and sorts data.
 */

export type FilterKind = "select" | "range" | "boolean";

export interface FilterSelectConfig {
  kind: "select";
  param: string;
  multi?: boolean;
  options: { value: string; label: string }[];
}

export interface FilterRangeConfig {
  kind: "range";
  paramMin: string;
  paramMax: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface FilterBooleanConfig {
  kind: "boolean";
  param: string;
  label: string;
}

export type FilterConfig =
  | FilterSelectConfig
  | FilterRangeConfig
  | FilterBooleanConfig;

export interface SortConfig {
  param: string;
  options: { value: string; label: string }[];
  default: string;
}

export interface FilterPreset<T> {
  filters: FilterConfig[];
  sort: SortConfig;
  parseParams: (params: URLSearchParams) => Record<string, unknown>;
  toParams: (state: Record<string, unknown>) => URLSearchParams;
  apply: (items: T[], state: Record<string, unknown>) => T[];
}

/** Parse select params (single or multi) */
export function parseSelectParam(
  params: URLSearchParams,
  param: string,
  multi: boolean
): string | string[] {
  if (multi) {
    return params.getAll(param).filter(Boolean);
  }
  const v = params.get(param);
  return v ?? "";
}

/** Parse range params */
export function parseRangeParam(
  params: URLSearchParams,
  paramMin: string,
  paramMax: string
): { min?: number; max?: number } {
  const minRaw = params.get(paramMin);
  const maxRaw = params.get(paramMax);
  const min = minRaw != null ? parseFloat(minRaw) : undefined;
  const max = maxRaw != null ? parseFloat(maxRaw) : undefined;
  return {
    min: typeof min === "number" && !Number.isNaN(min) ? min : undefined,
    max: typeof max === "number" && !Number.isNaN(max) ? max : undefined,
  };
}

/** Parse boolean param */
export function parseBooleanParam(
  params: URLSearchParams,
  param: string
): boolean {
  return params.get(param) === "1" || params.get(param) === "true";
}

/** Parse sort param */
export function parseSortParam(
  params: URLSearchParams,
  sortConfig: SortConfig
): string {
  const v = params.get(sortConfig.param);
  const valid = sortConfig.options.some((o) => o.value === v);
  return valid ? v! : sortConfig.default;
}

/** Set select in URLSearchParams */
export function setSelectParam(
  params: URLSearchParams,
  param: string,
  value: string | string[],
  multi: boolean
): void {
  params.delete(param);
  if (multi && Array.isArray(value)) {
    value.filter(Boolean).forEach((v) => params.append(param, v));
  } else if (!multi && typeof value === "string" && value) {
    params.set(param, value);
  }
}

/** Set range in URLSearchParams */
export function setRangeParam(
  params: URLSearchParams,
  paramMin: string,
  paramMax: string,
  range: { min?: number; max?: number }
): void {
  params.delete(paramMin);
  params.delete(paramMax);
  if (range.min != null) params.set(paramMin, String(range.min));
  if (range.max != null) params.set(paramMax, String(range.max));
}

/** Set boolean in URLSearchParams */
export function setBooleanParam(
  params: URLSearchParams,
  param: string,
  value: boolean
): void {
  if (value) params.set(param, "1");
  else params.delete(param);
}

/** Set sort in URLSearchParams */
export function setSortParam(
  params: URLSearchParams,
  sortConfig: SortConfig,
  value: string
): void {
  if (value && value !== sortConfig.default) {
    params.set(sortConfig.param, value);
  } else {
    params.delete(sortConfig.param);
  }
}

/** Generic sort helper */
export function sortBy<T>(
  items: T[],
  key: keyof T | ((item: T) => unknown),
  order: "asc" | "desc" = "asc"
): T[] {
  const getter = typeof key === "function" ? key : (x: T) => x[key];
  return [...items].sort((a, b) => {
    const va = getter(a);
    const vb = getter(b);
    if (va == null && vb == null) return 0;
    if (va == null) return order === "asc" ? 1 : -1;
    if (vb == null) return order === "asc" ? -1 : 1;
    if (typeof va === "string" && typeof vb === "string") {
      return order === "asc"
        ? va.localeCompare(vb)
        : vb.localeCompare(va);
    }
    if (typeof va === "number" && typeof vb === "number") {
      return order === "asc" ? va - vb : vb - va;
    }
    const da = va instanceof Date ? va.getTime() : String(va);
    const db = vb instanceof Date ? vb.getTime() : String(vb);
    return order === "asc"
      ? (da as number) - (db as number)
      : (db as number) - (da as number);
  });
}
