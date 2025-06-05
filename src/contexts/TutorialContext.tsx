import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'user' | 'admin';

export interface TutorialStep {
  id: string;
  target: string; // CSS selector for the element to highlight
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  required?: boolean;
}

export interface TutorialPath {
  id: string;
  steps: TutorialStep[];
}

export const userTutorialPath: TutorialPath = {
  id: 'user',
  steps: [
    {
      id: 'dashboard-tabs',
      target: '[data-tutorial="dashboard-tabs"]',
      title: 'ניווט בלוח הבקרה',
      content: 'כאן תוכלו לנווט בין הבקשות שלכם, סקירה כללית והתראות.',
      position: 'bottom',
    },
    {
      id: 'create-request',
      target: '[data-tutorial="create-request"]',
      title: 'יצירת בקשה חדשה',
      content: 'לחצו על כפתור זה כדי ליצור בקשה חדשה לפגישה.',
      position: 'bottom',
      required: true,
    },
    {
      id: 'request-form',
      target: '[data-tutorial="request-form"]',
      title: 'טופס יצירת בקשה',
      content: `
        <div class="space-y-4 text-right">
          <div class="border-b pb-2">
            <strong class="text-lg">כותרת פגישה:</strong>
            <p class="text-sm text-muted-foreground">הזינו כותרת ברורה וקצרה שתתאר את מטרת הפגישה. הכותרת צריכה להיות תמציתית אך מספיק ברורה כדי להבין את מטרת הפגישה.</p>
          </div>
          
          <div class="border-b pb-2">
            <strong class="text-lg">מועד מבוקש:</strong>
            <p class="text-sm text-muted-foreground">בחרו את התאריך והשעה המועדפים עליכם לקיום הפגישה. חשוב לבחור מועד שמתאים לכל המשתתפים.</p>
          </div>
          
          <div class="border-b pb-2">
            <strong class="text-lg">תיאור:</strong>
            <p class="text-sm text-muted-foreground">הוסיפו תיאור מפורט של מטרת הפגישה, הנושאים שיידונו, והתוצאות המצופות. ככל שהתיאור יהיה יותר מפורט, כך יהיה קל יותר להבין את מטרת הפגישה.</p>
          </div>
          
          <div>
            <strong class="text-lg">מסמכים:</strong>
            <p class="text-sm text-muted-foreground">העלו מסמכים רלוונטיים שיידונו בפגישה או שיעזרו להבין את הנושא. המסמכים יכולים להיות מצגות, דוחות, או כל חומר אחר שיעזור להבין את הנושא.</p>
          </div>
        </div>
      `,
      position: 'left',
    },
    {
      id: 'dashboard-filters',
      target: '[data-tutorial="dashboard-filters"]',
      title: 'סינון בקשות',
      content: 'השתמשו בפילטרים כדי לסנן את הבקשות לפי סטטוס.',
      position: 'bottom',
      required: false,
    },
    {
      id: 'dashboard-view',
      target: '[data-tutorial="dashboard-view"]',
      title: 'החלפת תצוגה',
      content: 'החליפו בין תצוגת טבלה לתצוגת כרטיסים.',
      position: 'bottom',
      required: false,
    },
  ],
};

export const adminTutorialPath: TutorialPath = {
  id: 'admin',
  steps: [
    ...userTutorialPath.steps,
    {
      id: 'admin-dashboard',
      target: '[data-tutorial="admin-dashboard"]',
      title: 'לוח בקרה למנהל',
      content: 'ברוכים הבאים ללוח הבקרה למנהלים. כאן תוכלו לנהל את כל בקשות הפגישות.',
      position: 'bottom',
      required: true,
    },
    {
      id: 'admin-requests',
      target: '[data-tutorial="admin-requests"]',
      title: 'ניהול בקשות',
      content: 'צפו בכל בקשות הפגישות הממתינות לאישור, אישרו או דחו בקשות.',
      position: 'right',
      required: true,
    },
    {
      id: 'admin-users',
      target: '[data-tutorial="admin-users"]',
      title: 'ניהול משתמשים',
      content: 'נהלו משתמשים במערכת, הוסיפו משתמשים חדשים או עדכנו הרשאות.',
      position: 'right',
      required: true,
    },
    {
      id: 'admin-settings',
      target: '[data-tutorial="admin-settings"]',
      title: 'הגדרות מערכת',
      content: 'הגדירו את הגדרות המערכת, כולל הגדרות התראות והרשאות.',
      position: 'right',
      required: true,
    },
    {
      id: 'admin-reports',
      target: '[data-tutorial="admin-reports"]',
      title: 'דוחות וניתוח',
      content: 'צפו בדוחות וניתוחים על פעילות המערכת ובקשות פגישות.',
      position: 'right',
      required: true,
    },
  ],
};

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  currentPath: TutorialPath | null;
  userRole: UserRole;
  startTutorial: (role: UserRole) => void;
  endTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPath, setCurrentPath] = useState<TutorialPath | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');

  const startTutorial = useCallback((role: UserRole) => {
    console.log('Starting tutorial for role:', role);
    setIsActive(true);
    setCurrentStep(0);
    setUserRole(role);
    console.log('Tutorial state updated:', { isActive: true, currentStep: 0, userRole: role });
  }, []);

  const endTutorial = useCallback(() => {
    console.log('Ending tutorial');
    setIsActive(false);
    setCurrentStep(0);
    setUserRole('user');
    console.log('Tutorial state reset');
  }, []);

  const nextStep = useCallback(() => {
    console.log('Moving to next step');
    const currentPath = userRole === 'admin' ? adminTutorialPath : userTutorialPath;
    if (currentStep < currentPath.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      console.log('New step:', currentStep + 1);
    } else {
      endTutorial();
    }
  }, [currentStep, userRole, endTutorial]);

  const previousStep = useCallback(() => {
    console.log('Moving to previous step');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      console.log('New step:', currentStep - 1);
    }
  }, [currentStep]);

  const skipStep = useCallback(() => {
    nextStep();
  }, [nextStep]);

  const pauseTutorial = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTutorial = useCallback(() => {
    setIsActive(true);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        currentPath,
        userRole,
        startTutorial,
        endTutorial,
        nextStep,
        previousStep,
        skipStep,
        pauseTutorial,
        resumeTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}; 