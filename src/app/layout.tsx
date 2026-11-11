import './style.css';
import Link from 'next/link';
export const metadata={title:'Stark Learning',description:'Learn, submit and receive feedback'};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><header className="top"><Link className="brand" href="/">STARK <span>LEARNING</span></Link><nav><Link href="/dashboard">My learning</Link><Link href="/teacher">Supervision</Link><Link href="/teacher/reviews">Reviews</Link></nav></header><main>{children}</main><footer>Stark Learning · Learn through real situations</footer></body></html>
}
