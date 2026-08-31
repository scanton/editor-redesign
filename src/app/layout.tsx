import type { Metadata } from "next";
import {
  Arima,
  Caveat,
  DM_Sans,
  Fredoka,
  Instrument_Sans,
} from "next/font/google";
import "./globals.css";

/*
 * UI chrome uses the production faces. Headings are Stack Sans Text in the real
 * codebase — proprietary and not on the web — so we load the same Instrument
 * Sans fallback production already ships.
 */
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

/** Card display face — art direction, not chrome. */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/** Card fonts — these are the ones customers pick from, not UI chrome. */
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const arima = Arima({
  variable: "--font-arima",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeartStamp Editor — Redesign",
  description: "Design proposal for the HeartStamp greeting card editor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${dmSans.variable} ${fredoka.variable} ${caveat.variable} ${arima.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
