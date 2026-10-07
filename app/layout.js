import './globals.css';
import { SiteProvider } from '../components/site-provider';

export const metadata = {
  title: 'جهان تجارت مجد | واردات قطعات خودرو',
  description: 'در جهان تجارت مجد، ما فراتر از تجارت، به ساختن روابطی پایدار و ارزش‌آفرین باور داریم.',
};

export default function RootLayout({ children }) {
  return <html lang="fa" dir="rtl"><body><SiteProvider>{children}</SiteProvider></body></html>;
}
