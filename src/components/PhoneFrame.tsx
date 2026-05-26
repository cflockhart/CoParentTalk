import React, { useEffect, useState } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="phone-wrapper">
      <div className="phone-screen">
        {/* Notch */}
        <div className="phone-notch">
          <div className="phone-camera" />
        </div>

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span className="status-time">{time || '9:41 AM'}</span>
          <div className="status-icons">
            <Signal size={12} strokeWidth={2.5} />
            <Wifi size={12} strokeWidth={2.5} />
            <Battery size={14} strokeWidth={2.5} />
          </div>
        </div>

        {/* Real App Screen Content */}
        {children}
      </div>
    </div>
  );
};
