import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from '../models/Destination.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tripona';

const initialDestinations = [
  {
    slug: "swiss-alps",
    name: "Zermatt & Swiss Alps",
    country: "Switzerland",
    continent: "Europe",
    tagline: "Glacial majesty beneath the iconic Matterhorn summit",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$140 / day",
      standard: "$280 / day",
      premium: "$490 / day",
      luxury: "$950 / day"
    },
    currency: "CHF (Swiss Franc)",
    bestSeason: "Dec - Apr (Winter/Ski) or Jul - Sep (Hiking)",
    weather: "Cool Alpine, 14°C Summer / -6°C Winter",
    rating: 4.95,
    reviewsCount: 1420,
    travelStyle: ["adventure", "nature-explorer", "luxury-escape", "photography-journey"],
    isTopInternational: true,
    isPopular: true,
    isTrending: true,
    overview: "Nestled at the base of the majestic Matterhorn, Zermatt is a car-free alpine wonderland renowned worldwide for year-round skiing, dramatic cogwheel train rides to the Gornergrat, and world-class mountain huts serving authentic fondue.",
    attractions: [
      { name: "Gornergrat Railway", desc: "Europe's highest open-air cogwheel railway with 360-degree Matterhorn views." },
      { name: "Matterhorn Glacier Paradise", desc: "Highest cable car station in Europe with glacier palace and ice sculptures." },
      { name: "Sunnegga & Five Lakes Walk", desc: "Idyllic hiking trail reflecting the Matterhorn in crystal clear alpine tarns." },
      { name: "Old Hinterdorf Village", desc: "Historic wooden chalets and barns dating back to the 16th century." }
    ],
    localCulture: "Rooted in Valaisian mountain grit, Swiss precision, and alpine warmth. English and German widely spoken.",
    foodRecommendations: ["Swiss Cheese Fondue & Raclette", "Valais dried meat platter", "Alpine Rösti with fried egg", "Artisanal mountain chocolates"],
    travelTips: ["Purchase a Swiss Travel Pass for seamless train & boat travel across the country.", "Book Gornergrat tickets early for the first sunrise departure.", "Wear layered clothing even in July—glacier peaks stay chilly."],
    coordinates: { lat: 45.9765, lng: 7.7491 }
  },
  {
    slug: "santorini",
    name: "Santorini (Thira)",
    country: "Greece",
    continent: "Europe",
    tagline: "Caldera sunsets, whitewashed villages & Aegean serenity",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$90 / day",
      standard: "$210 / day",
      premium: "$390 / day",
      luxury: "$800 / day"
    },
    currency: "EUR (Euro)",
    bestSeason: "May - Oct (Warm Aegean Sunshine)",
    weather: "Mediterranean, 27°C Summer / 15°C Winter",
    rating: 4.92,
    reviewsCount: 2310,
    travelStyle: ["romantic-getaway", "beach-escape", "cultural-journey", "photography-journey"],
    isTopInternational: true,
    isPopular: true,
    overview: "Carved from the rim of an ancient volcanic crater, Santorini mesmerizes with its gleaming white cube buildings, blue dome churches, dramatic cliffside infinity pools, and legendary sunsets in Oia.",
    attractions: [
      { name: "Oia Castle Sunset Point", desc: "World-famous vantage point for the sun dipping beneath the Aegean horizon." },
      { name: "Fira to Oia Caldera Hike", desc: "10-km breathtaking cliff-edge trail with nonstop panoramic sea views." },
      { name: "Akrotiri Prehistoric Ruins", desc: "Remarkably preserved Bronze Age Minoan volcanic settlement." },
      { name: "Red Beach & Perissa Black Sands", desc: "Striking volcanic shorelines framed by oxidized terracotta cliffs." }
    ],
    localCulture: "Generous Greek filoxenia (hospitality), lively bouzouki music in seaside tavernas, and centuries of maritime pride.",
    foodRecommendations: ["Fresh grilled octopus drizzled with lemon olive oil", "Tomatokeftedes (Santorini tomato fritters)", "Assyrtiko crisp volcanic white wine", "Fava me Koukia dip"],
    travelTips: ["Visit Oia sunset early to avoid crowds or book a cliffside catamaran cruise.", "Wear sturdy walking shoes for the cobblestones and marble steps."],
    coordinates: { lat: 36.3932, lng: 25.4615 }
  },
  {
    slug: "kyoto",
    name: "Kyoto & Mount Fuji Region",
    country: "Japan",
    continent: "Asia",
    tagline: "Bamboo groves, ancient torii gates & sacred shrines",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$85 / day",
      standard: "$180 / day",
      premium: "$360 / day",
      luxury: "$750 / day"
    },
    currency: "JPY (Japanese Yen)",
    bestSeason: "Mar - May (Cherry Blossoms) or Oct - Nov (Autumn Foliage)",
    weather: "Temperate, 22°C Spring / 12°C Autumn",
    rating: 4.98,
    reviewsCount: 3840,
    travelStyle: ["cultural-journey", "culinary-journey", "smart-ai", "photography-journey"],
    isTopInternational: true,
    isPopular: true,
    isTrending: true,
    overview: "The thousand-year capital of imperial Japan, Kyoto boasts over 2,000 temples and shrines alongside peaceful zen stone gardens, preserved geisha districts in Gion, and traditional Kaiseki culinary dining.",
    attractions: [
      { name: "Fushimi Inari-taisha", desc: "Thousands of vermillion torii gates winding up sacred Mount Inari." },
      { name: "Arashiyama Bamboo Grove", desc: "Towering green bamboo stalks creating an ethereal acoustic sanctuary." },
      { name: "Kinkaku-ji (Golden Pavilion)", desc: "Zen Buddhist temple coated in pure gold leaf reflecting onto the mirror pond." },
      { name: "Lake Kawaguchiko & Mt. Fuji", desc: "Iconic snow-capped Fuji mirrored across tranquil northern lakes." }
    ],
    localCulture: "Rooted in omotenashi (mindful hospitality), zen mindfulness, quiet respect in public spaces, and seasonal reverence.",
    foodRecommendations: ["Traditional Kyoto Kaiseki multi-course dinner", "Fresh Matcha Parfait in Uji", "Nishiki Market wagyu skewers & unagi", "Yudofu (delicate simmered artisan tofu)"],
    travelTips: ["Arrive at Fushimi Inari at dawn (6:00 AM) for tranquil photography with no crowds.", "Keep cash handy as many traditional temple stalls prefer yen coins."],
    coordinates: { lat: 35.0116, lng: 135.7681 }
  },
  {
    slug: "bali",
    name: "Bali & Nusa Penida",
    country: "Indonesia",
    continent: "Asia",
    tagline: "Emerald rice terraces, spiritual water temples & surf breaks",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$45 / day",
      standard: "$95 / day",
      premium: "$220 / day",
      luxury: "$550 / day"
    },
    currency: "IDR (Indonesian Rupiah)",
    bestSeason: "Apr - Oct (Dry Season, Sunny & Low Humidity)",
    weather: "Tropical, 28°C Year-Round",
    rating: 4.88,
    reviewsCount: 2950,
    travelStyle: ["beach-escape", "nature-explorer", "adventure", "romantic-getaway"],
    isTopInternational: true,
    isPopular: true,
    overview: "The 'Island of the Gods' blends lush Ubud jungle sanctuaries, cliffside Uluwatu temples, volcanic sunrise treks, and the dramatic T-Rex coastal cliffs of neighboring Nusa Penida island.",
    attractions: [
      { name: "Tegallalang Rice Terraces", desc: "UNESCO cultural landscape with cascading green paddy fields and jungle swings." },
      { name: "Uluwatu Temple & Kecak Dance", desc: "Perched 70 meters atop dramatic limestone cliffs with fire dance at sunset." },
      { name: "Kelingking Beach (Nusa Penida)", desc: "Iconic T-Rex shaped ridge plunging into turquoise coral waters." },
      { name: "Tirta Empul Holy Water Temple", desc: "Centuries-old Balinese Hindu purification springs nestled in the jungle." }
    ],
    localCulture: "Balinese Hinduism infused with daily flower offerings (canang sari), gamelan music, and deeply community-first lifestyle.",
    foodRecommendations: ["Babi Guling (crispy spiced suckling pig)", "Nasi Campur Bali with sambal matah", "Ayam Betutu (slow-roasted banana-leaf spiced chicken)", "Fresh young green coconuts"],
    travelTips: ["Dress respectfully with a sarong when entering holy temples.", "Hire an experienced private driver for effortless day excursions across Ubud."],
    coordinates: { lat: -8.4095, lng: 115.1889 }
  },
  {
    slug: "paris",
    name: "Paris & Versailles",
    country: "France",
    continent: "Europe",
    tagline: "Haute couture, Louvre masterpieces & sidewalk café culture",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$95 / day",
      standard: "$220 / day",
      premium: "$430 / day",
      luxury: "$890 / day"
    },
    currency: "EUR (Euro)",
    bestSeason: "Apr - Jun or Sep - Oct (Mild & Romantic Autumn)",
    weather: "Temperate, 20°C Spring / 15°C Autumn",
    rating: 4.90,
    reviewsCount: 4210,
    travelStyle: ["cultural-journey", "culinary-journey", "romantic-getaway", "luxury-escape"],
    isTopInternational: true,
    isPopular: true,
    overview: "The City of Light radiates timeless sophistication: stroll along the Seine, admire the iron lace of the Eiffel Tower sparkling at midnight, marvel at the Mona Lisa in the Louvre, and discover intimate bistros in Le Marais.",
    attractions: [
      { name: "Eiffel Tower & Champ de Mars", desc: "Iconic iron landmark offering panoramic views across the Parisian skyline." },
      { name: "Musée du Louvre", desc: "World's largest museum housing the Mona Lisa and Venus de Milo." },
      { name: "Palace of Versailles", desc: "Opulent royal chateau featuring the Hall of Mirrors and grand manicured fountains." },
      { name: "Montmartre & Sacré-Cœur", desc: "Bohemian hilltop with cobblestone alleys and panoramic city views." }
    ],
    localCulture: "The art of flânerie (leisurely urban strolling), passionate debates over espresso, and devotion to culinary artistry.",
    foodRecommendations: ["Warm butter croissants & pain au chocolat from local boulangeries", "Steak frites with Béarnaise sauce", "Duck Confit in Saint-Germain", "French macarons & artisanal crêpes"],
    travelTips: ["Book Louvre and Versailles tickets timed in advance to skip hours of queues.", "Use the Paris Métro for speedy transport across the arrondissements."],
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    slug: "banff",
    name: "Banff & Lake Louise",
    country: "Canada",
    continent: "North America",
    tagline: "Glacier-fed turquoise lakes surrounded by Rocky Mountain spires",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$90 / day",
      standard: "$195 / day",
      premium: "$380 / day",
      luxury: "$720 / day"
    },
    currency: "CAD (Canadian Dollar)",
    bestSeason: "Jun - Sep (Canoeing & Hiking) or Dec - Mar (Snowboarding)",
    weather: "Subalpine, 22°C Summer / -10°C Winter",
    rating: 4.96,
    reviewsCount: 1640,
    travelStyle: ["nature-explorer", "adventure", "wildlife-explorer", "photography-journey"],
    isTopInternational: true,
    isHiddenGem: false,
    overview: "Canada's first national park features unreal turquoise lakes fed by melting glaciers, rugged wilderness teeming with elk and grizzly bears, scenic hot springs, and legendary mountain lodge hospitality.",
    attractions: [
      { name: "Lake Louise & Victoria Glacier", desc: "Vibrant neon-turquoise glacial lake with famous Fairmont Chateau." },
      { name: "Moraine Lake & Valley of the Ten Peaks", desc: "World-famous sapphire blue lake framed by ten dramatic summits." },
      { name: "Icefields Parkway", desc: "One of the most scenic highway drives on earth, passing ancient glaciers." },
      { name: "Banff Gondola & Sulphur Mountain", desc: "Ride to 2,281m summit for 360-degree Rocky Mountain vistas." }
    ],
    localCulture: "Canadian outdoor enthusiasm, indigenous respect for pristine wilderness, and cosy evening log fires.",
    foodRecommendations: ["Alberta AAA Bison & Elk steaks", "Poutine with rich gravy & cheese curds", "Warm maple butter tarts", "Wild berry crumble"],
    travelTips: ["Moraine Lake requires shuttle reservations booked well in advance.", "Carry bear spray when hiking wilderness backcountry trails."],
    coordinates: { lat: 51.1784, lng: -115.5708 }
  },
  {
    slug: "tromso",
    name: "Tromsø & The Arctic Fjords",
    country: "Norway",
    continent: "Europe",
    tagline: "Chasing the Northern Lights across crystalline Arctic waters",
    image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$120 / day",
      standard: "$240 / day",
      premium: "$450 / day",
      luxury: "$880 / day"
    },
    currency: "NOK (Norwegian Krone)",
    bestSeason: "Oct - Mar (Aurora Borealis & Whales)",
    weather: "Arctic Maritime, -4°C Winter / 12°C Summer",
    rating: 4.94,
    reviewsCount: 980,
    travelStyle: ["nature-explorer", "adventure", "photography-journey", "smart-ai"],
    isTopInternational: true,
    isHiddenGem: true,
    overview: "Known as the Gateway to the Arctic, Tromsø sits 350 kilometres north of the Arctic Circle. By winter, dark skies dance with aurora borealis and orcas breach in frosty fjords; by summer, the midnight sun never sets.",
    attractions: [
      { name: "Chasing the Aurora Borealis", desc: "Guided mobile excursions out into the cloud-free inland microclimates." },
      { name: "Fjellheisen Cable Car", desc: "Lookout over Tromsø island, bridge, and surrounding snowy peaks." },
      { name: "Fjord Wildlife Cruise", desc: "Electric catamarans silently tracking humpback whales and sea eagles." },
      { name: "Sami Reindeer Camp", desc: "Experience indigenous Sami storytelling, joik songs, and reindeer feeding." }
    ],
    localCulture: "Warm Nordic 'koselig' mindset, deep sea heritage, and harmonious co-existence with the Arctic seasons.",
    foodRecommendations: ["Fresh Arctic king crab legs", "Slow-cooked reindeer stew (Bidos)", "Smoked Arctic char", "Norwegian brown goat cheese (Brunost) on warm waffles"],
    travelTips: ["Download an Aurora forecast app to monitor solar KP-index activity.", "Wear thermal wool base layers—synthetic cotton won't keep you warm in sub-zero winds."],
    coordinates: { lat: 69.6492, lng: 18.9553 }
  },
  {
    slug: "cappadocia",
    name: "Cappadocia (Göreme)",
    country: "Turkey",
    continent: "Europe / Asia",
    tagline: "Fairy chimneys, underground cities & sunrise hot air balloons",
    image: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$55 / day",
      standard: "$120 / day",
      premium: "$260 / day",
      luxury: "$600 / day"
    },
    currency: "TRY (Turkish Lira)",
    bestSeason: "Apr - Jun or Sep - Oct (Gentle Winds & Pleasant Weather)",
    weather: "Continental, 24°C Spring / 18°C Autumn",
    rating: 4.91,
    reviewsCount: 1820,
    travelStyle: ["adventure", "romantic-getaway", "cultural-journey", "photography-journey"],
    isTopInternational: true,
    isTrending: true,
    overview: "A dreamscape carved by wind and ancient volcanoes, Cappadocia features whimsical fairy chimney rock spires, centuries-old cave dwellings turned into luxury boutique hotels, and skies filled with hundreds of hot air balloons at dawn.",
    attractions: [
      { name: "Sunrise Hot Air Balloon Flight", desc: "Float over the Rose & Love Valleys as hundreds of balloons illuminate the dawn." },
      { name: "Derinkuyu Underground City", desc: "Multi-level subterranean city built to shelter 20,000 people from invaders." },
      { name: "Göreme Open Air Museum", desc: "Rock-cut monastic churches decorated with intricate 10th-century Byzantine frescoes." },
      { name: "Uçhisar Rock Castle", desc: "Highest elevation in Cappadocia with sweeping 360-degree desert rock vistas." }
    ],
    localCulture: "Generous Anatolian hospitality, carpet weaving traditions, and centuries of artisan pottery along the Red River.",
    foodRecommendations: ["Testi Kebab (meat slow-cooked in a sealed clay pot cracked open at your table)", "Turkish breakfast feast (Kahvaltı) with honeycomb", "Manti (tiny lamb dumplings with garlicky yogurt)", "Baklava with fresh Pistachios"],
    travelTips: ["Stay in an authentic cave hotel room for cool summers and warm winters.", "Book your hot air balloon for the first morning so weather delays don't ruin your flight."],
    coordinates: { lat: 38.6431, lng: 34.8289 }
  },
  {
    slug: "serengeti",
    name: "Serengeti & Ngorongoro",
    country: "Tanzania",
    continent: "Africa",
    tagline: "The Great Migration across boundless African savannahs",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$150 / day",
      standard: "$320 / day",
      premium: "$600 / day",
      luxury: "$1,300 / day"
    },
    currency: "TZS / USD",
    bestSeason: "Jun - Oct (Dry Season, River Crossings & Best Game Viewing)",
    weather: "Savannah Tropical, 26°C Day / 14°C Night",
    rating: 4.97,
    reviewsCount: 1120,
    travelStyle: ["wildlife-explorer", "adventure", "photography-journey", "nature-explorer"],
    isTopInternational: true,
    isHiddenGem: false,
    overview: "One of the greatest natural spectacles on Earth: millions of wildebeests, zebras, and gazelles brave crocodile-infested Mara rivers while prides of lions, cheetahs, and leopards roam the golden acacia-dotted plains.",
    attractions: [
      { name: "Great Wildebeest Migration", desc: "Spectacular dramatic river crossings and predator hunts across boundless plains." },
      { name: "Ngorongoro Crater Caldera", desc: "World's largest intact volcanic caldera boasting the densest concentration of Big Five wildlife." },
      { name: "Hot Air Safari Balloon over Seronera", desc: "Glide silently over herds of giraffes and elephants as the golden sun rises." },
      { name: "Olduvai Gorge & Maasai Villages", desc: "The 'Cradle of Humankind' hominid fossil site and Maasai cultural exchange." }
    ],
    localCulture: "Swahili warmth ('Karibu Sana'), deep reverence for conservation, and traditional Maasai pastoral lifestyle.",
    foodRecommendations: ["Nyama Choma (slow-roasted spiced meat)", "Ugali with Sukuma Wiki greens", "Fresh Zanzibar spiced tropical fruit", "Tangawizi ginger beer"],
    travelTips: ["Bring binoculars and a telephoto zoom lens (at least 300mm) for incredible wildlife shots.", "Pack warm layers for early dawn 5:30 AM open-top safari drives."],
    coordinates: { lat: -2.3333, lng: 34.8333 }
  },
  {
    slug: "taj-mahal",
    name: "Taj Mahal & Agra",
    country: "India",
    continent: "Asia",
    tagline: "UNESCO jewel in ivory-white marble and Mughal heritage",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$35 / day",
      standard: "$75 / day",
      premium: "$180 / day",
      luxury: "$450 / day"
    },
    currency: "INR (Indian Rupee)",
    bestSeason: "Oct - Mar (Crisp sunny mornings, cool evenings)",
    weather: "Subtropical, 24°C Winter / 38°C Summer",
    rating: 4.96,
    reviewsCount: 3890,
    travelStyle: ["cultural-journey", "photography-journey", "romantic-getaway"],
    isTopInternational: true,
    isPopular: true,
    isTrending: true,
    overview: "An immense mausoleum of white marble, built in Agra between 1631 and 1648 by the Mughal emperor Shah Jahan in memory of his favourite wife, the Taj Mahal is the jewel of Muslim art in India and one of the universally admired masterpieces of the world's heritage.",
    attractions: [
      { name: "Taj Mahal at Sunrise", desc: "Watch the translucent white marble shift from soft amber to pearl pink in morning mist." },
      { name: "Agra Fort (Red Fort)", desc: "Massive red sandstone fortress that served as the primary residence of Mughal emperors." },
      { name: "Mehtab Bagh (Moonlight Garden)", desc: "Lush botanical gardens offering iconic sunset vistas reflecting across the Yamuna River." },
      { name: "Fatehpur Sikri", desc: "Ghostly preserved 16th-century Mughal capital city just outside Agra." }
    ],
    localCulture: "Warm Indian hospitality, centuries of Mughal craftsmanship, intricate Pietra Dura marble inlay masters, and aromatic spice bazaars.",
    foodRecommendations: ["Agra Petha (candied ash gourd delicacy)", "Mughlai Biryani infused with saffron & cardamom", "Bedai with spicy Aloo Sabzi", "Tandoori Kebabs"],
    travelTips: ["Visit at 6:00 AM for sunrise opening to experience silence and the purest golden hour lighting.", "Book official online ASI e-tickets beforehand to skip lengthy queues."],
    coordinates: { lat: 27.1751, lng: 78.0421 }
  },
  {
    slug: "maldives",
    name: "Maldives & Coral Atolls",
    country: "Maldives",
    continent: "Asia",
    tagline: "Turquoise lagoons, overwater villas & pristine coral reefs",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$120 / day",
      standard: "$350 / day",
      premium: "$750 / day",
      luxury: "$1,800 / day"
    },
    currency: "MVR / USD",
    bestSeason: "Nov - Apr (Dry Northeast Monsoon, crystalline waters)",
    weather: "Tropical Equatorial, 29°C year-round",
    rating: 4.98,
    reviewsCount: 2180,
    travelStyle: ["beach-escape", "romantic-getaway", "luxury-escape"],
    isTopInternational: true,
    isPopular: true,
    isTrending: true,
    overview: "Scattered across the turquoise Indian Ocean like strands of glowing pearls, the Maldives represents the pinnacle of private island indulgence, vibrant manta ray reef diving, and serene overwater architecture.",
    attractions: [
      { name: "Baa Atoll UNESCO Biosphere", desc: "Swim alongside hundreds of feeding manta rays and gentle whale sharks." },
      { name: "Overwater Hammocks & Stargazing", desc: "Glass-bottomed bungalows floating over vibrant house reefs." },
      { name: "Vaadhoo Island 'Sea of Stars'", desc: "Bioluminescent phytoplankton turning crashing night waves into glowing neon blue." },
      { name: "Traditional Sunset Fishing & Sandbank Picnics", desc: "Sail on wooden Dhonis to remote deserted sandbanks." }
    ],
    localCulture: "Dhivehi island rhythm, maritime heritage, Boduberu drumming ceremonies, and ecological marine guardianship.",
    foodRecommendations: ["Mas Huni (tuna, coconut & chili breakfast with Roshi)", "Garudhiya fragrant fish broth", "Fresh lobster grilled over coconut husks", "Bis Keemiya crisp pastries"],
    travelTips: ["Book seaplane transfers scheduled with your arrival flight for panoramic aerial atoll views.", "Use reef-safe sunscreen to protect delicate coral reefs."],
    coordinates: { lat: 3.2028, lng: 73.2207 }
  },
  {
    slug: "new-york",
    name: "New York City",
    country: "United States",
    continent: "North America",
    tagline: "Electrifying skyline, world-class arts & legendary energy",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1200&q=80",
    estimatedBudget: {
      budget: "$130 / day",
      standard: "$260 / day",
      premium: "$520 / day",
      luxury: "$1,100 / day"
    },
    currency: "USD ($)",
    bestSeason: "Sep - Nov (Autumn foliage) or Apr - Jun (Spring blooms)",
    weather: "Temperate, 26°C Summer / 2°C Winter",
    rating: 4.91,
    reviewsCount: 4620,
    travelStyle: ["cultural-journey", "luxury-escape", "photography-journey"],
    isTopInternational: true,
    isPopular: true,
    isTrending: true,
    overview: "From the neon glow of Times Square and peaceful leafy ramble of Central Park to Broadway theatres and legendary skyline lookouts, New York City pulses with unmistakable global magnetism.",
    attractions: [
      { name: "The Summit One Vanderbilt & Top of the Rock", desc: "Mirrored observation decks floating thousands of feet above Manhattan." },
      { name: "Central Park & The Ramble", desc: "843 acres of tranquil lakes, historical arches, and lush woodlands in the city center." },
      { name: "Broadway & Museum of Modern Art (MoMA)", desc: "World-leading theatrical productions and iconic modern masterpieces." },
      { name: "Brooklyn Bridge Walk at Twilight", desc: "Cross the historic 1883 suspension bridge watching the financial district ignite in lights." }
    ],
    localCulture: "Fast-paced cosmopolitan spirit, neighborhood micro-cultures from Greenwich Village to DUMBO, and 24/7 artistic vibrancy.",
    foodRecommendations: ["Classic wood-fired New York thin-crust pizza", "Everything bagel with Nova lox and scallion cream cheese", "Pastrami on rye from historic delis", "Artisanal street food in Chelsea Market"],
    travelTips: ["Use the NYC Subway with contactless OMNY tap for fast and cost-effective travel.", "Walk the High Line elevated park for architectural views from Meatpacking to Hudson Yards."],
    coordinates: { lat: 40.7128, lng: -74.0060 }
  }
];

export async function seedDestinations() {
  try {
    await mongoose.connect(MONGODB_URI);
    for (const dest of initialDestinations) {
      await Destination.findOneAndUpdate(
        { slug: dest.slug },
        { $set: dest },
        { upsert: true, new: true }
      );
    }
    const count = await Destination.countDocuments();
    console.log(`✅ Seeded/Upserted destinations into MongoDB (Total: ${count}).`);
  } catch (err) {
    console.error("❌ Destination seeding error:", err);
  }
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seedDestinations.js')) {
  seedDestinations().then(() => process.exit(0));
}
