const steamCover = (appId) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
const steamUrl = (appId) => `https://store.steampowered.com/app/${appId}`;

const steamGames = [
  [730, 'Counter-Strike 2', 'FPS'],
  [570, 'Dota 2', 'MOBA'],
  [578080, 'PUBG: BATTLEGROUNDS', 'Battle Royale'],
  [1172470, 'Apex Legends', 'Battle Royale'],
  [271590, 'Grand Theft Auto V', 'Open World'],
  [252490, 'Rust', 'Survival'],
  [1245620, 'ELDEN RING', 'Action RPG'],
  [2358720, 'Black Myth: Wukong', 'Action RPG'],
  [1091500, 'Cyberpunk 2077', 'RPG'],
  [413150, 'Stardew Valley', 'Simulation'],
  [381210, 'Dead by Daylight', 'Horror'],
  [1623730, 'Palworld', 'Survival'],
  [238960, 'Path of Exile', 'Action RPG'],
  [230410, 'Warframe', 'Action'],
  [2246340, 'Monster Hunter Wilds', 'Action RPG'],
  [1966720, 'Lethal Company', 'Co-op Horror'],
  [1086940, "Baldur's Gate 3", 'RPG'],
  [1174180, 'Red Dead Redemption 2', 'Open World'],
  [105600, 'Terraria', 'Sandbox'],
  [289070, "Sid Meier's Civilization VI", 'Strategy'],
  [292030, 'The Witcher 3: Wild Hunt', 'RPG'],
  [945360, 'Among Us', 'Party'],
  [892970, 'Valheim', 'Survival'],
  [359550, "Tom Clancy's Rainbow Six Siege", 'FPS'],
].map(([appId, title, genre]) => ({
  key: `steam-${appId}`,
  appId,
  title,
  platform: 'Steam',
  publisher: 'Steam',
  genre,
  coverUrl: steamCover(appId),
  gameUrl: steamUrl(appId),
}));

const riotGames = [
  ['league-of-legends', 'League of Legends', 'MOBA', 'https://www.leagueoflegends.com/', 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/565197caf987af4e4da307df6e2b235a28714736-837x469.jpg?accountingTag=LoL'],
  ['valorant', 'VALORANT', 'Tactical FPS', 'https://playvalorant.com/', 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/cbf4460132cdfeb2a97fad5f9dd25ba0bc058f76-128x128.png?accountingTag=VAL'],
  ['teamfight-tactics', 'Teamfight Tactics', 'Auto Battler', 'https://teamfighttactics.leagueoflegends.com/', 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/86196fe98c0b3fb64456d6fbfdf76d18bc26911c-660x428.png?accountingTag=TFT'],
  ['wild-rift', 'League of Legends: Wild Rift', 'Mobile MOBA', 'https://wildrift.leagueoflegends.com/', 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/74f09240c5a0dfce67f3cf2e9611ee1a9cfb0b1e-736x500.png?accountingTag=WR'],
  ['legends-of-runeterra', 'Legends of Runeterra', 'Card Game', 'https://playruneterra.com/', 'https://playruneterra.com/assets/ccc9b55ec5fec88d1a616e7dec4795282a3aba52/static/image/share-image.jpg'],
  ['2xko', '2XKO', 'Fighting', 'https://2xko.riotgames.com/', 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news_live/0d8da14d9cc0c69376e8fb42cc6344276bf937ad-1200x600.jpg?accountingTag=2XKO'],
].map(([slug, title, genre, gameUrl, coverUrl]) => ({
  key: `riot-${slug}`,
  title,
  platform: 'Riot Games',
  publisher: 'Riot Games',
  genre,
  coverUrl,
  gameUrl,
}));

export const gameCatalog = [...riotGames, ...steamGames];
