import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SidebarWrapper from "@/app/components/SidebarWrapper";
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
  title: "Cloudbinet",
  description: "Cloudbinet for ROPA",
  icons: {
    icon: '/logo-web.svg', 
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname();
  // const showSidebar = pathname !== "/login";

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
 <body className="flex h-screen">
        <SidebarWrapper />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}