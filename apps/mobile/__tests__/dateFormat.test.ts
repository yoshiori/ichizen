import {
  formatDate,
  formatDateByLanguage,
  formatMonthYear,
  formatMonthYearByLanguage,
  getMonthBoundaries
} from '../src/utils/dateFormat';

describe('dateFormat', () => {
  const testDate = new Date('2023-01-15T12:00:00Z');

  describe('formatDate', () => {
    it('should format date in Japanese locale', () => {
      const result = formatDate(testDate, 'ja-JP');
      expect(result).toMatch(/2023\/(1|01)\/15/); // Accept both formats
    });

    it('should format date in US English locale', () => {
      const result = formatDate(testDate, 'en-US');
      expect(result).toMatch(/(1|01)\/15\/2023/); // Accept both formats
    });

    it('should fallback to ISO format on error', () => {
      // Mock toLocaleDateString to throw error
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      Date.prototype.toLocaleDateString = jest.fn(() => {
        throw new Error('Locale not supported');
      });

      const result = formatDate(testDate, 'invalid-locale');
      expect(result).toBe('2023-01-15');

      // Restore original method
      Date.prototype.toLocaleDateString = originalToLocaleDateString;
    });
  });

  describe('formatDateByLanguage', () => {
    it('should format date for Japanese language', () => {
      const result = formatDateByLanguage(testDate, 'ja');
      expect(result).toMatch(/2023\/(1|01)\/15/);
    });

    it('should format date for English language', () => {
      const result = formatDateByLanguage(testDate, 'en');
      expect(result).toMatch(/(1|01)\/15\/2023/);
    });
  });

  describe('formatMonthYear', () => {
    it('should format month year in Japanese locale', () => {
      const result = formatMonthYear(testDate, 'ja-JP');
      expect(result).toMatch(/2023年.*1月/);
    });

    it('should format month year in US English locale', () => {
      const result = formatMonthYear(testDate, 'en-US');
      expect(result).toMatch(/January 2023/);
    });
  });

  describe('formatMonthYearByLanguage', () => {
    it('should format month year for Japanese language', () => {
      const result = formatMonthYearByLanguage(testDate, 'ja');
      expect(result).toMatch(/2023年.*1月/);
    });

    it('should format month year for English language', () => {
      const result = formatMonthYearByLanguage(testDate, 'en');
      expect(result).toMatch(/January 2023/);
    });
  });

  describe('getMonthBoundaries', () => {
    it('should return correct month boundaries for January 2023', () => {
      const result = getMonthBoundaries(testDate);
      expect(result.start).toBe('2023-01-01');
      expect(result.end).toBe('2023-01-31');
    });

    it('should handle February correctly', () => {
      const febDate = new Date('2023-02-15T12:00:00Z');
      const result = getMonthBoundaries(febDate);
      expect(result.start).toBe('2023-02-01');
      expect(result.end).toBe('2023-02-28');
    });

    it('should handle leap year February correctly', () => {
      const leapFebDate = new Date('2024-02-15T12:00:00Z');
      const result = getMonthBoundaries(leapFebDate);
      expect(result.start).toBe('2024-02-01');
      expect(result.end).toBe('2024-02-29');
    });
  });
});