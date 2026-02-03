'use client'

import { useState } from 'react'
import ScoreCard from './ScoreCard'

interface InteractiveScoreSummaryProps {
    metrics: any
    bike: any
}

export default function InteractiveScoreSummary({ metrics, bike }: InteractiveScoreSummaryProps) {
    return (
        <div className="mb-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Score Summary</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <ScoreCard
                    label={metrics.performance.label}
                    score={metrics.performance.score}
                    maxScore={metrics.performance.maxScore}
                    description={metrics.performance.description}
                    variant="primary"
                    metricType="performance"
                // Removed explanation and expansion logic as requested
                />
                <ScoreCard
                    label={metrics.value.label}
                    score={metrics.value.score}
                    maxScore={metrics.value.maxScore}
                    description={metrics.value.description}
                    metricType="value"
                    explanation={bike.value_score_explanation}
                    isExpanded={true} // Always show or never? "no drop down". If I say true it shows. If false it hides.
                // User said "Delete the reason part as well for performance." -> Implies strictly performance.
                // But "Summary section should not have a drop down." -> Implies for ALL.
                // If no dropdown, how do we see text? Always visible?
                // I will make them ALWAYS VISIBLE (isExpanded={true}) except performance (no explanation).
                />
                <ScoreCard
                    label={metrics.fit.label}
                    score={metrics.fit.score}
                    maxScore={metrics.fit.maxScore}
                    description={metrics.fit.description}
                    metricType="fit"
                    explanation={bike.fit_score_explanation}
                    isExpanded={true}
                />
                <ScoreCard
                    label={metrics.general.label}
                    score={metrics.general.score}
                    maxScore={metrics.general.maxScore}
                    description={metrics.general.description}
                    metricType="general"
                    explanation={bike.general_score_explanation}
                    isExpanded={true}
                />
            </div>
        </div>
    )
}
