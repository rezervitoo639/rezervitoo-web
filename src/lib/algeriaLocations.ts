import citiesData from "@/assets/algeria_cities.json";

export interface CityEntry {
  id: number;
  commune_name_ascii: string;
  commune_name: string;
  daira_name_ascii: string;
  daira_name: string;
  wilaya_code: string;
  wilaya_name_ascii: string;
  wilaya_name: string;
}

const cities = citiesData as CityEntry[];

export interface Wilaya {
  code: string;
  nameAscii: string;
  nameAr: string;
}

let _wilayas: Wilaya[] | null = null;

export function getWilayas(): Wilaya[] {
  if (_wilayas) return _wilayas;
  const map = new Map<string, Wilaya>();
  for (const c of cities) {
    if (!map.has(c.wilaya_code)) {
      map.set(c.wilaya_code, {
        code: c.wilaya_code,
        nameAscii: c.wilaya_name_ascii,
        nameAr: c.wilaya_name,
      });
    }
  }
  _wilayas = Array.from(map.values()).sort((a, b) => Number(a.code) - Number(b.code));
  return _wilayas;
}

export function getCommunes(wilayaCode: string): { nameAscii: string; nameAr: string }[] {
  const communes = cities
    .filter((c) => c.wilaya_code === wilayaCode)
    .map((c) => ({ nameAscii: c.commune_name_ascii, nameAr: c.commune_name }));
  // deduplicate
  const seen = new Set<string>();
  return communes.filter((c) => {
    if (seen.has(c.nameAscii)) return false;
    seen.add(c.nameAscii);
    return true;
  }).sort((a, b) => a.nameAscii.localeCompare(b.nameAscii));
}

/** Top wilayas for the popular locations section */
export const POPULAR_WILAYAS = ["16", "31", "25", "06", "09", "19"];
