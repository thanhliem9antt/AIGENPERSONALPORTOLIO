import { Link } from 'react-router-dom';
import { Button } from '../components/common/UI';
export default function NotFoundPage(){return <main className="grid min-h-screen place-items-center bg-ink text-center"><div><p className="eyebrow">404</p><h1 className="mt-3 text-4xl font-semibold">Trang này đã đi lạc.</h1><p className="my-5 text-zinc-500">Đường dẫn bạn tìm không tồn tại hoặc đã được thay đổi.</p><Link to="/"><Button>Về trang chủ</Button></Link></div></main>}
