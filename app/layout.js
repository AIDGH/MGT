import './globals.css';

export const metadata = {
  title: 'جهان تجارت مجد | واردات قطعات خودرو از چین',
  description: 'در جهان تجارت مجد، ما فراتر از تجارت، به ساختن روابطی پایدار و ارزش‌آفرین باور داریم.',
};

export default function RootLayout({ children }) {
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
