'use client';
import { useRouter } from 'next/navigation';
import { useSite } from './site-provider';
export function BrandLogo({isEnglish}) {
  return isEnglish ? <img className="english-logo" src="/brand/logo-en-beige.svg" width="158" height="82" alt="Majd Global Trading"/> : <img src="/brand/logo-fa-gold.png" width="152" height="101" alt="جهان تجارت مجد"/>;
}
export function SiteHeader({home=false}) {
  const {t,isEnglish,setLanguage}=useSite();const router=useRouter();
  return <><header id="home" className="header"><div className="shell header-top">
    <a className="brand" href="/" aria-label={t.brandLabel}><BrandLogo isEnglish={isEnglish}/></a>
    <div className="header-tools"><form className="product-search" role="search" action="/products" onSubmit={e=>{e.preventDefault();const q=new FormData(e.currentTarget).get('q').trim();router.push(`/products${q?'?q='+encodeURIComponent(q):''}`);}}>
      <input name="q" type="search" maxLength={150} aria-label={t.searchLabel} placeholder={t.searchPlaceholder}/><button type="submit" aria-label={t.searchLabel}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/></svg></button>
    </form><button className="language-switch" type="button" dir="ltr" aria-label={isEnglish?'تغییر زبان سایت به فارسی':'Change site language to English'} onClick={()=>setLanguage(isEnglish?'fa':'en')}><span>{t.switchLabel}</span><svg className="globe-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12s1.1 6.6 3.3 9"/></svg></button></div>
  </div></header><nav className="main-nav" aria-label={isEnglish?'Main navigation':'منوی اصلی'}><div className="shell nav-inner"><a href={home?'#home':'/'}>{t.nav[0]}</a><a href="/products">{t.nav[1]}</a><a href="/#about">{t.nav[2]}</a><a href="/#contact">{t.nav[3]}</a></div></nav></>;
}
export function SiteFooter() {
  const {t,isEnglish,site}=useSite();
  return <footer className="footer"><div className="shell"><div className="footer-main"><a href="/" aria-label={t.brandLabel}><BrandLogo isEnglish={isEnglish}/></a><nav aria-label={t.footerNavLabel}><a href="/products">{t.nav[1]}</a><a href="/#about">{t.nav[2]}</a><a href="/#contact">{t.nav[3]}</a></nav></div><div className="footer-bottom"><a className="footer-email" href={`mailto:${site.companyEmail}`} dir="ltr">{site.companyEmail}</a><a href="#home">{t.backTop} <span aria-hidden="true">↑</span></a></div></div></footer>;
}
export function CatalogShell({children}) {
  return <div className="site-frame"><a className="skip-link" href="#main">Skip / رفتن به محتوا</a><div className="site-content"><div className="scroll-rail" aria-hidden="true"/><SiteHeader/><main id="main" className="catalog-main">{children}</main></div><SiteFooter/></div>;
}
