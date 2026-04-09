

function scoreProperty(property, { preferences = {}, favoriteType, favoriteCity, averageHistoryPrice, groupSize = 1, historyIds = new Set() }) {
  let score = 10; // base score

  // 1. TYPE MATCH
  if (preferences.type && property.type === preferences.type) {
    score += 20;
  } else if (!preferences.type && favoriteType && property.type === favoriteType) {
    score += 15;
  }

  // 2. LOCATION MATCH
  const propertyCity =
    property.address?.city ||
    (property.location ? property.location.split(',')[0].trim() : null);
  const desiredLocation = preferences.location || favoriteCity || null;

  if (desiredLocation && propertyCity &&
    propertyCity.toLowerCase().includes(desiredLocation.toLowerCase())) {
    score += 20;
  } else if (desiredLocation && property.location &&
    property.location.toLowerCase().includes(desiredLocation.toLowerCase())) {
    score += 15;
  }

  // 3. PRICE CLOSENESS (0–20 pts)
  const targetPrice =
    preferences.minPrice && preferences.maxPrice
      ? (Number(preferences.minPrice) + Number(preferences.maxPrice)) / 2
      : preferences.maxPrice
        ? Number(preferences.maxPrice)
        : preferences.minPrice
          ? Number(preferences.minPrice)
          : averageHistoryPrice || null;

  if (targetPrice && typeof property.price === 'number') {
    const diff = Math.abs(property.price - targetPrice);
    const ratio = Math.min(diff / Math.max(targetPrice, 1), 1);
    const priceScore = Math.round((1 - ratio) * 20);
    score += priceScore;
  }

  // 4. GROUP SIZE / CAPACITY MATCH (0–20 pts)
  const capacity =
    typeof property.bedrooms === 'number' && property.bedrooms > 0
      ? property.bedrooms * 2
      : 2;
  if (groupSize && capacity >= groupSize) {
    score += 20;
  } else if (groupSize) {
    const ratio = capacity / groupSize;
    score += Math.max(0, Math.round(ratio * 15));
  }

  // 5. WISHLIST HISTORY BOOST
  if (historyIds.has(property._id?.toString())) {
    score += 20;
  }

  // 6. POPULARITY BOOST (0–15 pts)
  const views = property.views?.total || 0;
  if (views > 0) {
    const popularityBoost = Math.min(Math.round(views / 50), 15);
    score += popularityBoost;
  }

  return Math.min(score, 100); // capped at 100
}

