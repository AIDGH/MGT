'use client';

import { useEffect, useRef, useState } from 'react';

import { useSite } from '../components/site-provider';
import { SiteHeader, SiteFooter } from '../components/site-shell';


function CopyIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>; }

export default function Home() {
  const { language, site, t, isEnglish } = useSite();
  useEffect(() => { document.title = t.title; }, [t.title]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiedValue, setCopiedValue] = useState('');
  const touchStart = useRef(null);
  const [copyNotice, setCopyNotice] = useState('');
  useEffect(() => { if (paused || t.slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined; const timer = window.setInterval(() => setActiveSlide((slide) => (slide + 1) % t.slides.length), 5200); return () => window.clearInterval(timer); }, [language, paused, t.slides.length]);

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
  useEffect(() => { setActiveSlide(0); }, [language, t.slides.length]);
  const contacts = [
    { label: t.addressLabel, value: t.address, copyValue: t.address, wide: true },
    { label: t.officePhone, value: site.officePhone, href: `tel:${site.officePhone}`, copyValue: site.officePhone },
    { label: t.managementPhone, value: site.managementPhone, href: `tel:${site.managementPhone}`, copyValue: site.managementPhone },
    { label: t.companyEmail, value: site.companyEmail, href: `mailto:${site.companyEmail}`, copyValue: site.companyEmail },
    { label: t.directorEmail, value: site.directorEmail, href: `mailto:${site.directorEmail}`, copyValue: site.directorEmail },
  ];

  return <div className="site-frame">
    <a className="skip-link" href="#main">{t.skip}</a>
    <div className="site-content">
    <div className="scroll-rail" aria-hidden="true"/>
    <SiteHeader home/>
    <main id="main">
      <h1 className="sr-only">{t.footerCompany}</h1>
      {/* Previous opening hero retained for possible restoration:
          «جهان تجارت مجد — از مرزها فراتر، به همکاری نزدیک‌تر.
          واردات قطعات خودرو؛ پیوندی میان تأمین و تجارت.» */}
      {t.slides.length > 0 && <section id="products" className="slider" aria-roledescription="carousel" aria-label={t.nav[1]} tabIndex={0} onTouchStart={(event) => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={swipeEnd} onKeyDown={(event) => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); slideStep(event.key === "ArrowRight" ? 1 : -1); } }}>
        <div className="slides-track">
          {t.slides.map((slide, index) => <article className={`slide${index === activeSlide ? ' is-active' : ''}`} key={slide.title} aria-hidden={activeSlide !== index}><img src={slide.image || "/images/auto-parts-showcase.jpg"} alt=""/><div className="slide-shade"/><div className="shell slide-content" dir={t.dir}><span>{String(index + 1).padStart(2, '0')}</span><h2>{slide.title}</h2><p>{slide.caption}</p>{slide.href && <a className="slide-link" href={slide.href} tabIndex={activeSlide === index ? 0 : -1}>{isEnglish ? "Explore products" : "مشاهده محصولات"} <span aria-hidden="true">{isEnglish ? "→" : "←"}</span></a>}</div></article>)}
        </div>
        <button className="slider-arrow slider-prev" type="button" onClick={() => slideStep(-1)} aria-label={t.previousSlide}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 6-6 6 6 6"/></svg></button><button className="slider-arrow slider-next" type="button" onClick={() => slideStep(1)} aria-label={t.nextSlide}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button>
        <button className="slider-pause" type="button" onClick={() => setPaused(!paused)} aria-label={isEnglish ? (paused ? "Play slideshow" : "Pause slideshow") : (paused ? "پخش اسلایدر" : "توقف اسلایدر")}>{paused ? "▶" : "Ⅱ"}</button>
        <span className="slide-counter" dir="ltr" aria-hidden="true">{String(activeSlide + 1).padStart(2, '0')} <span>/ {String(t.slides.length).padStart(2, "0")}</span></span>
        <div className="slider-dots">{t.slides.map((slide, index) => <button key={slide.title} className={index === activeSlide ? 'active' : ''} type="button" onClick={() => selectSlide(index)} aria-label={`${t.goToSlide} ${index + 1}`} aria-current={index === activeSlide ? 'true' : undefined}/>)}</div>
      </section>}
      <div className="category-strip" aria-label={t.nav[1]}>{t.slides.map((slide, index) => <button type="button" key={slide.title} className={activeSlide === index ? "selected" : ""} aria-pressed={activeSlide === index} onClick={() => selectSlide(index)}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{slide.title}<span className="category-arrow" aria-hidden="true">{isEnglish ? "↗" : "↖"}</span></button>)}</div>
      <section id="about" className="about section-pad"><div className="shell about-grid"><div className="section-title"><span className="section-kicker"><span>01</span> {t.aboutLabel}</span><h2 className="multiline">{t.aboutTitle}</h2></div><div className="about-copy"><p className="lead">{t.belief}</p><div className="director-message"><span className="director-label">{t.directorLabel}</span><blockquote>{t.directorMessage}</blockquote></div></div></div></section>
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
    <SiteFooter/>

  </div>;
}
