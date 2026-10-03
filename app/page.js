'use client';

import { useEffect, useRef, useState } from 'react';

const content = {
  fa: {
    dir: 'rtl', locale: 'fa', switchLabel: 'En', title: 'جهان تجارت مجد | واردات قطعات خودرو از چین',
    skip: 'رفتن به محتوای اصلی', brandLabel: 'جهان تجارت مجد، صفحه اصلی',
    nav: ['صفحه اصلی', 'محصولات', 'درباره ما', 'تماس با ما'], searchPlaceholder: 'جست‌وجوی محصولات...', searchLabel: 'جست‌وجوی محصولات',
    searchEmpty: 'نام یا دسته محصول را وارد کنید.', searchMiss: 'محصولی با این عبارت پیدا نشد.',
    slides: [
      { title: 'قطعات موتور', caption: 'واردات و تأمین قطعات موتور خودرو از چین', keys: 'موتور پیشرانه فیلتر engine parts' },
      { title: 'سیستم ترمز', caption: 'راهکارهای مطمئن برای مجموعه‌های ترمز خودرو', keys: 'ترمز دیسک لنت brake system' },
      { title: 'تعلیق و فرمان', caption: 'قطعات سیستم تعلیق، جلوبندی و فرمان', keys: 'تعلیق فرمان جلوبندی suspension steering' },
      { title: 'قطعات الکتریکی', caption: 'تأمین مجموعه‌های برقی و الکترونیکی خودرو', keys: 'برق الکتریکی باتری چراغ electrical parts' },
    ],
    previousSlide: 'اسلاید قبلی', nextSlide: 'اسلاید بعدی', goToSlide: 'رفتن به اسلاید',
    aboutLabel: 'درباره ما', aboutTitle: <>تجارت،<br/>{" "}با نگاهی فراتر.</>,
    belief: 'در جهان تجارت مجد، ما فراتر از تجارت، به ساختن روابطی پایدار و ارزش‌آفرین باور داریم.',
    directorLabel: 'پیام مدیرعامل', directorMessage: 'به عنوان مدیر عامل، هر روز با اشتیاق و تعهد در کنار تیم‌مان تلاش می‌کنیم تا نه‌تنها نیازهای تجاری شما را برآورده کنیم، بلکه با هم مسیر موفقیت و پیشرفت را بسازیم.',
    contactLabel: 'تماس با ما', contactTitle: 'ارتباط با شرکت', contactText: 'برای گفتگو درباره همکاری یا دریافت اطلاعات بیشتر، از راه‌های زیر با ما در تماس باشید.',
    addressLabel: 'آدرس', address: 'تهران، بلوار دریا، ابتدای پاکنژاد، کوچه عیسی‌پور، پلاک ۲۸، واحد ۱',
    officePhone: 'تلفن شرکت', managementPhone: 'تلفن مدیریت', companyEmail: 'ایمیل شرکت', directorEmail: 'ایمیل مدیریت', call: 'تماس', copy: 'کپی', copied: 'کپی شد', copyFailed: 'کپی انجام نشد', companyGroup: 'ارتباط با شرکت', managementGroup: 'ارتباط با مدیریت',
    footerCompany: 'جهان تجارت مجد', footerNavLabel: 'دسترسی‌های پایین صفحه', backTop: 'بازگشت به بالا',
  },
  en: {
    dir: 'ltr', locale: 'en', switchLabel: 'Fa', title: 'Majd Global Trading | Automotive Parts Importer',
    skip: 'Skip to main content', brandLabel: 'Majd Global Trading, home',
    nav: ['Home', 'Products', 'About us', 'Contact us'], searchPlaceholder: 'Search products...', searchLabel: 'Search products',
    searchEmpty: 'Enter a product name or category.', searchMiss: 'No matching product was found.',
    slides: [
      { title: 'Engine Parts', caption: 'Automotive engine components imported from China', keys: 'engine motor filters قطعات موتور' },
      { title: 'Braking System', caption: 'Reliable solutions for automotive braking systems', keys: 'brake disc pad ترمز لنت' },
      { title: 'Suspension & Steering', caption: 'Suspension, chassis and steering components', keys: 'suspension steering تعلیق فرمان جلوبندی' },
      { title: 'Electrical Parts', caption: 'Automotive electrical and electronic components', keys: 'electrical battery light قطعات برقی الکتریکی' },
    ],
    previousSlide: 'Previous slide', nextSlide: 'Next slide', goToSlide: 'Go to slide',
    aboutLabel: 'About us', aboutTitle: <>Trade,<br/>{" "}with a broader vision.</>,
    belief: 'At Jahan Tejarat Majd, we believe in building enduring and value-creating relationships, beyond just trade.',
    directorLabel: "Managing Director's message", directorMessage: 'As the Managing Director, every day, with passion and commitment, we strive alongside our team not only to meet your business needs but to jointly shape a path of success and progress.',
    contactLabel: 'Contact us', contactTitle: 'Contact the company', contactText: 'To discuss a partnership or request more information, please contact us using the details below.',
    addressLabel: 'Address', address: 'Tehran, Iran',
    officePhone: 'Office phone', managementPhone: 'Management', companyEmail: 'Company email', directorEmail: 'Management email', call: 'Call', copy: 'Copy', copied: 'Copied', copyFailed: 'Could not copy', companyGroup: 'Company enquiries', managementGroup: 'Management enquiries',
    footerCompany: 'MAJD GLOBAL TRADING', footerNavLabel: 'Footer navigation', backTop: 'Back to top',
  },
};

