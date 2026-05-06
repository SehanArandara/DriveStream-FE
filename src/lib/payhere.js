import api from './api';
import { toast } from 'react-hot-toast';

/**
 * Shared utility to trigger PayHere checkout
 * @param {string} bookingId 
 * @param {function} onSuccess 
 * @param {function} onCancel 
 */
export const initiatePayHerePayment = async (bookingId, onSuccess, onCancel) => {
  try {
    toast.loading('Preparing secure payment...', { id: 'payment-loading' });
    
    // 1. Get payment parameters from backend
    const { data: params } = await api.get(`/payments/checkout-params/${bookingId}`);
    
    toast.dismiss('payment-loading');

    // 2. Configure PayHere
    window.payhere.onCompleted = async function onCompleted(orderId) {
      console.log("Payment completed. PayHere ID:" + orderId);
      
      try {
        // Update database via manual sync (Required for Localhost/Campus projects)
        await api.post('/payments/manual-sync', { 
          bookingId: bookingId,
          payhereId: orderId 
        });
        
        toast.success('Payment Received & DB Updated!');
        if (onSuccess) onSuccess(orderId);
      } catch (err) {
        console.error("Manual sync failed", err);
        toast.error('Payment succeeded but DB update failed. Refresh page.');
      }
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      toast.error('Payment was cancelled.');
      if (onCancel) onCancel();
    };

    window.payhere.onError = function onError(error) {
      console.log("Error:" + error);
      toast.error('Payment Error: ' + error);
    };

    // 3. Start Payment
    window.payhere.startPayment(params);

  } catch (err) {
    toast.dismiss('payment-loading');
    toast.error('Could not initialize payment gateway');
    console.error(err);
  }
};
