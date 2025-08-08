import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MilPay',
  description: 'Military paycheck, budget, and retirement calculator (MVP)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 20, lineHeight: 1.4 }}>
        <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <a href="/">Home</a>
          <a href="/calculators/pay">Paycheck</a>
          <a href="/calculators/budget">Budget</a>
          <a href="/calculators/retirement">Retirement</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
