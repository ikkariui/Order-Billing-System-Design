
  // Run when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Get all the elements we need
    const deliveryAddress = document.getElementById('delivery-address'); // Delivery address section
    const deliveryRadios = document.querySelectorAll('input[name="delivery_method"]'); // Delivery options
    const deliveryFeeRow = document.querySelector('.delivery-fee'); // Delivery fee row
    const deliveryFeeAmount = deliveryFeeRow ? deliveryFeeRow.querySelector('span:last-child') : null; // The fee amount
    const totalElement = document.querySelector('.order-totals .total strong:last-child'); // Total price
    const cityInput = document.getElementById('city'); // City input
    const stateInput = document.getElementById('state'); // State input
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]'); // Payment options
    const creditCardDetails = document.getElementById('credit-card-details'); // Credit card form
    const gcashDetails = document.getElementById('gcash-details'); // GCash form
    
    // Get delivery fee from the page (remove peso sign and convert to number)
    const deliveryFeeValue = parseFloat(
        document.querySelector('.delivery-fee span:last-child')?.textContent?.replace(/[^0-9.]/g, '') || 0
    );

    // Set up delivery method changes
    if (deliveryRadios.length > 0) {
        updateOrderTotal(); // Update total when page loads
        // Update when delivery method changes
        deliveryRadios.forEach(radio => {
            radio.addEventListener('change', updateOrderTotal);
        });
    }

    // Set up payment method changes
    if (paymentRadios.length > 0) {
        togglePaymentDetails(); // Show correct payment form on load
        // Update when payment method changes
        paymentRadios.forEach(radio => {
            radio.addEventListener('change', togglePaymentDetails);
        });
    }

    // Handle form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            const selectedPayment = document.querySelector('input[name="payment_method"]:checked')?.value;
            
            // Check if credit card is selected but details are missing
            if (selectedPayment === 'credit_card' && 
                (!document.getElementById('card_number')?.value || 
                 !document.getElementById('card_expiry')?.value || 
                 !document.getElementById('card_cvv')?.value)) {
                e.preventDefault(); // Stop form from submitting
                alert('Please fill in all credit card details');
                return false;
            } 
            // Check if GCash is selected but number is missing
            else if (selectedPayment === 'gcash' && !document.getElementById('gcash_number')?.value) {
                e.preventDefault(); // Stop form from submitting
                alert('Please enter your GCash number');
                return false;
            }
            // If validation passes, redirect to receipt page
            else {
                e.preventDefault(); // Stop form from submitting
                window.location.href = 'receipt.html';
                return false;
            }
        });
    }

    // Update order total when delivery option changes
    function updateOrderTotal() {
        // Check if delivery or pickup
        const selectedMethod = document.querySelector('input[name="delivery_method"]:checked')?.value;
        const delivery = selectedMethod === 'delivery' ? deliveryFeeValue : 0;

        // Show/hide delivery address and fee
        if (deliveryAddress) deliveryAddress.style.display = delivery ? 'block' : 'none';
        if (deliveryFeeRow) deliveryFeeRow.style.display = delivery ? 'flex' : 'none';
        if (deliveryFeeAmount) deliveryFeeAmount.textContent = '₱' + delivery.toFixed(2);

        // Set default location if delivery
        if (delivery) {
            if (cityInput && !cityInput.value) cityInput.value = 'Dagupan City';
            if (stateInput && !stateInput.value) stateInput.value = 'Pangasinan';
        }

        // Calculate new total
        const originalTotal = parseFloat(
            document.querySelector('.total strong:last-child')?.textContent?.replace(/[^0-9.]/g, '') || 0
        );
        const total = delivery === 0 ? (originalTotal - deliveryFeeValue) : originalTotal;
        
        // Update total display
        if (totalElement) {
            totalElement.textContent = '₱' + total.toFixed(2);
        }
    }

    // Show/hide payment forms based on selection
    function togglePaymentDetails() {
        const selectedMethod = document.querySelector('input[name="payment_method"]:checked')?.value;
        // Show credit card form if selected, hide otherwise
        if (creditCardDetails) {
            creditCardDetails.style.display = selectedMethod === 'credit_card' ? 'block' : 'none';
        }
        // Show GCash form if selected, hide otherwise
        if (gcashDetails) {
            gcashDetails.style.display = selectedMethod === 'gcash' ? 'block' : 'none';
        }
    }
});
