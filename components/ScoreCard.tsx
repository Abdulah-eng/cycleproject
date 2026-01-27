'use client'

import { useState } from 'react'
import { getRatingColor } from '@/lib/utils'

interface ScoreCardProps {
  label: string
  score: number
  maxScore: number
  description: string
  variant?: 'primary' | 'inline' | 'default'
  explanation?: string | null
  isExpanded?: boolean
  onToggle?: () => void
  metricType?: 'value' | 'performance' | 'fit' | 'general' | 'default'
}

export default function ScoreCard({ label, score, maxScore, description, variant = 'default', explanation, isExpanded: externalIsExpanded, onToggle, metricType = 'default' }: ScoreCardProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false)

  // Use external state if provided, otherwise use internal state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsExpanded(!internalIsExpanded)
    }
  }
  const percentage = (score / maxScore) * 100
  const color = getRatingColor(score, metricType)

  if (variant === 'primary') {
    return (
      <div
        className={`bg-white border-2 border-gray-200 text-gray-900 rounded-lg p-5 shadow-sm transition-all ${explanation ? 'cursor-pointer hover:shadow-lg' : ''}`}
        onClick={() => explanation && handleToggle()}
      >
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-gray-700">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">{score.toFixed(1)}</span>
            {explanation && (
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs text-gray-600">{description}</span>

        {explanation && isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div
        className={`bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${explanation ? 'cursor-pointer' : ''}`}
        onClick={() => explanation && handleToggle()}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">{score.toFixed(1)}</span>
            {explanation && (
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs text-gray-600">{description}</span>

        {explanation && isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all ${explanation ? 'cursor-pointer' : ''}`}
      onClick={() => explanation && handleToggle()}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-gray-900">{score.toFixed(1)}</span>
          {explanation && (
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-600">{description}</span>

      {explanation && isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  )
}
