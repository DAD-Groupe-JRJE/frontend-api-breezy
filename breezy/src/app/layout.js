import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileNav from "@/components/MobileNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Breezy",
  description: "Personnalisez votre expérience visuelle sur Breezy",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground transition-colors duration-250"
        cz-shortcut-listen="true"
      >
        <ThemeProvider>
          <AuthGuard>
            <div className="flex min-h-screen w-full">
              {/* Left Sidebar Menu */}
              <Sidebar />
              
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-screen md:pl-64 pb-20 md:pb-0">
                {/* Mobile top header */}
                <MobileHeader />
                
                <div className="flex-1 w-full max-w-2xl mx-auto border-l border-r border-border">
                  {children}
                </div>
              </div>

              {/* Mobile bottom navigation bar */}
              <MobileNav />
            </div>
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
