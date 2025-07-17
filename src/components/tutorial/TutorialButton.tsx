// src/components/tutorial/TutorialButton.tsx
import React from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, X } from 'lucide-react';

interface TutorialButtonProps {
  page: 'dashboard' | 'admin' | 'requests' | 'settings';
  className?: string;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({ page, className }) => {
  const { startTutorial, isActive, endTutorial } = useTutorial();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isActive) {
      endTutorial();
      return;
    }
    // Navigate to the appropriate page if not already there
    if (page === 'dashboard') {
      navigate('/'); // Dashboard is the index route
    } else if (page === 'admin') {
      navigate('/admin');
    } else if (page === 'requests') {
      navigate('/meetings'); // Using meetings route for requests
    } else if (page === 'settings') {
      navigate('/workspaces'); // Using workspaces route for settings
    }
    // Start the tutorial for the current page
    startTutorial(page === 'admin' ? 'admin' : 'user');
  };

  return (
    <Button
      onClick={handleClick}
      className={className}
      variant="outline"
      size="icon"
      title={isActive ? 'סגור הדרכה' : 'התחל הדרכה'}
    >
      {isActive ? <X className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
    </Button>
  );
}; 