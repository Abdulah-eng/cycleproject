
import { calculateBikeMetrics } from '../lib/utils';
import en from '../dictionaries/en.json';

// Mocks
const mockBike = {
    id: 1,
    brand: 'Test',
    model: 'Test',
    year: 2024,
    price: 1000,
    slug: 'test',
    category: 'Road',
    sub_category: 'Race',
    images: [],
    vfm_score_1_to_10: 10,
    build_1_10: 10,
    speed_index: 10,
    climb_1_10: 10,
    aero_1_10: 10,
    fit_flexibility_1_10: 10,
    posture_1_10: 10,
    ride_comfort_1_10: 10,
    responsiveness_1_10: 10,

    // Test low scores too
    // We need to iterate all possible score ranges?
};

function checkKey(key: string, dict: any) {
    if (!key) return;
    const parts = key.split('.');
    let current = dict;
    for (const part of parts) {
        if (current && current[part]) {
            current = current[part];
        } else {
            console.error(`Missing key: ${key}`);
            return false;
        }
    }
    console.log(`Found key: ${key} -> ${current}`);
    return true;
}

// We need to expose the label generator functions from utils or just iterate logic
// Since helpers are internal to calculateBikeMetrics, we can only check the OUTPUT of the function.

// Let's create bikes with scores that trigger different buckets
const scores = [0, 4, 5, 6, 7, 8, 8.5, 9, 10];
const metricKeys = ['performance', 'value', 'fit', 'general', 'speed', 'climingEfficiency', 'aerodynamics', 'ridingPosition', 'handling', 'fitFlexibility', 'rideComfort', 'buildQuality', 'valueForMoney', 'battery'];

scores.forEach(s => {
    const bike = {
        ...mockBike,
        vfm_score_1_to_10: s,
        build_1_10: s,
        speed_index: s,
        climb_1_10: s,
        aero_1_10: s,
        fit_flexibility_1_10: s,
        posture_1_10: s,
        ride_comfort_1_10: s,
        responsiveness_1_10: s,
        category: 'e-bikeroad' // trigger battery
    };
    const metrics = calculateBikeMetrics(bike as any);

    metricKeys.forEach(mKey => {
        // @ts-ignore
        const m = metrics[mKey];
        if (m && m.description) {
            checkKey(m.description, en);
        }
    });
});

// Check surface_range fallback
const bikeSurf = { ...mockBike, surface_range: null };
const mSurf = calculateBikeMetrics(bikeSurf as any);
// @ts-ignore
checkKey(mSurf.surfaceRange.description, en);
