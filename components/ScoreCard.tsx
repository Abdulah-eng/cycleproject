import { getRatingColor } from '@/lib/utils'

interface ScoreCardProps {
  label: string
  score: number
  maxScore: number
  description: string
  variant?: 'primary' | 'inline' | 'default'
}

export default function ScoreCard({ label, score, maxScore, description, variant = 'default' }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100
  const color = getRatingColor(score)

  if (variant === 'primary') {
    return (
      <div className="bg-teal-700 text-white rounded-lg p-5 shadow-sm">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
          <span className="text-3xl font-bold">{score.toFixed(1)}</span>
        </div>
        <div className="h-2 bg-teal-900 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: '#fbbf24' }}
          />
        </div>
        <span className="text-xs text-teal-100">{description}</span>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-800">{label}</span>
          <span className="text-2xl font-bold text-gray-900">{score.toFixed(1)}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs text-gray-600">{description}</span>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{label}</span>
        <span className="text-3xl font-bold text-gray-900">{score.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs text-gray-600">{description}</span>
    </div>
  )
}
