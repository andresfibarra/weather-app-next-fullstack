// src/utils/__tests__/time.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import convertToTime from '../time';

describe('convertToTime', () => {
  it('should convert a date to a time string with optional time zone name', () => {
    const timeWithName = convertToTime(1713321600, 'America/New_York', true);
    expect(timeWithName).toBe('10:40 PM EDT');
    const timeWithShortName = convertToTime(1713321600, 'GMT', true);
    expect(timeWithShortName).toBe('02:40 AM UTC');

    const timeWithoutName = convertToTime(1713321600, 'America/New_York', false);
    expect(timeWithoutName).toBe('10:40 PM');
  });

  it('handles different time zones differently', () => {
    const time1 = convertToTime(1713321600, 'America/New_York', true);
    const time2 = convertToTime(1713321600, 'America/Los_Angeles', true);
    expect(time1).not.toBe(time2);
  });
});
