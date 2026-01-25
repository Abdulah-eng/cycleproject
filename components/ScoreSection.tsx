'use client'

import { ReactNode } from 'react'

interface ScoreSectionProps {
  children: ReactNode
}

export default function ScoreSection({ children }: ScoreSectionProps) {
  return <>{children}</>
}
