import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from  "../context/AuthContext";
import Script from 'next/script'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "Lancer - Professional Job Search Portal",
  description: "Create professional resumes, find your dream job, and get insights with our ATS-friendly platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/js/all.min.js"
        strategy="afterInteractive"
      />
    </html>
  );
}