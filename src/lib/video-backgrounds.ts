/**
 * The video background library — the animated loops from
 * scanton/carousel-with-peek. Labels are written out rather than derived: the
 * filenames leave compound words joined ("rosegoldconfetti"), which reads as a
 * bug in the UI.
 */
export type VideoBackground = {
  id: string;
  label: string;
  /** Occasion or audience the loop was made for. */
  category: string;
  src: string;
};

export const VIDEO_BACKGROUNDS: VideoBackground[] = [
  { id: "anniversary-rose-gold-confetti", label: "Rose Gold Confetti", category: "Anniversary", src: "/backgrounds/anniversary-12-rosegoldconfetti-1080p-6s-loop-042c8490c4714e40b77d773bc9c21dab.gif" },
  { id: "baby-unicorn-garden", label: "Unicorn Garden", category: "Baby", src: "/backgrounds/baby-09-unicorn-garden-90f45e4f1cd94ba389ee9b4fe7b90a2a.gif" },
  { id: "birthday-neon-party-glow", label: "Neon Party Glow", category: "Birthday", src: "/backgrounds/birthday-4-neonpartyglow-1080p-6s-loop-7af73f9919a24ebab6d1e03fa0a7c9e0.gif" },
  { id: "b-nai-mitzvah-blue-and-gold", label: "Blue and Gold", category: "B'nai Mitzvah", src: "/backgrounds/bnai-mitzvah-3-bnaimitzvahbluegold-1080p-6s-loop-09353d6b907b45279a0d4c0ffbaab229.gif" },
  { id: "boomer-lavender-tuscan-hills", label: "Lavender Tuscan Hills", category: "Boomer", src: "/backgrounds/boomer-female-4-lavendertuscanhills-1080p-5s-loop-9ee19d79f65e400b9de32a16c31eaf68.gif" },
  { id: "boomer-route-66-diner", label: "Route 66 Diner", category: "Boomer", src: "/backgrounds/boomer-male-2-route66classiccarandneondiner-1080p-6s-loop-8a652e464bd94990be7c9d883760e7b8.gif" },
  { id: "breakup-burn-the-memories", label: "Burn the Memories", category: "Breakup", src: "/backgrounds/breakup-4-burnthememories-1080p-6s-loop-fb2becbc896d4570940ae299fb288b45.gif" },
  { id: "celebration-edm-rave-festival", label: "EDM Rave Festival", category: "Celebration", src: "/backgrounds/celebration-v9-edm-rave-festival-f09e4f8720784a688f25345b2b8be26c.gif" },
  { id: "christmas-christmas-tree-lights", label: "Christmas Tree Lights", category: "Christmas", src: "/backgrounds/christmas-3-christmastreelights-1080p-6s-loop-7ca896660db4483dad618a35298e21f8.gif" },
  { id: "general-lava-lamp-blobs", label: "Lava Lamp Blobs", category: "General", src: "/backgrounds/general-3-lavalampblobs-1080p-6s-loop-4a959276e1264d2ab9d26abc8eb67b11.gif" },
  { id: "gen-x-beach-sunrise-calm", label: "Beach Sunrise Calm", category: "Gen X", src: "/backgrounds/genx-female-10-beachsunrisecalm-1080p-10s-loop-7b04358485434d2a9fcace44b2496500.gif" },
  { id: "gen-x-vinyl-man-cave", label: "Vinyl Man Cave", category: "Gen X", src: "/backgrounds/genx-male-7-vinylmancave-1080p-6s-loop-8774d86a7e2f49c3874be8689c579b25.gif" },
  { id: "gen-z-concert-festival-night", label: "Concert Festival Night", category: "Gen Z", src: "/backgrounds/genz-female-4-concertfestivalnight-1080p-5s-loop-27c4bed635354e38a775172d9abed9d0.gif" },
  { id: "gen-z-sneaker-hype-wall", label: "Sneaker Hype Wall", category: "Gen Z", src: "/backgrounds/genz-male-1-sneakerhypewall-1080p-6s-loop-b956000ecc924e9e8ebd797514eab1f0.gif" },
  { id: "gen-z-streamer-battlestation", label: "Streamer Battlestation", category: "Gen Z", src: "/backgrounds/genz2-19-streamerbattlestation-1080p-6s-loop-6bf75c166f904051b0328ce4f3999a46.gif" },
  { id: "get-well-calming-spa-eucalyptus", label: "Calming Spa Eucalyptus", category: "Get Well", src: "/backgrounds/getwell-4-calmingspaeucalyptus-1080p-6s-loop-a096fd5d67d948c282b0925524aedebe.gif" },
  { id: "graduation-cap-toss-gold", label: "Cap Toss Gold", category: "Graduation", src: "/backgrounds/grad-07-captossgold-1080p-6s-loop-d186806e901f4783a64c341347f4aefc.gif" },
  { id: "kids-dino-jungle", label: "Dino Jungle", category: "Kids", src: "/backgrounds/hs-reveal-4to12-01-dino-jungle-3dcgi-1080p-6s-loop-4add104116754a3188f689fef5c06a6b.gif" },
  { id: "kids-space-rockets", label: "Space Rockets", category: "Kids", src: "/backgrounds/hs-reveal-4to12-02-space-rockets-cosmic-1080p-6s-loop-65805f8934c045648f4918fe217bc5b9.gif" },
  { id: "kids-unicorn-cloud-kingdom", label: "Unicorn Cloud Kingdom", category: "Kids", src: "/backgrounds/hs-reveal-4to12-03-unicorn-cloud-kingdom-kawaii-1080p-6s-loop-9d89b13fa94840b08aec0400b59ed0c9.gif" },
  { id: "kids-fairy-garden", label: "Fairy Garden", category: "Kids", src: "/backgrounds/hs-reveal-4to12-09-fairy-garden-photoreal-1080p-6s-loop-9294b1b8fb2a4483b6601b1dfcf20fba.gif" },
  { id: "sorry-plush-bear", label: "Plush Bear", category: "Sorry", src: "/backgrounds/imsorry-7-sorryplushbear-1080p-6s-loop-a28834f829164bac8160887d616e60a6.gif" },
  { id: "pride-rainbow-heart-tunnel", label: "Rainbow Heart Tunnel", category: "Pride", src: "/backgrounds/lgbtq-5-rainbowheartcloudtunnel-1080p-5s-loop-aa57ab6b89694a76b5e6b1ccef23a8b4.gif" },
  { id: "millennial-90s-arcade-pizza-parlor", label: "90s Arcade Pizza Parlor", category: "Millennial", src: "/backgrounds/mill2-1-90sarcadepizzaparlor-1080p-6s-loop-e489b744174e434c9f09d3999cb6a76f.gif" },
  { id: "millennial-rose-wine-sunset", label: "Rose Wine Sunset", category: "Millennial", src: "/backgrounds/millennial-female-1-rosewinesunset-1080p-6s-loop-42b7fc2b7fef4f72b5d265aab9021648.gif" },
  { id: "millennial-craft-brewery-taproom", label: "Craft Brewery Taproom", category: "Millennial", src: "/backgrounds/millennial-male-8-craftbrewerytaproom-1080p-6s-loop-d8655359138c4010acd6202807104ab1.gif" },
  { id: "new-baby-teddy-bear-clouds", label: "Teddy Bear Clouds", category: "New Baby", src: "/backgrounds/newbaby-5-teddybearclouds-1080p-6s-loop-94035803fe214592aeb61afa987263ac.gif" },
  { id: "new-home-isometric-dream-home", label: "Isometric Dream Home", category: "New Home", src: "/backgrounds/newhome-5-isometricdreamhome-1080p-6s-loop-92af9c361cf44b07a32e2cece2e9a29a.gif" },
  { id: "pet-party-animal-pug", label: "Party Animal Pug", category: "Pet", src: "/backgrounds/pet-1-partyanimalpug-1080p-6s-loop-68c011deb0e64d67a5e91c25330f004a.gif" },
  { id: "pet-kitten-yarn-room", label: "Kitten Yarn Room", category: "Pet", src: "/backgrounds/pet-7b-kittenyarnroombunch-1080p-10s-loop-b96a8bb2113d4c849fb769ebbdf6715c.gif" },
  { id: "retirement-golf-course-sunrise", label: "Golf Course Sunrise", category: "Retirement", src: "/backgrounds/retirement-3-golfcoursesunrise-1080p-6s-loop-65965a64dacd4573913d174f933e8961.gif" },
  { id: "sympathy-lilies-and-candlelight", label: "Lilies and Candlelight", category: "Sympathy", src: "/backgrounds/sympathy-1-liliescandlelight-1080p-6s-loop-c5e3349c55e54971a323687b7240ba01.gif" },
  { id: "teen-skate-park-sunset", label: "Skate Park Sunset", category: "Teen", src: "/backgrounds/teen-13to17-3-skateparksunset-1080p-6s-loop-8ed93efc23334d8cb441d7c1772f53b9.gif" },
  { id: "teen-kawaii-pastel-sticker-world", label: "Kawaii Pastel Sticker World", category: "Teen", src: "/backgrounds/teen-13to17-5-kawaiipastelstickerworld-1080p-6s-loop-9b7ac0ef6d0441e8948c2f8bd4d00601.gif" },
  { id: "teen-battle-royale-drop-island", label: "Battle Royale Drop Island", category: "Teen", src: "/backgrounds/teen2-1-battleroyaledropisland-1080p-6s-loop-22854650ff1d41718394542562ae284b.gif" },
  { id: "teen-sandbox-blocky-biome", label: "Sandbox Blocky Biome", category: "Teen", src: "/backgrounds/teen2-2-sandboxblockybiome-1080p-6s-loop-ac4dd2a6293b480db6539020f69beba4.gif" },
  { id: "valentine-s-heart-sparkler-night", label: "Heart Sparkler Night", category: "Valentine's", src: "/backgrounds/valentines-7-heartsparklernight-1080p-6s-loop-347d89e17d1b41a895082686541fefc9.gif" },
  { id: "valentine-s-cupid-rose-garden", label: "Cupid Rose Garden", category: "Valentine's", src: "/backgrounds/valentines-8-cupidrosegarden-1080p-6s-loop-437d3d8767de420e8b78d624091c6663.gif" },
  { id: "wedding-romantic-candle-cathedral", label: "Romantic Candle Cathedral", category: "Wedding", src: "/backgrounds/wedding-9-romanticcandlecathedral-1080p-6s-loop-6f738ab7b8914067bc09f29e739fda52.gif" },
];

export function findVideoBackground(id: string) {
  return VIDEO_BACKGROUNDS.find((v) => v.id === id) ?? VIDEO_BACKGROUNDS[0];
}
