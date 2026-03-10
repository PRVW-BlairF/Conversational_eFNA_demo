import './globals.css';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between">
          <span className="font-semibold">AI Fact Find Copilot</span>
          <div className="space-x-4 text-sm"><Link href="/">Live Demo</Link><Link href="/review">Session Review</Link></div>
        </nav>
        <main className="max-w-[1600px] mx-auto px-6 pb-8">{children}</main>
      </body>
    </html>
  );
}
