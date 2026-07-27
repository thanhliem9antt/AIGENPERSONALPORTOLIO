import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import User from './models/User.js';
import Profile from './models/Profile.js';
import SocialLink from './models/SocialLink.js';
import Project from './models/Project.js';
import Appearance from './models/Appearance.js';
import PlayedGame from './models/PlayedGame.js';
import { gameCatalog } from './data/gameCatalog.js';

await connectDatabase();
const username = 'demo';
let user = await User.findOne({ username });
if (!user) user = await User.create({ fullName: 'Isaac Reed', username, email: 'demo@example.com', password: 'Demo@123456' });

await Promise.all([
  Profile.findOneAndUpdate({ userId: user.id }, {
    displayName: 'Isaac Reed',
    headline: 'Full-stack Web Developer',
    bio: 'Tôi xây dựng những sản phẩm web hiện đại, tối ưu và có trải nghiệm người dùng tốt.',
    location: 'Việt Nam',
    availabilityStatus: 'Available for work',
    skills: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'SQL Server'],
    isPublished: true,
  }, { upsert: true }),
  Appearance.findOneAndUpdate({ userId: user.id }, {}, { upsert: true, setDefaultsOnInsert: true }),
]);

if (!(await SocialLink.exists({ userId: user.id }))) {
  await SocialLink.insertMany([
    ['GitHub', 'https://github.com', 'Github'],
    ['Facebook', 'https://facebook.com', 'Facebook'],
    ['LinkedIn', 'https://linkedin.com', 'Linkedin'],
    ['Discord', 'https://discord.com', 'MessageCircle'],
    ['Email', 'mailto:demo@example.com', 'Mail'],
  ].map(([platform, url, icon], order) => ({ userId: user.id, platform, label: platform, url, icon, order })));
}

if (!(await Project.exists({ userId: user.id }))) {
  await Project.insertMany([
    ['BidGG', 'Nền tảng đấu giá trực tuyến thời gian thực.', ['React', 'Node.js', 'Socket.IO']],
    ['Vietnam Voyage', 'Trải nghiệm khám phá Việt Nam được tuyển chọn.', ['React', 'Tailwind CSS']],
    ['Personal Portfolio', 'Hồ sơ sáng tạo tối giản và giàu tương tác.', ['Vite', 'Framer Motion']],
  ].map(([title, shortDescription, technologies], order) => ({
    userId: user.id, title, slug: title.toLowerCase().replace(/\s+/g, '-'), shortDescription, technologies,
    status: 'Đã hoàn thành', isFeatured: true, isVisible: true, order,
  })));
}

if (!(await PlayedGame.exists({ userId: user.id }))) {
  const demoGames = [
    ['riot-league-of-legends', 'Đang chơi', 860, 'Diamond IV', true, 'Game gắn bó lâu nhất với tôi.'],
    ['riot-valorant', 'Đang chơi', 320, 'Ascendant I', true, 'Thích chiến thuật và phối hợp đồng đội.'],
    ['steam-730', 'Đang chơi', 540, 'Premier 15,000', false, 'FPS để chơi cùng bạn bè.'],
    ['steam-1245620', 'Đã hoàn thành', 118, '', true, 'Một trong những thế giới fantasy ấn tượng nhất.'],
  ];
  await PlayedGame.insertMany(demoGames.map(([key, status, hoursPlayed, rank, isFavorite, note], order) => {
    const game = gameCatalog.find((item) => item.key === key);
    const { key: gameKey, ...catalogFields } = game;
    return { ...catalogFields, gameKey, userId: user.id, status, hoursPlayed, rank, isFavorite, note, order };
  }));
}

await Promise.all(gameCatalog.map(({ key, title, platform, publisher, genre, coverUrl, gameUrl }) =>
  PlayedGame.updateMany(
    { gameKey: key },
    { title, platform, publisher, genre, coverUrl, gameUrl },
  )));

console.log('Demo ready: demo@example.com / Demo@123456');
process.exit(0);
