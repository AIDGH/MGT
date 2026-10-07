'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fallbackContent } from '../lib/copy';
const SiteContext=createContext(null);
const defaults={officePhone:'+982188563648',managementPhone:'+989121080499',companyEmail:'info@majdglobaltrading.com',directorEmail:'ceo@majdglobaltrading.com'};
export function SiteProvider({children}) {
  const [language,setLanguage]=useState('fa');
  const [remote,setRemote]=useState(null);
  useEffect(()=>{
    const saved=localStorage.getItem('mgt-language');
    if(saved==='en') setLanguage('en');
    fetch('/api/public/site').then(r=>r.ok?r.json():Promise.reject()).then(setRemote).catch(()=>{});
  },[]);
  useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='en'?'ltr':'rtl';localStorage.setItem('mgt-language',language);},[language]);
  const value=useMemo(()=>{
    const translated=remote?.content?.[language] || {};
    const slides=remote?.slides ? remote.slides.map(s=>({title:s[language==='en'?'titleEn':'titleFa'],caption:s[language==='en'?'captionEn':'captionFa'],image:s.image,href:s.href})) : fallbackContent[language].slides;
    return {language,setLanguage,isEnglish:language==='en',site:{...defaults,...remote?.content},t:{...fallbackContent[language],...translated,slides}};
  },[language,remote]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}
export const useSite=()=>useContext(SiteContext);