function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4 4"/></svg>; }
function GlobeIcon() { return <svg className="globe-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21M12 3C9.8 5.4 8.7 8.4 8.7 12s1.1 6.6 3.3 9"/></svg>; }
function BrandLogo({ isEnglish, footer = false }) {
  if (isEnglish) return <img className="english-logo" src="/brand/logo-en-final-beige.svg" width={158} height={82} alt="Majd Global Trading L.L.C"/>;
  return <img src="/brand/logo-fa-gold.png" width={footer ? 190 : 152} height={footer ? 123 : 101} alt="جهان تجارت مجد"/>;
}

function CopyIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>; }

export default function Home() {
  const [language, setLanguage] = useState('fa');
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [copiedValue, setCopiedValue] = useState('');
  const searchRef = useRef(null);
  const touchStart = useRef(null);
  const [copyNotice, setCopyNotice] = useState('');
  const t = content[language];
  const isEnglish = language === 'en';

  useEffect(() => { const saved = window.localStorage.getItem('mgt-language'); if (saved === 'en' || saved === 'fa') setLanguage(saved); }, []);
  useEffect(() => { document.documentElement.lang = t.locale; document.documentElement.dir = t.dir; document.title = t.title; window.localStorage.setItem('mgt-language', language); }, [language, t]);
  useEffect(() => { if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined; const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % t.slides.length), 5200); return () => window.clearInterval(timer); }, [language, paused, t.slides.length]);

  const changeLanguage = () => { setLanguage(isEnglish ? 'fa' : 'en'); setSearchMessage(''); setActiveSlide(0); if (searchRef.current) searchRef.current.value = ''; };
  const searchProducts = (event) => {
    event.preventDefault();
    const query = searchRef.current?.value.trim().toLocaleLowerCase(t.locale) || '';
    if (!query) { setSearchMessage(t.searchEmpty); return; }
    const match = t.slides.findIndex((slide) => `${slide.title} ${slide.caption} ${slide.keys}`.toLocaleLowerCase(t.locale).includes(query));
    if (match < 0) { setSearchMessage(t.searchMiss); return; }
    setActiveSlide(match); setPaused(true); setSearchMessage(''); document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' });
  };
  const copy = async (value) => { try { await navigator.clipboard.writeText(value); setCopiedValue(value); setCopyNotice(t.copied); window.setTimeout(() => { setCopiedValue(''); setCopyNotice(''); }, 2000); } catch { setCopyNotice(t.copyFailed); } };
  const selectSlide = (index) => { setActiveSlide(index); setPaused(true); };
  const slideStep = (amount) => { setActiveSlide((slide) => (slide + amount + t.slides.length) % t.slides.length); setPaused(true); };
  const swipeEnd = (event) => {
    if (!touchStart.current) return;
    const dx = event.changedTouches[0].clientX - touchStart.current.x;
    const dy = event.changedTouches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) slideStep((dx < 0 ? 1 : -1) * (isEnglish ? 1 : -1));
    touchStart.current = null;
  };
  const contacts = [
    { label: t.addressLabel, value: t.address, copyValue: t.address, wide: true },
    { label: t.officePhone, value: '+98-21 88563648', href: 'tel:+982188563648', copyValue: '+982188563648' },
    { label: t.managementPhone, value: '+98 912 108 0499', href: 'tel:+989121080499', copyValue: '+989121080499' },
    { label: t.companyEmail, value: 'info@majdglobaltrading.com', href: 'mailto:info@majdglobaltrading.com', copyValue: 'info@majdglobaltrading.com' },
    { label: t.directorEmail, value: 'ceo@majdglobaltrading.com', href: 'mailto:ceo@majdglobaltrading.com', copyValue: 'ceo@majdglobaltrading.com' },
  ];

  return <div className="site-frame">
    <a className="skip-link" href="#main">{t.skip}</a>
    <div className="site-content">
    <div className="scroll-rail" aria-hidden="true"/>
    <header id="home" className="header">
      <div className="shell header-top">
        <a className="brand" href="#home" aria-label={t.brandLabel}><BrandLogo isEnglish={isEnglish}/></a>
        <div className="header-tools">
          <form className="product-search" role="search" onSubmit={searchProducts}><input ref={searchRef} type="search" aria-label={t.searchLabel} placeholder={t.searchPlaceholder}/><button type="submit" aria-label={t.searchLabel}><SearchIcon/></button>{searchMessage && <span className="search-message" role="status">{searchMessage}</span>}</form>
          <button className="language-switch" type="button" lang={isEnglish ? 'fa' : 'en'} dir="ltr" aria-label={isEnglish ? 'تغییر زبان سایت به فارسی' : 'Change site language to English'} onClick={changeLanguage}><span>{t.switchLabel}</span><GlobeIcon/></button>
        </div>
      </div>
    </header>
      <nav className="main-nav" aria-label={isEnglish ? 'Main navigation' : 'منوی اصلی'}><div className="shell nav-inner"><a href="#home">{t.nav[0]}</a><a href="#products">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a></div></nav>
    <main id="main">
      <h1 className="sr-only">{t.footerCompany}</h1>
      {/* Previous opening hero retained for possible restoration:
          «جهان تجارت مجد — از مرزها فراتر، به همکاری نزدیک‌تر.
          واردات قطعات خودرو از چین؛ پیوندی میان تأمین و تجارت.» */}
      <section id="products" className="slider" aria-roledescription="carousel" aria-label={t.nav[1]} tabIndex={0} onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={swipeEnd} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); slideStep(event.key === "ArrowRight" ? 1 : -1); } }}>
        <div className="slides-track">
          {t.slides.map((slide, index) => <article className={`slide${index === activeSlide ? ' is-active' : ''}`} key={slide.title} aria-hidden={activeSlide !== index}><img src="/images/auto-parts-showcase.jpg" alt=""/><div className="slide-shade"/><div className="shell slide-content" dir={t.dir}><span>{String(index + 1).padStart(2, '0')}</span><h2>{slide.title}</h2><p>{slide.caption}</p></div></article>)}
        </div>
        <button className="slider-arrow slider-prev" type="button" onClick={() => slideStep(-1)} aria-label={t.previousSlide}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button><button className="slider-arrow slider-next" type="button" onClick={() => slideStep(1)} aria-label={t.nextSlide}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>
        <button className="slider-pause" type="button" onClick={() => setPaused(!paused)} aria-label={isEnglish ? (paused ? "Play slideshow" : "Pause slideshow") : (paused ? "پخش اسلایدر" : "توقف اسلایدر")}>{paused ? "▶" : "Ⅱ"}</button>
        <span className="slide-counter" dir="ltr" aria-hidden="true">{String(activeSlide + 1).padStart(2, '0')} <span>/ 04</span></span>
        <div className="slider-dots">{t.slides.map((slide, index) => <button key={slide.title} className={index === activeSlide ? 'active' : ''} type="button" onClick={() => selectSlide(index)} aria-label={`${t.goToSlide} ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined}/>)}</div>
      </section>
      <div className="category-strip" aria-label={t.nav[1]}>{t.slides.map((slide, index) => <button type="button" key={slide.title} className={activeSlide === index ? "selected" : ""} aria-pressed={activeSlide === index} onClick={() => selectSlide(index)}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{slide.title}<span className="category-arrow" aria-hidden="true">{isEnglish ? "↗" : "↖"}</span></button>)}</div>
      <section id="about" className="about section-pad"><div className="shell about-grid"><div className="section-title"><span className="section-kicker"><span>01</span> {t.aboutLabel}</span><h2>{t.aboutTitle}</h2></div><div className="about-copy"><p className="lead">{t.belief}</p><div className="director-message"><span className="director-label">{t.directorLabel}</span><blockquote>{t.directorMessage}</blockquote></div></div></div></section>
      <section id="contact" className="contact section-pad">
        <div className="shell">
          <div className="contact-heading"><div><span className="section-kicker"><span>02</span> {t.contactLabel}</span><h2>{t.contactTitle}</h2><p>{t.contactText}</p></div></div>
          <div className="contact-groups">{[[contacts[0], contacts[1], contacts[3]], [contacts[2], contacts[4]]].map((group, index) => <div className="contact-group" key={index}>
            <h3><span className="contact-dot"/>{index === 0 ? t.companyGroup : t.managementGroup}</h3>
            {group.map((item) => <div className={`contact-row${item.wide ? ' address-row' : ''}`} key={item.label}>
              <span className="contact-card-label">{item.label}</span>
              <div className="contact-details">{item.href ? <a className="contact-value" href={item.href} dir="ltr">{item.value}</a> : <p className="contact-value">{item.value}</p>}
                <button className="copy-button" type="button" onClick={() => copy(item.copyValue)} aria-label={`${t.copy} ${item.label}`} title={t.copy}>{copiedValue === item.copyValue ? <span aria-hidden="true">✓</span> : <CopyIcon/>}</button>
              </div>
            </div>)}
          </div>)}</div>
          <span className="copy-notice" role="status">{copyNotice}</span>
        </div>
      </section>
    </main>
    </div>
    <footer className="footer"><div className="shell"><div className="footer-main"><a href="#home" aria-label={t.brandLabel}><BrandLogo isEnglish={isEnglish} footer/></a><nav aria-label={t.footerNavLabel}><a href="#products">{t.nav[1]}</a><a href="#about">{t.nav[2]}</a><a href="#contact">{t.nav[3]}</a></nav></div><div className="footer-bottom"><a className="footer-email" href="mailto:info@majdglobaltrading.com" dir="ltr">info@majdglobaltrading.com</a><a href="#home">{t.backTop} <span aria-hidden="true">↑</span></a></div></div></footer>
  </div>;
}
