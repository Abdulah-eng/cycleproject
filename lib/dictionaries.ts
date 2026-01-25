
const dictionaries = {
    en: () => import('@/dictionaries/en.json').then((module) => module.default),
    de: () => import('@/dictionaries/de.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const getDictionary = async (locale: string) => {
    if (!dictionaries[locale as Locale]) {
        return dictionaries.en()
    }
    return dictionaries[locale as Locale]()
}
