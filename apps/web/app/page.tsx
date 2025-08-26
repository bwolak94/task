'use client';

import { useState, useCallback, useEffect } from 'react';
import CreateOrderForm from './components/create-order-form';
import OrdersList from './components/orders-list';

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleOrderCreated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    
    setSuccessMessage('Order created successfully! The orders list has been updated.');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  }, []);

  return (
    <div className="space-y-8">
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-4 text-green-500 hover:text-green-700"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <CreateOrderForm onOrderCreated={handleOrderCreated} />
      <OrdersList key={refreshKey} />
    </div>
  );
}
