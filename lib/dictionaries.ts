
const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    de: () => import('@/dictionaries/de.json').then((module) => module.default),
    fr: () => import('@/dictionaries/fr.json').then((module) => module.default),
    es: () => import('@/dictionaries/es.json').then((module) => module.default),
    it: () => import('@/dictionaries/it.json').then((module) => module.default),
    nl: () => import('@/dictionaries/nl.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const getDictionary = async (locale: string) => {
    if (!dictionaries[locale as Locale]) {
        return dictionaries.en()
    }
    return dictionaries[locale as Locale]()
}
