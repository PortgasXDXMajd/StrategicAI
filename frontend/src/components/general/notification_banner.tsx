import React from 'react';
import CustomLoader from './custom_loader';

interface NotificationBannerProps {
  text: string;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ text }) => {
  return (
    <div className="relative flex flex-row bg-gray-100 dark:bg-[#1f1f1f] w-full justify-start items-center space-x-4 p-3 rounded-full shadow-md overflow-hidden border-2 border-transparent animate-border-glow">
      <CustomLoader />
      <p className="font-medium text-gray-800 dark:text-gray-200">{text}</p>
    </div>
  );
};

export default NotificationBanner;
