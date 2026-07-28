import SocialLink from '../models/SocialLink.js';
import Project from '../models/Project.js';
import Appearance from '../models/Appearance.js';
import { ApiError, asyncHandler, slugify } from '../utils/http.js';
import { destroyAsset, uploadBuffer } from '../services/cloudinaryService.js';

const ownedCrud = (Model, transform = (value) => value) => ({
  list: asyncHandler(async (req, res) => res.json({ items: await Model.find({ userId: req.user.id }).sort('order') })),
  create: asyncHandler(async (req, res) => {
    const item = await Model.create({ ...transform(req.body), userId: req.user.id });
    res.status(201).json({ item });
  }),
  update: asyncHandler(async (req, res) => {
    const item = await Model.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, transform(req.body), {
      new: true,
      runValidators: true,
    });
    if (!item) throw new ApiError(404, 'Không tìm thấy dữ liệu');
    res.json({ item });
  }),
  remove: asyncHandler(async (req, res) => {
    const item = await Model.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) throw new ApiError(404, 'Không tìm thấy dữ liệu');
    if (item.thumbnailPublicId) await destroyAsset(item.thumbnailPublicId);
    res.status(204).end();
  }),
  reorder: asyncHandler(async (req, res) => {
    if (!Array.isArray(req.body.ids)) throw new ApiError(422, 'Danh sách thứ tự không hợp lệ');
    await Promise.all(req.body.ids.map((id, order) => Model.updateOne({ _id: id, userId: req.user.id }, { order })));
    res.json({ message: 'Đã cập nhật thứ tự' });
  }),
});

const pick = (body, fields) =>
  Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
const iconByPlatform = {
  GitHub: 'Github',
  Facebook: 'Facebook',
  LinkedIn: 'Linkedin',
  Instagram: 'Instagram',
  TikTok: 'Music',
  YouTube: 'Youtube',
  Discord: 'MessageCircle',
  Telegram: 'Send',
  Email: 'Mail',
  Website: 'Globe',
};

export const socialController = ownedCrud(SocialLink, (body) => {
  const data = pick(body, ['platform', 'label', 'url', 'icon', 'order', 'isVisible']);
  if (body.platform && (!body.icon || body.icon === 'Link')) data.icon = iconByPlatform[body.platform] || 'Link';
  return data;
});
export const projectController = ownedCrud(Project, (body) => {
  const data = pick(body, [
    'title',
    'slug',
    'shortDescription',
    'description',
    'technologies',
    'demoUrl',
    'githubUrl',
    'status',
    'isFeatured',
    'isVisible',
    'order',
  ]);
  if (body.title && !body.slug) data.slug = slugify(body.title);
  return data;
});

export const uploadThumbnail = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user.id });
  if (!project) throw new ApiError(404, 'Không tìm thấy dự án');
  if (!req.file) throw new ApiError(422, 'Vui lòng chọn ảnh');
  const result = await uploadBuffer(req.file.buffer, `personal-profile/${req.user.id}/projects`);
  await destroyAsset(project.thumbnailPublicId);
  project.thumbnailUrl = result.secure_url;
  project.thumbnailPublicId = result.public_id;
  await project.save();
  res.json({ item: project });
});

export const getAppearance = asyncHandler(async (req, res) => {
  let appearance = await Appearance.findOne({ userId: req.user.id });
  if (!appearance) appearance = await Appearance.create({ userId: req.user.id });
  const legacyDefaults = {
    displayNameStyle: 'classic',
    displayNameColor: '#ffffff',
    displayNameGradient: 'linear-gradient(90deg,#c4b5fd,#f0abfc)',
    profileEffect: 'none',
    coverType: 'image',
    coverValue: '',
  };
  let changed = false;
  Object.entries(legacyDefaults).forEach(([key, value]) => {
    if (appearance[key] === undefined) {
      appearance[key] = value;
      changed = true;
    }
  });
  if (changed) await appearance.save();
  res.json({ appearance });
});

export const updateAppearance = asyncHandler(async (req, res) => {
  const allowed = [
    'primaryColor',
    'backgroundType',
    'backgroundValue',
    'backgroundOpacity',
    'backgroundBlur',
    'coverBlur',
    'coverType',
    'coverValue',
    'backgroundPosition',
    'overlayColor',
    'blurStrength',
    'cardStyle',
    'borderRadius',
    'fontFamily',
    'displayNameStyle',
    'displayNameColor',
    'displayNameGradient',
    'enableAnimations',
    'enableParticles',
    'profileEffect',
    'enableCursorEffect',
    'cursorStyle',
    'cursorColor',
    'cursorSize',
    'musicUrl',
    'musicVolume',
    'showMusicControl',
  ];
  const data = Object.fromEntries(
    allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]),
  );
  const appearance = await Appearance.findOneAndUpdate({ userId: req.user.id }, data, {
    new: true,
    runValidators: true,
    upsert: true,
  });
  res.json({ appearance });
});

export const uploadMusic = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(422, 'Vui lòng chọn tệp nhạc');
  const appearance = await Appearance.findOne({ userId: req.user.id });
  const result = await uploadBuffer(req.file.buffer, `personal-profile/${req.user.id}/music`, 'video');
  await destroyAsset(appearance.musicPublicId, 'video');
  appearance.musicUrl = result.secure_url;
  appearance.musicPublicId = result.public_id;
  await appearance.save();
  res.json({ appearance });
});

export const deleteMusic = asyncHandler(async (req, res) => {
  const appearance = await Appearance.findOne({ userId: req.user.id });
  await destroyAsset(appearance.musicPublicId, 'video');
  appearance.musicUrl = undefined;
  appearance.musicPublicId = undefined;
  await appearance.save();
  res.status(204).end();
});
