'use client'

import { useState } from 'react'
import ScoreCard from './ScoreCard'

interface InteractiveScoreSummaryProps {
    metrics: any
    bike: any
}

export default function InteractiveScoreSummary({ metrics, bike }: InteractiveScoreSummaryProps) {
    const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

    const handleToggle = (metric: string) => {
        setExpandedMetric(prev => prev === metric ? null : metric)
    }

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
                // Performance usually doesn't have an explanation in this design, keeping it purely metric
                />
                <ScoreCard
                    label={metrics.value.label}
                    score={metrics.value.score}
                    maxScore={metrics.value.maxScore}
                    description={metrics.value.description}
                    metricType="value"
                    explanation={bike.value_score_explanation}
                    isExpanded={expandedMetric === 'value'}
                    onToggle={() => handleToggle('value')}
                />
                <ScoreCard
                    label={metrics.fit.label}
                    score={metrics.fit.score}
                    maxScore={metrics.fit.maxScore}
                    description={metrics.fit.description}
                    metricType="fit"
                    explanation={bike.fit_score_explanation}
                    isExpanded={expandedMetric === 'fit'}
                    onToggle={() => handleToggle('fit')}
                />
                <ScoreCard
                    label={metrics.general.label}
                    score={metrics.general.score}
                    maxScore={metrics.general.maxScore}
                    description={metrics.general.description}
                    metricType="general"
                    explanation={bike.general_score_explanation}
                    isExpanded={expandedMetric === 'general'}
                    onToggle={() => handleToggle('general')}
                />
                <ScoreCard
                    label={metrics.speed.label}
                    score={metrics.speed.score}
                    maxScore={metrics.speed.maxScore}
                    description={metrics.speed.description}
                    metricType="speed"
                    explanation={bike.speed_reason || bike.performance_score_explanation}
                    isExpanded={expandedMetric === 'speed'}
                    onToggle={() => handleToggle('speed')}
                />
            </div>
        </div>
    )
}
