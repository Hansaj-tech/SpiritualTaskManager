import type { ChaturmasReading, ChaturmasText } from '@/lib/chaturmas'

interface SeedText extends ChaturmasText {
  readings: ChaturmasReading[]
}

const TEXT_DEFS: Array<Omit<ChaturmasText, never>> = [
  {
    id: 'vachanamrut',
    name: 'Vachanamrut',
    nameGu: 'વચનામૃત',
    totalUnits: 273,
    order: 1,
    taskListMatch: 'Vachnamrut Vanchan',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'swaminiVato',
    name: 'Swamini Vato',
    nameGu: 'સ્વામીની વાતો',
    totalUnits: 120,
    order: 2,
    taskListMatch: 'Swamini Vato Nu Vanchan',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'sadgunaNaSindhu',
    name: 'Sadguna Na Sindhu',
    nameGu: 'સદ્ગુણના સિંધુ',
    totalUnits: 120,
    order: 3,
    taskListMatch: null,
    gradient: 'from-red-500 to-pink-500',
  },
  {
    id: 'jivanCharitra12',
    name: 'Jivan Charitra (Part 12)',
    nameGu: 'જીવન ચરિત્ર (ભાગ ૧૨)',
    totalUnits: 120,
    order: 4,
    taskListMatch: null,
    gradient: 'from-pink-500 to-purple-500',
  },
]

// Sample days only — this is placeholder content, not real scripture text.
// Real content should be entered via the /chaturmas/admin editor.
const SAMPLE_DAYS = [1, 2, 3]

function placeholderReading(textId: string, textName: string, day: number): ChaturmasReading {
  return {
    day,
    textId,
    unitLabel: { en: `${textName} — Day ${day}`, gu: `${textName} — દિવસ ${day}` },
    original: {
      en: `[Sample placeholder] The original ${textName} passage for day ${day} will appear here once entered by an admin.`,
      gu: `[નમૂનારૂપ સ્થાનધારક] ${textName} નો દિવસ ${day} નો મૂળ પાઠ ઍડમિન દ્વારા ઉમેરાયા બાદ અહીં દેખાશે.`,
    },
    keyTeaching: {
      en: `[Sample placeholder] Key teaching summary for day ${day}.`,
      gu: `[નમૂનારૂપ સ્થાનધારક] દિવસ ${day} નો મુખ્ય બોધ.`,
    },
    memorablePassage: {
      en: `[Sample placeholder] A short memorable line for day ${day}.`,
      gu: `[નમૂનારૂપ સ્થાનધારક] દિવસ ${day} ની યાદગાર પંક્તિ.`,
    },
    storyCard: {
      title: { en: `${textName}, Day ${day}`, gu: `${textName}, દિવસ ${day}` },
      summary: {
        en: `[Sample placeholder] An illustrated retelling of day ${day}'s reading will appear here.`,
        gu: `[નમૂનારૂપ સ્થાનધારક] દિવસ ${day} ના વાંચનની ચિત્રાત્મક વાર્તા અહીં આવશે.`,
      },
      imageUrl: '/placeholder.svg',
    },
  }
}

const now = new Date()

export const chaturmasSeed = {
  config: {
    year: now.getFullYear(),
    // Placeholder season window — replace with the real Chaturmas dates for the year.
    startDate: new Date(now.getFullYear(), 6, 1),
    endDate: new Date(now.getFullYear(), 9, 29),
    totalDays: 120,
  },
  texts: TEXT_DEFS.map((def) => ({
    ...def,
    readings: SAMPLE_DAYS.map((day) => placeholderReading(def.id, def.name, day)),
  })) as SeedText[],
}
