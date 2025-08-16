'use client'
import { Children, type ReactNode } from 'react'

type Props = {
  left?: ReactNode
  right?: ReactNode
  children?: ReactNode | ReactNode[]
}

export default function TwoCol({ left, right, children }: Props) {
  const kids = Children.toArray(children ?? [])
  const L = left ?? kids[0] ?? null
  const R = right ?? kids[1] ?? null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">{L}</div>
      {R}
    </div>
  )
}
