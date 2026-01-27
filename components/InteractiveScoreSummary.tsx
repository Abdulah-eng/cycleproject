'use client'

import { useState } from 'react'
import ScoreCard from './ScoreCard'

interface InteractiveScoreSummaryProps {
    metrics: any
    bike: any
}

export default function InteractiveScoreSummary({ metrics, bike }: InteractiveScoreSummaryProps) {
    const [showAllExplanations, setShowAllExplanations] = useState(false)

    return (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Score Summary</h2>
                <button
                    onClick={() => setShowAllExplanations(!showAllExplanations)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                    {showAllExplanations ? 'Hide Explanations' : 'Show Explanations'}
                </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard
                    label={metrics.performance.label}
                    score={metrics.performance.score}
                    maxScore={metrics.performance.maxScore}
                    description={metrics.performance.description}
                    variant="primary"
                    metricType="performance"
                    explanation={bike.performance_score_explanation}
                    isExpanded={showAllExplanations}
                />
                <ScoreCard
                    label={metrics.value.label}
                    score={metrics.value.score}
                    maxScore={metrics.value.maxScore}
                    description={metrics.value.description}
                    metricType="value"
                    explanation={bike.vfm_reason || bike.value_score_explanation}
                    isExpanded={showAllExplanations}
                />
                <ScoreCard
                    label={metrics.fit.label}
                    score={metrics.fit.score}
                    maxScore={metrics.fit.maxScore}
                    description={metrics.fit.description}
                    metricType="fit"
                    explanation={bike.fit_reason || bike.fit_score_explanation}
                    isExpanded={showAllExplanations}
                />
                <ScoreCard
                    label={metrics.general.label}
                    score={metrics.general.score}
                    maxScore={metrics.general.maxScore}
                    description={metrics.general.description}
                    metricType="general"
                    explanation={bike.general_score_explanation}
                    isExpanded={showAllExplanations}
                />
            </div>
        </div>
    )
}
