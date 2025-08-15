import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ClerkProvider} from '@clerk/nextjs';
import { ReduxProvider } from "../../store/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'E-commerce App',
  description: 'An e-commerce application built with Next.js and Sanity.io',
  authors: {
    name: 'Mohamed El Ghali',
  },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png' },
  ],
};

export default async function RootLayout({
  children,
}:{
  children: React.ReactNode;
})
{
  return (
    <ClerkProvider dynamic>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <ReduxProvider>
        {children}
        </ReduxProvider>

      </body>
    </html>
    </ClerkProvider>
  );
}
