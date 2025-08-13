import React, { useState } from 'react';

const Payment: React.FC = () => {
  const [status, setStatus] = useState('');
  const handlePayment = async () => {
    const res = await fetch('/api/payment', { method: 'POST' });
    const data = await res.json();
    setStatus(data.status);
  };
  return (
    <div>
      <button onClick={handlePayment} data-testid="pay-btn">Pay</button>
      {status && <div data-testid="pay-status">{status}</div>}
    </div>
  );
};

export default Payment;
