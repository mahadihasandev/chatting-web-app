import "./globals.css";
import { AppProviders } from "@/app/providers";

export const metadata = {
  title: "BartaBox Chat",
  description: "Modern realtime chat built with Next.js, Firebase and Redux",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0ea5e9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
