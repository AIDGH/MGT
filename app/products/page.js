import { Suspense } from 'react';
import ProductList from './product-list';
export const metadata={title:'محصولات | Majd Global Trading'};
export default function ProductsPage(){return <Suspense fallback={<p className="loading-page">در حال دریافت محصولات…</p>}><ProductList/></Suspense>;}
