import PlayedGame from '../models/PlayedGame.js';
import { gameCatalog } from '../data/gameCatalog.js';
import { ApiError, asyncHandler } from '../utils/http.js';

const editableFields = ['status', 'hoursPlayed', 'rank', 'note', 'isFavorite', 'isVisible', 'order'];
const pick = (body, fields) => Object.fromEntries(fields.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));

export const getCatalog = asyncHandler(async (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const platform = String(req.query.platform || '').trim();
  const games = gameCatalog.filter((game) =>
    (!query || `${game.title} ${game.genre}`.toLowerCase().includes(query))
    && (!platform || game.platform === platform));
  res.json({ games });
});

export const listGames = asyncHandler(async (req, res) => {
  const games = await PlayedGame.find({ userId: req.user.id }).sort('order createdAt');
  res.json({ games });
});

export const addGame = asyncHandler(async (req, res) => {
  const catalogGame = gameCatalog.find((game) => game.key === req.body.gameKey);
  if (!catalogGame) throw new ApiError(422, 'Game không có trong catalog');
  const exists = await PlayedGame.exists({ userId: req.user.id, gameKey: catalogGame.key });
  if (exists) throw new ApiError(409, 'Game này đã có trong profile');
  const { key: gameKey, ...catalogFields } = catalogGame;
  const game = await PlayedGame.create({
    ...catalogFields,
    gameKey,
    ...pick(req.body, editableFields),
    userId: req.user.id,
    order: await PlayedGame.countDocuments({ userId: req.user.id }),
  });
  res.status(201).json({ game });
});

export const updateGame = asyncHandler(async (req, res) => {
  const game = await PlayedGame.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    pick(req.body, editableFields),
    { new: true, runValidators: true },
  );
  if (!game) throw new ApiError(404, 'Không tìm thấy game');
  res.json({ game });
});

export const deleteGame = asyncHandler(async (req, res) => {
  const game = await PlayedGame.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!game) throw new ApiError(404, 'Không tìm thấy game');
  res.status(204).end();
});

export const reorderGames = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.ids)) throw new ApiError(422, 'Danh sách thứ tự không hợp lệ');
  await Promise.all(req.body.ids.map((id, order) => PlayedGame.updateOne({ _id: id, userId: req.user.id }, { order })));
  res.json({ message: 'Đã cập nhật thứ tự game' });
});
