import { notFound } from 'next/navigation';
import ProductDetail from './product-detail';
export const dynamic='force-dynamic';
async function load(slug){
 const r=await fetch(`${process.env.INTERNAL_API_URL||'http://127.0.0.1:4001'}/api/public/products/${encodeURIComponent(slug)}`,{cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(r.status===404)notFound();if(!r.ok)throw new Error('Product unavailable');return r.json();
}
export async function generateMetadata({params}){const {slug}=await params;const p=await load(slug);return {title:`${p.nameFa} | Majd Global Trading`,description:p.descriptionFa.slice(0,160),openGraph:{images:p.images.slice(0,1)}};}
export default async function ProductPage({params}){const {slug}=await params;return <ProductDetail product={await load(slug)}/>;}