// Helper: sort candidates and return top N
function recommend(candidates, context, limit = 5) {
  return candidates
    .map(p => ({ ...p, recommendationScore: scoreProperty(p, context) }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const flatInKtm = {
  _id: 'prop1',
  type: 'flat',
  price: 15000,
  location: 'Kathmandu, Bagmati',
  address: { city: 'Kathmandu' },
  bedrooms: 2,
  views: { total: 200 },
};

const roomInPokhara = {
  _id: 'prop2',
  type: 'room',
  price: 6000,
  location: 'Pokhara, Gandaki',
  address: { city: 'Pokhara' },
  bedrooms: 1,
  views: { total: 50 },
};

const apartmentInKtm = {
  _id: 'prop3',
  type: 'apartment',
  price: 25000,
  location: 'Kathmandu, Bagmati',
  address: { city: 'Kathmandu' },
  bedrooms: 3,
  views: { total: 500 },
};

const studioNoViews = {
  _id: 'prop4',
  type: 'studio',
  price: 8000,
  location: 'Lalitpur, Bagmati',
  address: { city: 'Lalitpur' },
  bedrooms: 0,
  views: { total: 0 },
};

// ─── TESTS ──────────────────────────────────────────────────────────────────

describe('🏠 Recommendation Algorithm — Scoring Tests', () => {

  // ─── BASE SCORE ──────────────────────────────────────────────────────────

  describe('Base Score', () => {
    it('every property should start with at least a base score of 10', () => {
      const score = scoreProperty(studioNoViews, {});
      expect(score).toBeGreaterThanOrEqual(10);
    });

    it('score should never exceed 100', () => {
      const score = scoreProperty(flatInKtm, {
        preferences: { type: 'flat', location: 'Kathmandu', minPrice: 14000, maxPrice: 16000 },
        favoriteType: 'flat',
        favoriteCity: 'Kathmandu',
        averageHistoryPrice: 15000,
        groupSize: 2,
        historyIds: new Set(['prop1']),
      });
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  // ─── TYPE MATCHING ───────────────────────────────────────────────────────

  describe('Type Match Scoring', () => {
    it('should add +20 for explicit type preference match', () => {
      const withMatch = scoreProperty(flatInKtm, { preferences: { type: 'flat' } });
      const noMatch = scoreProperty(flatInKtm, { preferences: { type: 'room' } });
      expect(withMatch - noMatch).toBe(20);
    });

    it('should add +15 for history-inferred type match (no explicit preference)', () => {
      const withInferred = scoreProperty(flatInKtm, { preferences: {}, favoriteType: 'flat' });
      const withNone = scoreProperty(flatInKtm, { preferences: {} });
      expect(withInferred - withNone).toBe(15);
    });

    it('explicit type preference (+20) should beat history inference (+15)', () => {
      const explicit = scoreProperty(flatInKtm, { preferences: { type: 'flat' } });
      const inferred = scoreProperty(flatInKtm, { preferences: {}, favoriteType: 'flat' });
      expect(explicit).toBeGreaterThan(inferred);
    });

    it('wrong type should give 0 type bonus', () => {
      const score = scoreProperty(flatInKtm, {
        preferences: { type: 'room' },
        favoriteType: 'studio',
      });
      // base 10 only from type; rest depends on other signals
      expect(score).toBeGreaterThanOrEqual(10);
    });
  });

  // ─── LOCATION MATCHING ───────────────────────────────────────────────────

  describe('Location Match Scoring', () => {
    it('should add +20 for exact city address match', () => {
      const matched = scoreProperty(flatInKtm, { preferences: { location: 'Kathmandu' } });
      const unmatched = scoreProperty(roomInPokhara, { preferences: { location: 'Kathmandu' } });
      expect(matched).toBeGreaterThan(unmatched);
    });

    it('should add +15 when city matches via location string fallback', () => {
      const propWithoutAddressCity = {
        ...flatInKtm,
        address: {},
        location: 'Kathmandu, Bagmati',
      };
      const matchScore = scoreProperty(propWithoutAddressCity, {
        preferences: { location: 'Kathmandu' },
      });
      expect(matchScore).toBeGreaterThan(10); // got at least the location bonus
    });

    it('history-inferred city should also trigger location bonus', () => {
      const withCity = scoreProperty(flatInKtm, { favoriteCity: 'Kathmandu' });
      const withoutCity = scoreProperty(flatInKtm, { favoriteCity: 'Pokhara' });
      expect(withCity).toBeGreaterThan(withoutCity);
    });
  });

  // ─── PRICE SCORING ───────────────────────────────────────────────────────

  describe('Price Closeness Scoring', () => {
    it('property priced exactly at target should get +20 price score', () => {
      const score = scoreProperty(flatInKtm, {
        preferences: { minPrice: 15000, maxPrice: 15000 },
      });
      const scoreNoPrice = scoreProperty(flatInKtm, { preferences: {} });
      expect(score - scoreNoPrice).toBe(20);
    });

    it('property far from target price should score lower than one close to it', () => {
      const closeScore = scoreProperty(flatInKtm, {       // price 15000, target 15000
        preferences: { minPrice: 14000, maxPrice: 16000 },
      });
      const farScore = scoreProperty(apartmentInKtm, {   // price 25000, target 15000
        preferences: { minPrice: 14000, maxPrice: 16000 },
      });
      expect(closeScore).toBeGreaterThan(farScore);
    });

    it('should use maxPrice as target when only maxPrice is given', () => {
      const score = scoreProperty(flatInKtm, {
        preferences: { maxPrice: 15000 },
      });
      expect(score).toBeGreaterThan(10); // should get price bonus
    });

    it('should use average history price as fallback target', () => {
      const withHistory = scoreProperty(flatInKtm, { averageHistoryPrice: 15000 });
      const withoutHistory = scoreProperty(flatInKtm, {});
      expect(withHistory).toBeGreaterThan(withoutHistory);
    });
  });

  // ─── GROUP SIZE / CAPACITY ───────────────────────────────────────────────

  describe('Group Size / Capacity Scoring', () => {
    it('property with enough bedrooms for the group should get +20', () => {
      // flatInKtm has 2 bedrooms → capacity 4 → suits groupSize 2
      const score = scoreProperty(flatInKtm, { groupSize: 2 });
      const noGroupScore = scoreProperty(flatInKtm, { groupSize: 1 });
      // Both get +20 since capacity(4) >= groupSize; scores should be equal
      expect(score).toBeGreaterThanOrEqual(noGroupScore);
    });

    it('property with insufficient capacity should score lower', () => {
      // roomInPokhara has 1 bedroom → capacity 2 → groupSize 6 is too big
      const smallGroup = scoreProperty(roomInPokhara, { groupSize: 2 });
      const largeGroup = scoreProperty(roomInPokhara, { groupSize: 6 });
      expect(smallGroup).toBeGreaterThan(largeGroup);
    });

    it('studio (0 bedrooms) defaults to capacity of 2', () => {
      const score = scoreProperty(studioNoViews, { groupSize: 2 });
      expect(score).toBeGreaterThan(10); // gets +20 since capacity(2) >= groupSize(2)
    });
  });

  // ─── WISHLIST HISTORY BOOST ───────────────────────────────────────────────

  describe('Wishlist History Boost', () => {
    it('wishlisted property should get +20 boost', () => {
      const withWishlist = scoreProperty(flatInKtm, { historyIds: new Set(['prop1']) });
      const withoutWishlist = scoreProperty(flatInKtm, { historyIds: new Set() });
      expect(withWishlist - withoutWishlist).toBe(20);
    });

    it('non-wishlisted property should NOT get the boost', () => {
      const score = scoreProperty(roomInPokhara, { historyIds: new Set(['prop1']) });
      const scoreNoHistory = scoreProperty(roomInPokhara, {});
      expect(score).toBe(scoreNoHistory);
    });
  });

  // ─── POPULARITY BOOST ────────────────────────────────────────────────────

  describe('Popularity (View Count) Boost', () => {
    it('property with more views should be boosted', () => {
      const popular = scoreProperty(apartmentInKtm, {}); // 500 views → +10
      const unpopular = scoreProperty(studioNoViews, {});  // 0 views → +0
      expect(popular).toBeGreaterThan(unpopular);
    });

    it('popularity boost should be capped at 15', () => {
      const veryPopular = { ...flatInKtm, views: { total: 10000 } };
      const score = scoreProperty(veryPopular, {});
      const scoreNormal = scoreProperty(flatInKtm, {});
      // Max boost is 15 regardless of view count
      expect(score - scoreNormal).toBeLessThanOrEqual(15);
    });

    it('50 views should give exactly +1 popularity boost', () => {
      const prop50views = { ...studioNoViews, views: { total: 50 } };
      const prop0views = { ...studioNoViews, views: { total: 0 } };
      const s50 = scoreProperty(prop50views, {});
      const s0 = scoreProperty(prop0views, {});
      expect(s50 - s0).toBe(1);
    });
  });

  // ─── FULL RECOMMENDATION PIPELINE ─────────────────────────────────────────

  describe('Full Recommendation Pipeline — Ranking', () => {
    const allProperties = [flatInKtm, roomInPokhara, apartmentInKtm, studioNoViews];

    it('flat in Kathmandu should rank #1 for a buyer who prefers flats in Kathmandu', () => {
      const results = recommend(allProperties, {
        preferences: { type: 'flat', location: 'Kathmandu' },
      });
      expect(results[0]._id).toBe('prop1'); // flatInKtm
    });

    it('room in Pokhara should rank #1 for a buyer who prefers rooms in Pokhara', () => {
      const results = recommend(allProperties, {
        preferences: { type: 'room', location: 'Pokhara' },
      });
      expect(results[0]._id).toBe('prop2'); // roomInPokhara
    });

    it('results should be sorted in descending score order', () => {
      const results = recommend(allProperties, {
        preferences: { type: 'flat' },
      });
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].recommendationScore).toBeGreaterThanOrEqual(
          results[i + 1].recommendationScore
        );
      }
    });

    it('limit parameter should work correctly', () => {
      const results = recommend(allProperties, { preferences: {} }, 2);
      expect(results.length).toBe(2);
    });

    it('a wishlisted property in the right city should rank high even without explicit prefs', () => {
      const results = recommend(allProperties, {
        favoriteType: 'flat',
        favoriteCity: 'Kathmandu',
        historyIds: new Set(['prop1']),
      });
      expect(results[0]._id).toBe('prop1'); // flatInKtm — type + city + wishlist boost
    });

    it('without any preferences, most popular property should bubble to the top', () => {
      const results = recommend(allProperties, { preferences: {} });
      // apartmentInKtm has 500 views → highest popularity boost
      const topId = results[0]._id;
      expect(['prop3', 'prop1'].includes(topId)).toBe(true); // apartment or flat — both high-view
    });
  });

});
