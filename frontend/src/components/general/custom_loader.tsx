import React from 'react';

const CustomLoader = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8 border-2 border-gray-700 rounded-full animate-spin shadow-[inset_-10px_-10px_10px_#6359f8,inset_0px_-10px_10px_#9c32e2,inset_10px_-10px_10px_#f36896,inset_10px_0_10px_#ff0b0b,inset_10px_10px_10px_#ff5500,inset_0_10px_10px_#ff9500,inset_-10px_10px_10px_#ffb700]">
        <div className="absolute top-1/2 left-1/2 w-6 h-6 border-2 border-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
};

export default CustomLoader;
