'use client'
import type { ReactNode, ComponentType, PropsWithChildren } from 'react'

type IconProps = { size?: number; className?: string }

type Props = PropsWithChildren<{
  title: string
  icon?: ComponentType<IconProps>
  size?: number
  className?: string
}>

export default function InfoSidebar({
  title,
  icon: Icon,
  size = 18,
  className = '',
  children,
}: Props) {
  return (
    <aside className={`lg:col-span-1 card lg:sticky lg:top-4 h-fit ${className}`}>
      <h3 className="text-base font-semibold mb-2 flex items-center">
        {Icon ? <Icon size={size} className="mr-2" /> : null} {title}
      </h3>
      <div className="prose prose-sm max-w-none">
        {children}
      </div>
    </aside>
  )
}
