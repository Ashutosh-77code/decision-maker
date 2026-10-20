import "./globals.css";
import { Space_Grotesk } from "next/font/google";

const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata = { title: "The Decision Maker", description: "Can't pick? We will." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
