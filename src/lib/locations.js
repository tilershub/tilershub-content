// District data for programmatic location pages (/tilers/<district> and
// /services/<service>/<district>). Slugs must not collide with provider slugs —
// the /tilers/[slug] route checks districts first.

export const DISTRICT_INFO = [
  { slug: 'colombo',      name: 'Colombo',      nameSi: 'කොළඹ',          region: 'Western Province — Sri Lanka\'s commercial capital with the island\'s highest volume of apartment, house and bathroom renovation work.', towns: ['Colombo 1–15', 'Dehiwala', 'Mount Lavinia', 'Nugegoda', 'Maharagama', 'Kottawa', 'Piliyandala', 'Kaduwela', 'Battaramulla', 'Moratuwa'] },
  { slug: 'gampaha',      name: 'Gampaha',      nameSi: 'ගම්පහ',          region: 'Western Province — fast-growing residential belt north of Colombo with heavy new-house construction.', towns: ['Negombo', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Kadawatha', 'Kiribathgoda', 'Ragama', 'Minuwangoda', 'Nittambuwa'] },
  { slug: 'kalutara',     name: 'Kalutara',     nameSi: 'කළුතර',          region: 'Western Province — coastal district with strong villa, hotel and housing renovation demand.', towns: ['Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama', 'Matugama', 'Bandaragama'] },
  { slug: 'kandy',        name: 'Kandy',        nameSi: 'මහනුවර',         region: 'Central Province — the hill capital, with steady residential and commercial tiling work.', towns: ['Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya', 'Akurana', 'Kundasale'] },
  { slug: 'matale',       name: 'Matale',       nameSi: 'මාතලේ',          region: 'Central Province — growing residential construction around Matale and Dambulla.', towns: ['Matale', 'Dambulla', 'Galewela', 'Ukuwela', 'Rattota'] },
  { slug: 'nuwara-eliya', name: 'Nuwara Eliya', nameSi: 'නුවරඑළිය',       region: 'Central Province — hill-country homes and hotels needing cold-climate waterproofing and tiling.', towns: ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Ginigathena', 'Ragala'] },
  { slug: 'galle',        name: 'Galle',        nameSi: 'ගාල්ල',          region: 'Southern Province — villa and boutique-hotel renovation hub of the south coast.', towns: ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Karapitiya', 'Baddegama', 'Elpitiya'] },
  { slug: 'matara',       name: 'Matara',       nameSi: 'මාතර',           region: 'Southern Province — busy coastal district with new housing and guesthouse projects.', towns: ['Matara', 'Weligama', 'Mirissa', 'Akuressa', 'Dikwella', 'Hakmana'] },
  { slug: 'hambantota',   name: 'Hambantota',   nameSi: 'හම්බන්තොට',      region: 'Southern Province — developing region with new townships and infrastructure.', towns: ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota', 'Beliatta'] },
  { slug: 'jaffna',       name: 'Jaffna',       nameSi: 'යාපනය',          region: 'Northern Province — rebuilding and new-house construction across the peninsula.', towns: ['Jaffna', 'Nallur', 'Chavakachcheri', 'Point Pedro', 'Manipay'] },
  { slug: 'mannar',       name: 'Mannar',       nameSi: 'මන්නාරම',        region: 'Northern Province — coastal district with growing residential work.', towns: ['Mannar', 'Pesalai', 'Murunkan'] },
  { slug: 'vavuniya',     name: 'Vavuniya',     nameSi: 'වවුනියාව',       region: 'Northern Province — the gateway town of the north with steady construction.', towns: ['Vavuniya', 'Cheddikulam', 'Nedunkeni'] },
  { slug: 'mullaitivu',   name: 'Mullaitivu',   nameSi: 'මුලතිව්',        region: 'Northern Province — coastal district with ongoing rebuilding.', towns: ['Mullaitivu', 'Puthukkudiyiruppu', 'Oddusuddan'] },
  { slug: 'kilinochchi',  name: 'Kilinochchi',  nameSi: 'කිලිනොච්චිය',    region: 'Northern Province — agricultural district with new housing development.', towns: ['Kilinochchi', 'Pallai', 'Paranthan'] },
  { slug: 'batticaloa',   name: 'Batticaloa',   nameSi: 'මඩකලපුව',        region: 'Eastern Province — lagoon city with hotel and residential projects.', towns: ['Batticaloa', 'Kattankudy', 'Eravur', 'Valaichchenai', 'Kaluwanchikudy'] },
  { slug: 'ampara',       name: 'Ampara',       nameSi: 'අම්පාර',         region: 'Eastern Province — large district including the Arugam Bay tourist belt.', towns: ['Ampara', 'Kalmunai', 'Akkaraipattu', 'Sammanthurai', 'Pottuvil'] },
  { slug: 'trincomalee',  name: 'Trincomalee',  nameSi: 'ත්‍රිකුණාමලය',   region: 'Eastern Province — harbour city with hotel and housing growth.', towns: ['Trincomalee', 'Kinniya', 'Muttur', 'Kantale', 'Nilaveli'] },
  { slug: 'kurunegala',   name: 'Kurunegala',   nameSi: 'කුරුණෑගල',       region: 'North Western Province — one of the busiest house-building districts outside the Western Province.', towns: ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Wariyapola', 'Mawathagama', 'Pannala'] },
  { slug: 'puttalam',     name: 'Puttalam',     nameSi: 'පුත්තලම',        region: 'North Western Province — coastal district including the fast-growing Wennappuwa–Marawila belt.', towns: ['Puttalam', 'Chilaw', 'Wennappuwa', 'Marawila', 'Dankotuwa', 'Anamaduwa'] },
  { slug: 'anuradhapura', name: 'Anuradhapura', nameSi: 'අනුරාධපුරය',     region: 'North Central Province — the largest district with steady residential construction.', towns: ['Anuradhapura', 'Kekirawa', 'Medawachchiya', 'Thambuttegama', 'Eppawala'] },
  { slug: 'polonnaruwa',  name: 'Polonnaruwa',  nameSi: 'පොළොන්නරුව',     region: 'North Central Province — agricultural heartland with growing town centres.', towns: ['Polonnaruwa', 'Kaduruwela', 'Hingurakgoda', 'Medirigiriya'] },
  { slug: 'badulla',      name: 'Badulla',      nameSi: 'බදුල්ල',         region: 'Uva Province — hill district including the booming Ella–Bandarawela tourism strip.', towns: ['Badulla', 'Bandarawela', 'Ella', 'Haputale', 'Welimada', 'Mahiyanganaya'] },
  { slug: 'monaragala',   name: 'Monaragala',   nameSi: 'මොනරාගල',        region: 'Uva Province — developing district with new residential projects.', towns: ['Monaragala', 'Wellawaya', 'Bibile', 'Buttala'] },
  { slug: 'ratnapura',    name: 'Ratnapura',    nameSi: 'රත්නපුර',        region: 'Sabaragamuwa Province — the gem city and surrounding towns with active house construction.', towns: ['Ratnapura', 'Embilipitiya', 'Balangoda', 'Pelmadulla', 'Eheliyagoda'] },
  { slug: 'kegalle',      name: 'Kegalle',      nameSi: 'කෑගල්ල',         region: 'Sabaragamuwa Province — between Colombo and Kandy, with steady renovation demand.', towns: ['Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana', 'Ruwanwella'] },
]

// Top services that get a dedicated page per district (~150 pages)
export const LOCATION_SERVICE_SLUGS = [
  'floor-tiling',
  'wall-tiling',
  'waterproofing',
  'bathroom-plumbing',
  'gypsum-ceiling',
  'house-painting',
]

export function districtBySlug(slug) {
  return DISTRICT_INFO.find(d => d.slug === String(slug || '').toLowerCase()) || null
}

export function districtPath(d) {
  return `https://wedahub.lk/tilers/${d.slug}`
}

export function serviceDistrictPath(serviceSlug, d) {
  return `https://wedahub.lk/services/${serviceSlug}/${d.slug}`
}

// 4 nearest/related districts for cross-linking (simple curated adjacency)
const NEIGHBORS = {
  colombo: ['gampaha', 'kalutara', 'kegalle', 'ratnapura'],
  gampaha: ['colombo', 'kurunegala', 'puttalam', 'kegalle'],
  kalutara: ['colombo', 'galle', 'ratnapura', 'gampaha'],
  kandy: ['matale', 'nuwara-eliya', 'kegalle', 'kurunegala'],
  matale: ['kandy', 'kurunegala', 'anuradhapura', 'polonnaruwa'],
  'nuwara-eliya': ['kandy', 'badulla', 'ratnapura', 'matale'],
  galle: ['matara', 'kalutara', 'ratnapura', 'hambantota'],
  matara: ['galle', 'hambantota', 'ratnapura', 'kalutara'],
  hambantota: ['matara', 'monaragala', 'ratnapura', 'galle'],
  jaffna: ['kilinochchi', 'mullaitivu', 'mannar', 'vavuniya'],
  mannar: ['vavuniya', 'kilinochchi', 'jaffna', 'puttalam'],
  vavuniya: ['anuradhapura', 'mannar', 'kilinochchi', 'mullaitivu'],
  mullaitivu: ['kilinochchi', 'vavuniya', 'jaffna', 'trincomalee'],
  kilinochchi: ['jaffna', 'mullaitivu', 'vavuniya', 'mannar'],
  batticaloa: ['ampara', 'trincomalee', 'polonnaruwa', 'monaragala'],
  ampara: ['batticaloa', 'monaragala', 'badulla', 'polonnaruwa'],
  trincomalee: ['batticaloa', 'polonnaruwa', 'anuradhapura', 'vavuniya'],
  kurunegala: ['gampaha', 'puttalam', 'matale', 'kegalle'],
  puttalam: ['kurunegala', 'gampaha', 'anuradhapura', 'mannar'],
  anuradhapura: ['kurunegala', 'polonnaruwa', 'vavuniya', 'matale'],
  polonnaruwa: ['anuradhapura', 'matale', 'batticaloa', 'trincomalee'],
  badulla: ['monaragala', 'nuwara-eliya', 'ampara', 'ratnapura'],
  monaragala: ['badulla', 'hambantota', 'ampara', 'ratnapura'],
  ratnapura: ['kegalle', 'kalutara', 'nuwara-eliya', 'badulla'],
  kegalle: ['colombo', 'kandy', 'kurunegala', 'ratnapura'],
}

export function neighborDistricts(slug) {
  return (NEIGHBORS[slug] || []).map(districtBySlug).filter(Boolean)
}
