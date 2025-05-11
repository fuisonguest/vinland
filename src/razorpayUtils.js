/**
 * Initializes Razorpay checkout
 * @param {Object} options - Razorpay options
 * @returns {Promise} - Promise that resolves when payment is complete
 */
export const initializeRazorpay = (options) => {
  return new Promise((resolve, reject) => {
    console.log('Initializing Razorpay checkout...');
    
    // Ensure prefill is set
    if (!options.prefill) {
      options.prefill = {};
    }
    
    // Remove any stored phone number completely
    delete options.prefill.contact;
    
    // Ensure no readonly settings for contact
    if (options.readonly) {
      delete options.readonly.contact;
    }
    
    console.log('Completely removing contact prefill for Razorpay');
    
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      console.log('Razorpay already loaded, creating checkout instance');
      try {
        const razorpay = new window.Razorpay(options);
        
        // Attempt to override with empty UI before display
        try {
          // Create a hook to modify UI when it opens
          const originalOpen = razorpay.open;
          razorpay.open = function() {
            console.log('Intercepting Razorpay open to ensure clean contact field');
            const result = originalOpen.apply(this, arguments);
            
            // Try to clear any displayed phone number through DOM manipulation
            setTimeout(() => {
              try {
                // Try to find and clear any input fields that might contain phone numbers
                const phoneInputs = document.querySelectorAll('input[type="tel"]');
                phoneInputs.forEach(input => {
                  input.value = '';
                  input.setAttribute('placeholder', 'Enter your phone number');
                });
              } catch (e) {
                console.error('Error trying to clear phone fields:', e);
              }
            }, 100);
            
            return result;
          };
        } catch (err) {
          console.error('Could not override Razorpay UI:', err);
        }
        
        razorpay.open();
        resolve(razorpay);
      } catch (error) {
        console.error('Error creating Razorpay instance:', error);
        reject(error);
      }
      return;
    }
    
    console.log('Loading Razorpay SDK...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Razorpay SDK loaded successfully');
      try {
        if (!window.Razorpay) {
          throw new Error('Razorpay SDK loaded but window.Razorpay is not defined');
        }
        
        const razorpay = new window.Razorpay(options);
        
        // Attempt to override with empty UI before display
        try {
          // Create a hook to modify UI when it opens
          const originalOpen = razorpay.open;
          razorpay.open = function() {
            console.log('Intercepting Razorpay open to ensure clean contact field');
            const result = originalOpen.apply(this, arguments);
            
            // Try to clear any displayed phone number through DOM manipulation
            setTimeout(() => {
              try {
                // Try to find and clear any input fields that might contain phone numbers
                const phoneInputs = document.querySelectorAll('input[type="tel"]');
                phoneInputs.forEach(input => {
                  input.value = '';
                  input.setAttribute('placeholder', 'Enter your phone number');
                });
              } catch (e) {
                console.error('Error trying to clear phone fields:', e);
              }
            }, 100);
            
            return result;
          };
        } catch (err) {
          console.error('Could not override Razorpay UI:', err);
        }
        
        razorpay.open();
        resolve(razorpay);
      } catch (error) {
        console.error('Error creating Razorpay instance:', error);
        reject(error);
      }
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Razorpay SDK:', error);
      reject(new Error('Failed to load Razorpay SDK'));
    };
    
    document.body.appendChild(script);
  });
}; 