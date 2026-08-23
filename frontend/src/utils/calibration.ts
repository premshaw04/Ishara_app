/**
 * Calibration and Normalization utilities for Ishara Smart Glove
 */

export interface CalibrationProfile {
  isCalibrated: boolean;
  lastCalibratedAt: string | null;
  flexMin: number[]; // Flat hand / extended fingers (5 elements)
  flexMax: number[]; // Closed fist / bent fingers (5 elements)
  imuOffsets: number[]; // Flat on desk resting state (AccX, AccY, AccZ, GyroX, GyroY, GyroZ)
}

export const DEFAULT_CALIBRATION_PROFILE: CalibrationProfile = {
  isCalibrated: false,
  lastCalibratedAt: null,
  flexMin: [3000, 3000, 3000, 3000, 3000],
  flexMax: [1000, 1000, 1000, 1000, 1000],
  imuOffsets: [0, 0, 0, 0, 0, 0],
};

export const FINGER_NAMES = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'] as const;

/**
 * Normalizes a single raw flex sensor ADC reading into a percentage [0 - 100].
 * Handles both standard and inverted voltage divider wiring.
 *
 * @param raw - Current raw ADC reading from microcontroller
 * @param min - Calibrated baseline for flat / open hand
 * @param max - Calibrated baseline for bent fist
 * @returns number between 0 and 100
 */
export function normalizeFlexValue(raw: number, min: number, max: number): number {
  if (min === max) return 0;

  // Determine direction: whether bending increases or decreases ADC reading
  let percentage: number;
  if (max > min) {
    // Normal: bending increases ADC
    percentage = ((raw - min) / (max - min)) * 100;
  } else {
    // Inverted: bending decreases ADC
    percentage = ((min - raw) / (min - max)) * 100;
  }

  // Constrain to 0 - 100%
  return Math.min(Math.max(Math.round(percentage), 0), 100);
}

/**
 * Normalizes all 5 flex sensors at once.
 */
export function normalizeAllFlex(
  rawValues: number[],
  minValues: number[] = DEFAULT_CALIBRATION_PROFILE.flexMin,
  maxValues: number[] = DEFAULT_CALIBRATION_PROFILE.flexMax
): number[] {
  return rawValues.map((val, idx) => {
    const min = minValues[idx] ?? DEFAULT_CALIBRATION_PROFILE.flexMin[idx];
    const max = maxValues[idx] ?? DEFAULT_CALIBRATION_PROFILE.flexMax[idx];
    return normalizeFlexValue(val, min, max);
  });
}
