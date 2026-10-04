import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaForge AI — Advanced Problem Solver",
  description: "Upload knowledge, ask questions, solve problems and engineer innovations with AI."
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}