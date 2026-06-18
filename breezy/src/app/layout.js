import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
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

const themeScript = `
  (function() {
    try {
      const savedTheme = localStorage.getItem('theme') || 'system';
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) {}
  })()
`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {/* <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head> */}
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-250"
        cz-shortcut-listen="true"
      >
        <ThemeProvider>
          <AuthGuard>
            <Navbar />
            {children}
          </AuthGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
