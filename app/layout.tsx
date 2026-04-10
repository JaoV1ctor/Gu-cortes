import type {Metadata} from 'next';
import { Inter, Rye } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const rye = Rye({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Gu Cortes Digital | Barbearia Premium',
  description: 'Agendamento premium para a barbearia do Augusto',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${rye.variable}`} suppressHydrationWarning>
      <body className="bg-black text-neutral-50 font-sans antialiased selection:bg-yellow-500/30 selection:text-yellow-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
