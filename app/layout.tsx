import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thư viện số | Quản trị",
  description: "Bảng điều khiển quản lý thư viện số.",
};

import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toast"
import { LibraryDashboard } from "@/components/dashboard/library-dashboard"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>
          <Toaster />
          <LibraryDashboard>{children}</LibraryDashboard>
        </TooltipProvider>
      </body>
    </html>
  )
}
