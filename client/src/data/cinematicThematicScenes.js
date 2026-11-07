// 9 Distinct Thematic Scenes defined in TRIPONA Master Prompt:
// SCENE 01 — MOUNTAINS
// SCENE 02 — TROPICAL FORESTS
// SCENE 03 — WATERFALLS
// SCENE 04 — OCEANS
// SCENE 05 — DESERTS
// SCENE 06 — SNOW DESTINATIONS
// SCENE 07 — GLOBAL ARCHITECTURE
// SCENE 08 — AERIAL DESTINATIONS
// SCENE 09 — GLOBAL DESTINATION COLLECTION

export const THEMATIC_SCENES = [
  {
    id: 'scene-01-mountains',
    sceneNumber: '01',
    theme: 'MOUNTAINS',
    name: 'Swiss Alps & Himalayas',
    region: 'Alpine Mountain Peaks',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=2600&q=90',
    coordinates: '45.9763° N, 7.7491° E',
    vibe: 'Dramatic Mountain Peaks & Golden Sunrise Atmosphere'
  },
  {
    id: 'scene-02-forests',
    sceneNumber: '02',
    theme: 'TROPICAL FORESTS',
    name: 'Bali & Munnar Canopy',
    region: 'Tropical Rainforests',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=2600&q=90',
    coordinates: '8.3405° S, 115.0920° E',
    vibe: 'Dense Tropical Rainforests & Emerald Valley Canopies'
  },
  {
    id: 'scene-03-waterfalls',
    sceneNumber: '03',
    theme: 'WATERFALLS',
    name: 'South Coast Cascades',
    region: 'Glacial Waterfalls',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=2600&q=90',
    coordinates: '63.5321° N, 19.5114° W',
    vibe: 'Roaring Glacial Torrents & Misty Natural Textures'
  },
  {
    id: 'scene-04-oceans',
    sceneNumber: '04',
    theme: 'OCEANS',
    name: 'Maldives & Alappuzha',
    region: 'Turquoise Lagoons',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2600&q=90',
    coordinates: '3.2028° N, 73.2207° E',
    vibe: 'Crystal Turquoise Waters & Overwater Sanctuaries'
  },
  {
    id: 'scene-05-deserts',
    sceneNumber: '05',
    theme: 'DESERTS',
    name: 'Arabian Dunes, Dubai',
    region: 'Golden Desert Dunes',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2600&q=90',
    coordinates: '25.2048° N, 55.2708° E',
    vibe: 'Sweeping Golden Dunes & Twilight Desert Shadows'
  },
  {
    id: 'scene-06-snow',
    sceneNumber: '06',
    theme: 'SNOW DESTINATIONS',
    name: 'Zermatt Alpine Snow',
    region: 'Winter Glacial Lakes',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=2600&q=90',
    coordinates: '46.0207° N, 7.7491° E',
    vibe: 'Snow-Covered Alpine Peaks & Frozen Glacial Lakes'
  },
  {
    id: 'scene-07-architecture',
    sceneNumber: '07',
    theme: 'GLOBAL ARCHITECTURE',
    name: 'Paris & Kyoto Masterpieces',
    region: 'Iconic Global Landmarks',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2600&q=90',
    coordinates: '48.8566° N, 2.3522° E',
    vibe: 'Historic European Boulevards & Ancient Pagoda Sanctuaries'
  },
  {
    id: 'scene-08-aerial',
    sceneNumber: '08',
    theme: 'AERIAL DESTINATIONS',
    name: 'Amalfi Cliffs & Fjords',
    region: 'Aerial Coastal Wonders',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2600&q=90',
    coordinates: '40.6340° N, 14.6027° E',
    vibe: 'Dramatic Coastal Cliffs & Glacial Fjords From Above'
  },
  {
    id: 'scene-09-collection',
    sceneNumber: '09',
    theme: 'GLOBAL COLLECTION',
    name: 'Taj Mahal & Kerala Canals',
    region: 'Global Heritage Wonders',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2600&q=90',
    secondaryImage: 'https://images.unsplash.com/photo-1677700436033-92179d16a25f?w=2600&auto=format&fit=crop&q=85',
    coordinates: '27.1751° N, 78.0421° E',
    vibe: 'Timeless Marble Symmetries & Serene Palm Backwaters'
  }
];
