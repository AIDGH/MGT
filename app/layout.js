import './globals.css';
import { companyPreview, shareOpenGraph, shareTwitter } from '../lib/share-metadata';
import { SiteProvider } from '../components/site-provider';

export const metadata = {
  title: 'جهان تجارت مجد | واردات قطعات خودرو',
  description: companyPreview,
  openGraph: shareOpenGraph,
  twitter: shareTwitter,
};

export default function RootLayout({ children }) {
  return <html lang="fa" dir="rtl"><body><SiteProvider>{children}</SiteProvider></body></html>;
}
