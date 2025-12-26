import { getDaysUntilReset, getBudgetHealth } from '../budgetAlerts';

describe('budgetAlerts', () => {
  describe('getDaysUntilReset', () => {
    it('should return positive number of days', () => {
      const days = getDaysUntilReset();
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThanOrEqual(31);
    });

    it('should return at least 1 day even on last day of month', () => {
      const days = getDaysUntilReset();
      expect(days).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getBudgetHealth', () => {
    it('should return "good" when spent is less than 75%', () => {
      expect(getBudgetHealth(50, 100)).toBe('good');
      expect(getBudgetHealth(74.99, 100)).toBe('good');
      expect(getBudgetHealth(0, 100)).toBe('good');
    });

    it('should return "warning" when spent is between 75% and 89.99%', () => {
      expect(getBudgetHealth(75, 100)).toBe('warning');
      expect(getBudgetHealth(80, 100)).toBe('warning');
      expect(getBudgetHealth(89.99, 100)).toBe('warning');
    });

    it('should return "danger" when spent is 90% or more', () => {
      expect(getBudgetHealth(90, 100)).toBe('danger');
      expect(getBudgetHealth(95, 100)).toBe('danger');
      expect(getBudgetHealth(100, 100)).toBe('danger');
      expect(getBudgetHealth(150, 100)).toBe('danger');
    });

    it('should handle different budget amounts correctly', () => {
      expect(getBudgetHealth(7500, 10000)).toBe('warning'); // 75%
      expect(getBudgetHealth(9000, 10000)).toBe('danger'); // 90%
      expect(getBudgetHealth(500, 1000)).toBe('good'); // 50%
    });

    it('should handle over-budget scenarios', () => {
      expect(getBudgetHealth(200, 100)).toBe('danger'); // 200%
      expect(getBudgetHealth(1500, 1000)).toBe('danger'); // 150%
    });

    it('should handle zero spent', () => {
      expect(getBudgetHealth(0, 100)).toBe('good');
      expect(getBudgetHealth(0, 1000)).toBe('good');
    });

    it('should handle edge cases at thresholds', () => {
      expect(getBudgetHealth(74.99, 100)).toBe('good');
      expect(getBudgetHealth(75, 100)).toBe('warning');
      expect(getBudgetHealth(89.99, 100)).toBe('warning');
      expect(getBudgetHealth(90, 100)).toBe('danger');
    });

    it('should handle decimal amounts', () => {
      expect(getBudgetHealth(74.5, 100)).toBe('good');
      expect(getBudgetHealth(75.1, 100)).toBe('warning');
      expect(getBudgetHealth(90.1, 100)).toBe('danger');
    });
  });
});
