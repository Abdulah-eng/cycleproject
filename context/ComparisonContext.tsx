'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface ComparisonBike {
    id: number
    brand: string
    model: string
    year: number | null
    image: string | null
    category: string
    sub_category?: string | null
    price: number | null
    slug: string
}

interface ComparisonContextType {
    selectedBikes: ComparisonBike[]
    addToCompare: (bike: ComparisonBike) => void
    removeFromCompare: (bikeId: number) => void
    isInCompare: (bikeId: number) => boolean
    clearCompare: () => void
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
    const [selectedBikes, setSelectedBikes] = useState<ComparisonBike[]>([])

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('bike_comparison_list')
        if (saved) {
            try {
                setSelectedBikes(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse comparison list', e)
            }
        }
    }, [])

    // Save to localStorage whenever list changes
    useEffect(() => {
        localStorage.setItem('bike_comparison_list', JSON.stringify(selectedBikes))
    }, [selectedBikes])

    const addToCompare = (bike: ComparisonBike) => {
        if (selectedBikes.length >= 4) {
            alert('You can only compare up to 4 bikes at a time.')
            return
        }
        if (!isInCompare(bike.id)) {
            setSelectedBikes([...selectedBikes, bike])
        }
    }

    const removeFromCompare = (bikeId: number) => {
        setSelectedBikes(selectedBikes.filter(b => b.id !== bikeId))
    }

    const isInCompare = (bikeId: number) => {
        return selectedBikes.some(b => b.id === bikeId)
    }

    const clearCompare = () => {
        setSelectedBikes([])
    }

    return (
        <ComparisonContext.Provider value={{ selectedBikes, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
            {children}
        </ComparisonContext.Provider>
    )
}

export function useComparison() {
    const context = useContext(ComparisonContext)
    if (context === undefined) {
        throw new Error('useComparison must be used within a ComparisonProvider')
    }
    return context
}
