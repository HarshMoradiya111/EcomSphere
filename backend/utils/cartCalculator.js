const calculateCartTotals = (cartItems, discountAmount = 0, state = '', pointsDiscount = 0) => {
    // 1. Core Subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    // 2. Tax (18% applied after coupon, before points)
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * 0.18;
    
    // 3. Dynamic Shipping
    let shippingFee = 0;
    if (subtotal > 1500) { 
        shippingFee = 0; // Free
    } else if (state === 'MH') { 
        shippingFee = 50; // Local
    } else if (state && state !== '') { 
        shippingFee = 100; // National
    }

    // 4. Total and Points Computations
    let finalAmount = subtotal - discountAmount + taxAmount + shippingFee - pointsDiscount;
    if (finalAmount <= 0) finalAmount = 1; // Minimum mathematically allowed

    const totalPrice = subtotal - discountAmount + taxAmount + shippingFee; // Before points are subtracted
    const loyaltyPointsEarned = Math.floor((totalPrice - shippingFee) / 50);

    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        shippingFee: parseFloat(shippingFee.toFixed(2)),
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
        loyaltyPointsEarned: Math.max(0, loyaltyPointsEarned)
    };
};

module.exports = { calculateCartTotals };
