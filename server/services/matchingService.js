/**
 * Rule-based Smart Food-to-NGO Matching Engine (HACK-P197)
 * Calculates match score up to 100 points based on:
 * - Distance compatibility (30 pts)
 * - Food category compatibility (25 pts)
 * - Dietary compatibility (20 pts)
 * - Quantity compatibility (15 pts)
 * - Pickup time compatibility (10 pts)
 */

// Haversine distance in kilometers
const calculateDistanceKm = (coord1, coord2) => {
  if (!coord1?.lat || !coord1?.lng || !coord2?.lat || !coord2?.lng) return null;
  const toRad = x => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

const calculateMatchScore = (donation, ngoOrg) => {
  let score = 0;
  const reasons = [];
  let distanceKm = null;

  // 1. Distance compatibility (30 points)
  if (donation.coordinates && ngoOrg.coordinates) {
    distanceKm = calculateDistanceKm(donation.coordinates, ngoOrg.coordinates);
    if (distanceKm !== null) {
      if (distanceKm <= 5) {
        score += 30;
        reasons.push(`Very close location (${distanceKm} km away)`);
      } else if (distanceKm <= 12) {
        score += 22;
        reasons.push(`Moderate proximity (${distanceKm} km away)`);
      } else if (distanceKm <= 25) {
        score += 14;
        reasons.push(`Within metropolitan transit radius (${distanceKm} km away)`);
      } else {
        score += 5;
        reasons.push(`Extended distance (${distanceKm} km away)`);
      }
    }
  } else if (
    donation.pickupLocation?.locality &&
    ngoOrg.locality &&
    donation.pickupLocation.locality.toLowerCase() === ngoOrg.locality.toLowerCase()
  ) {
    score += 25;
    reasons.push(`Same locality (${ngoOrg.locality})`);
  } else if (
    donation.pickupLocation?.city &&
    ngoOrg.city &&
    donation.pickupLocation.city.toLowerCase() === ngoOrg.city.toLowerCase()
  ) {
    score += 15;
    reasons.push(`Same city (${ngoOrg.city})`);
  } else {
    score += 5;
  }

  // 2. Food category compatibility (25 points)
  const preferences = Array.isArray(ngoOrg.foodPreferences) ? ngoOrg.foodPreferences : [];
  const prefLower = preferences.map(p => p.toLowerCase());
  const catLower = (donation.category || '').toLowerCase();

  if (prefLower.includes(catLower) || prefLower.includes('all') || prefLower.length === 0) {
    score += 25;
    reasons.push(`Category aligns with recipient preferences (${donation.category})`);
  } else {
    score += 10;
  }

  // 3. Dietary compatibility (20 points)
  const dietary = (donation.dietaryType || 'veg').toLowerCase();
  if (dietary === 'veg' || dietary === 'vegan') {
    score += 20;
    reasons.push('High acceptance dietary type (Vegetarian / Vegan)');
  } else if (prefLower.includes('non-veg') || prefLower.includes('all')) {
    score += 18;
    reasons.push('Accepted non-vegetarian item for eligible centers');
  } else {
    score += 12;
  }

  // 4. Quantity compatibility vs NGO daily capacity (15 points)
  const capacity = ngoOrg.capacity || 100;
  const qty = donation.availableQuantity || 0;
  if (qty <= capacity && qty >= 5) {
    score += 15;
    reasons.push(`Quantity fits within NGO distribution capacity (${qty} of ${capacity} meals/units)`);
  } else if (qty > capacity) {
    score += 10;
    reasons.push(`Large quantity - NGO can request a partial portion`);
  } else {
    score += 8;
  }

  // 5. Pickup time compatibility (10 points)
  const deadline = new Date(donation.pickupDeadline);
  const now = new Date();
  const hoursLeft = (deadline - now) / (1000 * 60 * 60);

  if (hoursLeft >= 3) {
    score += 10;
    reasons.push(`Sufficient pickup window (${Math.round(hoursLeft)} hours remaining)`);
  } else if (hoursLeft >= 1) {
    score += 6;
    reasons.push(`Urgent pickup required (less than ${Math.round(hoursLeft)} hours left)`);
  } else if (hoursLeft > 0) {
    score += 2;
    reasons.push('Immediate collection needed');
  }

  return {
    matchScore: Math.min(100, Math.round(score)),
    reasons,
    distanceKm
  };
};

module.exports = {
  calculateMatchScore,
  calculateDistanceKm
};
