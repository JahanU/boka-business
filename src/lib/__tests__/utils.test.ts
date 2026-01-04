import { describe, it, expect } from 'vitest';
import { formatBusinessName } from '../utils';

describe('formatBusinessName', () => {
    it('formats snake_case names to Title Case', () => {
        expect(formatBusinessName("ali's_barber")).toBe("Ali's Barber");
        expect(formatBusinessName("john_doe_salon")).toBe("John Doe Salon");
    });

    it('handles single word names', () => {
        expect(formatBusinessName("salon")).toBe("Salon");
    });

    it('handles names with multiple underscores', () => {
        expect(formatBusinessName("the_best_barber_shop")).toBe("The Best Barber Shop");
    });

    it('handles already capitalized parts', () => {
        expect(formatBusinessName("Ali's_Barber")).toBe("Ali's Barber");
    });
});
