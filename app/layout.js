import './globals.css';

export const metadata = {
  title: 'OmborUZ — Ombor Boshqaruv Tizimi',
  description: 'Ishlab chiqarish sexi uchun ombor boshqaruv tizimi. Mahsulotlar, kategoriyalar, QR kodlar.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script src="https://telegram.org/js/telegram-web-app.js" defer></script>
      </head>
      <body>
        <div className="bg-animated"></div>
        {children}
      </body>
    </html>
  );
}
