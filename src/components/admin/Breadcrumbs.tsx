'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      <Link
        href="/admin/dashboard"
        className="text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-300 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
