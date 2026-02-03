'use client'

import { usePathname, useRouter, useParams } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

export default function LanguageSwitcher() {
    const pathname = usePathname()
    const router = useRouter()
    const params = useParams()

    // Robustly determine current language purely for display logic
    const getLangFromPath = () => {
        // Try params first
        if (params?.lang) return params.lang as string
        // Fallback to pathname segment
        const segment = pathname?.split('/')?.[1]
        const validLangs = ['en', 'de', 'fr', 'es', 'it', 'nl']
        return validLangs.includes(segment) ? segment : 'en'
    }
    const currentLang = getLangFromPath()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', label: 'Français', flag: '🇫🇷' },
        { code: 'it', label: 'Italiano', flag: '🇮🇹' },
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    ]

    const handleLanguageChange = (langCode: string) => {
        const segments = pathname.split('/')
        // segments[0] is empty string (before first /), segments[1] is the locale
        if (segments.length > 1) {
            segments[1] = langCode
            const newPathname = segments.join('/')
            router.push(newPathname)
        } else {
            // Fallback for root or weird paths
            router.push(`/${langCode}`)
        }
        setIsOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentLanguage = languages.find(l => l.code === currentLang) || languages[0]

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50 bg-white border border-gray-200"
            >
                <span className="text-lg leading-none">{currentLanguage.flag}</span>
                <span className="hidden lg:block">{currentLanguage.label}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    {languages.map((language) => (
                        <button
                            key={language.code}
                            onClick={() => handleLanguageChange(language.code)}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${currentLang === language.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                                }`}
                        >
                            <span className="text-lg leading-none">{language.flag}</span>
                            {language.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
