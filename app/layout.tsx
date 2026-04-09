import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Eathletes — AI Sports Nutrition Coach",
  description: "Personalized AI-powered nutrition plans built for your training. Fuel smarter, perform better.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "var(--background)", color: "var(--foreground)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
