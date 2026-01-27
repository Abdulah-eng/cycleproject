'use client'

import { useState, ReactNode, Children, cloneElement, isValidElement } from 'react'

interface ScoreSectionWithToggleProps {
  title: string
  subtitle?: string
  children: ReactNode
  gridCols?: string
}

export default function ScoreSectionWithToggle({ title, subtitle, children, gridCols = 'grid-cols-3' }: ScoreSectionWithToggleProps) {
  const [showAllExplanations, setShowAllExplanations] = useState(false)

  // Clone children and pass expanded state to ScoreCard components
  const clonedChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return cloneElement(child as React.ReactElement<any>, {
        isExpanded: showAllExplanations,
        onToggle: () => setShowAllExplanations(!showAllExplanations)
      })
    }
    return child
  })

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        <button
          onClick={() => setShowAllExplanations(!showAllExplanations)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          {showAllExplanations ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Hide Explanations
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show Explanations
            </>
          )}
        </button>
      </div>
      <div className={`grid ${gridCols} gap-4`}>
        {clonedChildren}
      </div>
    </div>
  )
}
