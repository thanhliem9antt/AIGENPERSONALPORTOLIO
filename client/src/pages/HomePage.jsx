import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Brush,
  Globe2,
  Layers3,
  Link2,
  Music2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/common/UI';

const features = [
  [Brush, 'Giao diện của riêng bạn', 'Tinh chỉnh màu, nền, font, chuyển động và chất liệu card theo gu cá nhân.'],
  [Layers3, 'Mọi thứ trong một nơi', 'Kết nối mạng xã hội, dự án và câu chuyện nghề nghiệp trên một đường dẫn.'],
  [BarChart3, 'Hiểu sức lan tỏa', 'Theo dõi lượt xem ẩn danh và quản lý nội dung từ dashboard tối giản.'],
];

function DemoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/15 bg-white/[.075] p-6 shadow-glow backdrop-blur-2xl"
    >
      <div className="absolute -inset-16 -z-10 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="h-44 rounded-2xl bg-gradient-to-br from-violet-500/30 via-fuchsia-900/20 to-cyan-500/10 p-5">
        <div className="h-16 w-16 rounded-2xl border border-white/20 bg-gradient-to-br from-zinc-300 to-zinc-700 shadow-xl" />
      </div>
      <div className="-mt-5 rounded-2xl border border-white/10 bg-[#0d0e13]/90 p-5">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Isaac Reed</h3>
          <BadgeCheck className="text-violet-400" size={18} />
        </div>
        <p className="mt-1 text-sm text-zinc-400">@demo · Full-stack Developer</p>
        <p className="mt-4 text-sm leading-6 text-zinc-300">
          Biến ý tưởng thành những trải nghiệm số chỉn chu, nhanh và đáng nhớ.
        </p>
        <div className="mt-5 flex gap-2">
          {['React', 'Node.js', 'MongoDB'].map((item) => (
            <span key={item} className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
              {item}
            </span>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[Globe2, Link2, Music2].map((Icon, index) => (
            <button
              aria-label={`Demo ${index + 1}`}
              key={index}
              className="grid h-11 place-items-center rounded-xl border border-white/10 bg-white/5"
            >
              <Icon size={17} />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <main>
      <section className="section grid min-h-[calc(100vh-80px)] items-center gap-16 py-16 lg:grid-cols-[1.12fr_.88fr]">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="eyebrow mb-6 flex items-center gap-2">
            <Sparkles size={14} /> Profile, refined.
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-6xl lg:text-7xl">
            Xây dựng dấu ấn
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-white to-zinc-400 bg-clip-text text-transparent">
              cá nhân của bạn.
            </span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
            Tạo một trang profile chuyên nghiệp, chia sẻ mạng xã hội, dự án và câu chuyện của bạn chỉ trong vài phút.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register">
              <Button className="px-6 py-3">
                Tạo profile <ArrowRight size={17} />
              </Button>
            </Link>
            <Link to="/@demo">
              <Button variant="ghost" className="px-6 py-3">
                Xem demo
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-5 text-xs text-zinc-500">
            <span>Không cần kỹ năng thiết kế</span>
            <span>•</span>
            <span>Responsive mọi thiết bị</span>
            <span>•</span>
            <span>Miễn phí bắt đầu</span>
          </div>
        </motion.div>
        <DemoCard />
      </section>
      <section id="features" className="section py-24">
        <p className="eyebrow">Được thiết kế để nổi bật</p>
        <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Một profile gọn gàng. Một ấn tượng dài lâu.
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(([Icon, title, text]) => (
            <article key={title} className="glass rounded-3xl p-7">
              <div className="mb-8 grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-300">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section py-24">
        <div className="glass grid gap-8 rounded-[2rem] p-8 md:grid-cols-3 md:p-12">
          {[
            ['01', 'Đăng ký tài khoản'],
            ['02', 'Cá nhân hóa profile'],
            ['03', 'Chia sẻ /@username'],
          ].map(([n, t]) => (
            <div key={n}>
              <span className="text-sm text-violet-300">{n}</span>
              <h3 className="mt-3 text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Chỉ vài thao tác đơn giản để xuất hiện theo cách chuyên nghiệp nhất.
              </p>
            </div>
          ))}
        </div>
      </section>
      <footer className="section flex flex-col gap-4 border-t border-white/10 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 NOIR Profiles</span>
        <span className="flex items-center gap-2">
          <ShieldCheck size={15} /> Riêng tư, an toàn, tinh tế.
        </span>
      </footer>
    </main>
  );
}
