// src/components/tutorial/FixedTutorialButton.tsx
import React from 'react';
import { TutorialButton } from './TutorialButton';

interface FixedTutorialButtonProps {
  page: 'dashboard' | 'admin' | 'requests' | 'settings';
}

export const FixedTutorialButton: React.FC<FixedTutorialButtonProps> = ({ page }) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <TutorialButton 
        page={page}
        className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-200"
      />
    </div>
  );
}; 