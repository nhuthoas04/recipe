import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans as NotoSans, Noto_Serif as NotoSerif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { UserDataSync } from "@/components/user-data-sync"
import { CleanupLocalStorage } from "@/components/cleanup-localstorage"
import { ClientOnly } from "@/components/client-only"
import "./globals.css"

const notoSans = NotoSans({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const notoSerif = NotoSerif({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
})

export const metadata: Metadata = {
  title: "Bếp Nhà - Gợi Ý Nấu Ăn & Lập Thực Đơn",
  description: "Hệ thống gợi ý công thức nấu ăn và lập thực đơn cho gia đình Việt",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSerif.variable} font-sans antialiased`} suppressHydrationWarning>
        <CleanupLocalStorage />
        <UserDataSync>
          {children}
        </UserDataSync>
        <Analytics />
      </body>
    </html>
  )
}
