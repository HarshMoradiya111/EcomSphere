const { calculateCartTotals } = require('../utils/cartCalculator');

describe('cartCalculator Unit Tests', () => {
    
    const mockCartItems = [
        { price: 1000, quantity: 1 },
        { price: 200, quantity: 2 },
    ]; // Subtotal = 1400

    test('should calculate subtotal correctly', () => {
        const result = calculateCartTotals(mockCartItems);
        expect(result.subtotal).toBe(1400);
        // Tax = 1400 * 0.18 = 252
        expect(result.taxAmount).toBe(252);
    });

    test('should apply MH shipping fee (50) for subtotal <= 1500', () => {
        const result = calculateCartTotals(mockCartItems, 0, 'MH');
        expect(result.shippingFee).toBe(50);
        // Total = 1400 (subtotal) + 252 (tax) + 50 (shipping) = 1702
        expect(result.totalPrice).toBe(1702);
    });

    test('should apply National shipping fee (100) for subtotal <= 1500', () => {
        const result = calculateCartTotals(mockCartItems, 0, 'DL');
        expect(result.shippingFee).toBe(100);
    });

    test('should apply Free Shipping (0) for subtotal > 1500', () => {
        const expensiveItems = [{ price: 2000, quantity: 1 }];
        const result = calculateCartTotals(expensiveItems, 0, 'DL');
        expect(result.shippingFee).toBe(0);
        // Tax = 2000 * 0.18 = 360
        // Total = 2000 + 360 = 2360
        expect(result.totalPrice).toBe(2360);
    });

    test('should properly calculate coupon discount', () => {
        const result = calculateCartTotals(mockCartItems, 400); // 400 discount
        expect(result.subtotal).toBe(1400);
        
        // Taxable = 1400 - 400 = 1000
        // Tax = 1000 * 0.18 = 180
        expect(result.taxAmount).toBe(180);
        
        // Total price before points = 1000 + 180 + 100 (national shipping) = 1280
        const resultWithState = calculateCartTotals(mockCartItems, 400, 'DL');
        expect(resultWithState.totalPrice).toBe(1280);
    });

    test('should deduct loyalty points properly', () => {
        const result = calculateCartTotals(mockCartItems, 0, 'MH', 200); // 200 points discount
        // 1400 subtotal + 252 tax + 50 shipping = 1702
        // Final Amount = 1702 - 200 = 1502
        expect(result.totalPrice).toBe(1702); 
        expect(result.finalAmount).toBe(1502);
    });

    test('should calculate loyalty points earned (1 per 50 rupees)', () => {
        // Total = 1702, Shipping = 50. Points shouldn't include shipping.
        // Points base = 1702 - 50 = 1652. 1652 / 50 = 33.04 -> 33
        const result = calculateCartTotals(mockCartItems, 0, 'MH', 0);
        expect(result.loyaltyPointsEarned).toBe(33);
    });

});
