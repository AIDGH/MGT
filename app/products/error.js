'use client';
export default function Error({reset}) { return <div className="catalog-empty"><h1>دریافت محصول انجام نشد</h1><p>Product temporarily unavailable</p><button className="gold-button" onClick={reset}>تلاش دوباره / Retry</button><p><a href="/products">بازگشت به محصولات / Products</a></p></div>; }
