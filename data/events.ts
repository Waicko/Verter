export type EventType = "race" | "camp";

export interface Event {
  id: string;
  slug: string;
  name: string;
  country: string;
  date: string;
  type: EventType;
  distance_or_format: string;
  difficulty_1_5: number;
  vert_m: number;
  fun_factor_1_5: number;
  description?: string;
  /** Recurring events (parkrun, weekly runs) - no single date */
  recurring?: boolean;
  /** Camp focus area (e.g. "Trail intro", "Winter running") */
  focus?: string;
}

export const events: Event[] = [
  {
    id: "1",
    slug: "nuuksio-trail-race",
    name: "Nuuksio Trail Race",
    country: "Finland",
    date: "2025-05-17",
    type: "race",
    distance_or_format: "25 km",
    difficulty_1_5: 3,
    vert_m: 850,
    fun_factor_1_5: 5,
    description:
      "Classic trail race through Nuuksio National Park. Technical forest trails with stunning lake views.",
  },
  {
    id: "2",
    slug: "lapland-ultra-camp",
    name: "Lapland Ultra Camp",
    country: "Finland",
    date: "2025-06-20",
    type: "camp",
    distance_or_format: "5-day camp",
    difficulty_1_5: 4,
    vert_m: 2500,
    fun_factor_1_5: 5,
    description:
      "Five days of guided running in Lapland fells. Learn navigation, nutrition, and recovery.",
    focus: "Ultra & navigation",
  },
  {
    id: "3",
    slug: "helsinki-half-marathon",
    name: "Helsinki Half Marathon",
    country: "Finland",
    date: "2025-09-07",
    type: "race",
    distance_or_format: "21.1 km",
    difficulty_1_5: 1,
    vert_m: 120,
    fun_factor_1_5: 4,
    description:
      "Urban half marathon through Helsinki city center. Flat and fast course.",
  },
  {
    id: "4",
    slug: "koli-mountain-camp",
    name: "Koli Mountain Camp",
    country: "Finland",
    date: "2025-07-12",
    type: "camp",
    distance_or_format: "3-day weekend",
    difficulty_1_5: 3,
    vert_m: 1800,
    fun_factor_1_5: 5,
    description:
      "Weekend camp in Koli National Park. Hill repeats and technique workshops.",
    focus: "Hills & technique",
  },
  {
    id: "5",
    slug: "pyha-fell-race",
    name: "Pyhä Fell Race",
    country: "Finland",
    date: "2025-08-02",
    type: "race",
    distance_or_format: "42 km",
    difficulty_1_5: 4,
    vert_m: 1400,
    fun_factor_1_5: 5,
    description:
      "Mountain marathon in Pyhä-Luosto. Exposed ridges and technical descents.",
  },
  {
    id: "6",
    slug: "tampere-trail-camp",
    name: "Tampere Trail Camp",
    country: "Finland",
    date: "2025-06-06",
    type: "camp",
    distance_or_format: "2-day intro",
    difficulty_1_5: 2,
    vert_m: 600,
    fun_factor_1_5: 4,
    description:
      "Introduction to trail running. Perfect for road runners curious about trails.",
    focus: "Trail intro",
  },
  {
    id: "7",
    slug: "oulanka-canyon-race",
    name: "Oulanka Canyon Race",
    country: "Finland",
    date: "2025-07-26",
    type: "race",
    distance_or_format: "55 km",
    difficulty_1_5: 4,
    vert_m: 900,
    fun_factor_1_5: 5,
    description:
      "Ultra through Oulanka National Park. Part of the famous Karhunkierros route.",
  },
  {
    id: "8",
    slug: "winter-running-camp",
    name: "Winter Running Camp",
    country: "Finland",
    date: "2026-02-14",
    type: "camp",
    distance_or_format: "4-day winter",
    difficulty_1_5: 3,
    vert_m: 1200,
    fun_factor_1_5: 5,
    description:
      "Learn to run in snow and ice. Gear, technique, and safety for winter trails.",
    focus: "Winter running",
  },
  {
    id: "9",
    slug: "tampere-parkrun",
    name: "Tampere parkrun",
    country: "Finland",
    date: "",
    type: "race",
    distance_or_format: "5 km",
    difficulty_1_5: 1,
    vert_m: 30,
    fun_factor_1_5: 5,
    description:
      "Free weekly 5k run every Saturday at 9:00. Timed, beginner-friendly.",
    recurring: true,
  },
  {
    id: "10",
    slug: "helsinki-central-park-saturday",
    name: "Central Park Saturday Group Run",
    country: "Finland",
    date: "",
    type: "race",
    distance_or_format: "10–15 km",
    difficulty_1_5: 2,
    vert_m: 100,
    fun_factor_1_5: 4,
    description:
      "Weekly social trail run. Distance varies. Meet at 8:00 at Paloheinä.",
    recurring: true,
  },
];
