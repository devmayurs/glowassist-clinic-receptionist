import { TREATMENT_PACKAGES } from '../constants/app.constants';

/**
 * Service for handling packages promotional credits, loyalty programs and active packages memberships checks.
 */
export const PackagesService = {
  /**
   * Determine if a client is eligible for automatic membership discounts (e.g. 20% off from Radiance Membership)
   */
  calculateDiscountedPrice(servicePrice: number, clientType: string): { finalPrice: number; discountApplied: boolean } {
    if (clientType === 'vip') {
      const discount = 0.20; // 20% off
      return {
        finalPrice: Math.round(servicePrice * (1 - discount)),
        discountApplied: true,
      };
    }
    return {
      finalPrice: servicePrice,
      discountApplied: false,
    };
  },

  /**
   * Fetch matching package recommendations for a user based on their last booked service.
   */
  getPackageRecommendation(lastService: string | undefined): { name: string; price: string; savings: string } | null {
    if (!lastService) return null;
    const lower = lastService.toLowerCase();

    if (lower.includes('peel') || lower.includes('chemical')) {
      const pkg = TREATMENT_PACKAGES.find(p => p.name.includes('Peels'));
      return pkg ? { name: pkg.name, price: pkg.price, savings: 'save $601' } : null;
    }
    if (lower.includes('botox') || lower.includes('wrinkle')) {
      const pkg = TREATMENT_PACKAGES.find(p => p.name.includes('Botox'));
      return pkg ? { name: pkg.name, price: pkg.price, savings: 'up to 40 units monthly' } : null;
    }
    if (lower.includes('laser') || lower.includes('resurfacing')) {
      const pkg = TREATMENT_PACKAGES.find(p => p.name.includes('Laser'));
      return pkg ? { name: pkg.name, price: pkg.price, savings: 'save $700' } : null;
    }

    // Default general recommendation
    const radiance = TREATMENT_PACKAGES[0];
    return { name: radiance.name, price: radiance.price, savings: '20% off all treatments' };
  },
};
