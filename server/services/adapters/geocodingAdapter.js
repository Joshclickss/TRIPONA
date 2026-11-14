/**
 * TRIPONA PROVIDER ADAPTER: GEOCODING & SPATIAL LOOKUPS
 * Primary: GeoNames API (when GEONAMES_USERNAME is set)
 * Embedded High-Speed Fallback: SimpleMaps 50,250 World Cities Dataset + OpenStreetMap Nominatim
 */

import City from '../../models/City.js';

export const geocodingAdapter = {
  name: 'GeoNames & SimpleMaps World Geocoder',

  async geocode(query) {
    if (!query || typeof query !== 'string') return null;
    const cleanQuery = query.trim();

    // 1. Try GeoNames if username configured
    const geonamesUser = process.env.GEONAMES_USERNAME;
    if (geonamesUser && geonamesUser !== 'demo') {
      try {
        const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(cleanQuery)}&maxRows=1&username=${geonamesUser}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const item = data.geonames?.[0];
          if (item) {
            return {
              name: item.name,
              country: item.countryName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lng),
              population: item.population || 0,
              source: {
                name: 'GeoNames Geographical Database (Live API)',
                url: 'http://www.geonames.org',
                verificationStatus: 'VERIFIED_LIVE'
              }
            };
          }
        }
      } catch (err) {
        console.warn('GeoNames lookup error, falling back to SimpleMaps:', err.message);
      }
    }

    // 2. High-speed lookup in local SimpleMaps 50,250 World Cities DB
    try {
      const cityDoc = await City.findOne({
        $or: [
          { cityAscii: new RegExp('^' + cleanQuery + '$', 'i') },
          { city: new RegExp('^' + cleanQuery + '$', 'i') }
        ]
      }).sort({ population: -1 }).lean();

      if (cityDoc) {
        return {
          name: cityDoc.city,
          country: cityDoc.country,
          adminName: cityDoc.adminName,
          lat: cityDoc.lat,
          lng: cityDoc.lng,
          population: cityDoc.population,
          source: {
            name: 'SimpleMaps 50,000+ World Cities Database (Embedded)',
            url: 'https://simplemaps.com/data/world-cities',
            verificationStatus: 'VERIFIED_OFFICIAL'
          }
        };
      }
    } catch (dbErr) {
      console.warn('SimpleMaps DB lookup warning:', dbErr.message);
    }

    // 3. Fallback: OpenStreetMap Nominatim
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(cleanQuery)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'TriponaTravelEngine/1.0' } });
      if (res.ok) {
        const items = await res.json();
        const first = items[0];
        if (first) {
          return {
            name: first.display_name?.split(',')[0],
            country: first.display_name?.split(',').slice(-1)[0]?.trim(),
            lat: parseFloat(first.lat),
            lng: parseFloat(first.lon),
            population: 0,
            source: {
              name: 'OpenStreetMap Nominatim Live Geocoder',
              url: 'https://nominatim.openstreetmap.org',
              verificationStatus: 'VERIFIED_LIVE'
            }
          };
        }
      }
    } catch (osmErr) {}

    return null;
  }
};

export default geocodingAdapter;
