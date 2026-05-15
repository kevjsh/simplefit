import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "./components/utils/NotificationSystem";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "SimpleFit",
  description: "Gimnasio SimpleFit — You can do it!",
  icons: {
    icon: "https://firebasestorage.googleapis.com/v0/b/simplefit-6c181.firebasestorage.app/o/logos%2Ficon.png?alt=media&token=d1ef0a92-74bf-492f-876e-6fea8287d6db",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
