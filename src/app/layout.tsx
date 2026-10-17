import type { Metadata } from "next";
import { Pixelify_Sans, VT323 } from "next/font/google";
import "./globals.css";

const fontTitle = Pixelify_Sans({
  variable: "--font-title",
  subsets: ["latin"],
});

const fontBody = VT323({
  variable: "--font-body",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "kyse",
  description: "i write software & make little things",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontTitle.variable} ${fontBody.variable}`}>
      <body>{children}</body>
    </html>
  );
}
