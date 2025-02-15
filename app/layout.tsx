import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Baby Tracker',
  description: 'Track your baby\'s activities, milestones, and development',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
