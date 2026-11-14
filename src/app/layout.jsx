import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ActiveParkingHUD from "@/components/layout/ActiveParkingHUD";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});

export const metadata = {
  title: "Where Did I Park? | Two-Wheeler Parking Management",
  description:
    "Smart two-wheeler parking management system. Find available parking spaces, allocate slots, track your parked vehicle location, and report incidents.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "256x256", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface-bg text-ink-primary font-sans antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#18212F",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }}
        />
        {children}
        <ActiveParkingHUD />
      </body>
    </html>
  );
}
