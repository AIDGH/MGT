import './admin.css';
import { companyPreview } from '../../lib/share-metadata';
export const metadata={title:companyPreview,robots:{index:false,follow:false}};
export default function AdminLayout({children}){return children;}
