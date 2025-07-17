// src/contexts/TutorialContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

export type UserRole = 'user' | 'admin';

export interface TutorialStep {
  id: string;
  target?: string; // Single selector
  targets?: string[]; // Multiple selectors
  title: string;
  content: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  required?: boolean;
  waitForClickId?: string; // New: wait for click on element with this ID
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
      content: 'כאן תוכלו לנווט בין הבקשות דיון שלכם, סקירה כללית והתראות.',
      position: 'bottom',
    },
    {
      id: 'dashboard-tab-view',
      target: '#dashboard-tab-view',
      title: 'הבקשות שלי',
      content: 'כאן תמצאו את כל הבקשות לדיון שיצרתם או השתתפתם בהן.',
      position: 'bottom',
    },
    {
      id: 'dashboard-tab-overview',
      target: '#dashboard-tab-overview',
      title: 'סקירה כללית',
      content: '  כאן תמצאו נתונים סטטיסטיים וסקירה על כל הבקשות שלכם. לחץ כעת למעבר.',
      position: 'left',
      required: true,
      waitForClickId: 'dashboard-tab-overview',
    },
    {
      id: 'dashboard-tab-notifications',
      target: '#dashboard-tab-notifications',
      title: 'התראות',
      content: 'כאן תמצאו את כל ההתראות האחרונות שלכם. לחץ כעת למעבר.',
      position: 'left',
      required: true,
      waitForClickId: 'dashboard-tab-notifications',
    },
    {
      id: 'dashboard-tab-back-to-view',
      target: '#dashboard-tab-view',
      title: 'חזרה לבקשות שלי',
      content: 'חזרו ללשונית "הבקשות שלי" כדי להמשיך בהדרכה.',
      position: 'bottom',
      required: true,
      waitForClickId: 'dashboard-tab-view',
    },
    {
      id: 'create-request',
      target: '[data-tutorial="create-request"]',
      title: 'יצירת בקשה חדשה',
      content: 'לחצו על כפתור זה כדי ליצור בקשה חדשה לדיון.',
      position: 'bottom',
      required: true,
      waitForClickId: 'create-request-btn',
    },
    {
      id: 'request-form',
      target: '[data-tutorial="request-form"]',
      title: 'טופס יצירת בקשה',
      content: `
        <div class="space-y-4 text-right">
          <div class="border-b pb-2">
            <strong class="text-lg">כותרת דיון:</strong>
            <p class="text-sm text-muted-foreground">הזינו כותרת ברורה וקצרה שתתאר את מטרת הדיון. הכותרת צריכה להיות תמציתית אך מספיק ברורה כדי להבין את מטרת הדיון.</p>
          </div>
          
          <div class="border-b pb-2">
            <strong class="text-lg">מועד מבוקש:</strong>
            <p class="text-sm text-muted-foreground">בחרו את התאריך והשעה המועדפים עליכם לקיום הדיון. חשוב לבחור מועד שמתאים לכל המשתתפים.</p>
          </div>
          
          <div class="border-b pb-2">
            <strong class="text-lg">תיאור:</strong>
            <p class="text-sm text-muted-foreground">הוסיפו תיאור מפורט של מטרת הדיון, הנושאים שיידונו, והתוצאות המצופות. ככל שהתיאור יהיה יותר מפורט, כך יהיה קל יותר להבין את מטרת הדיון.</p>
          </div>
          
          <div>
            <strong class="text-lg">מסמכים:</strong>
            <p class="text-sm text-muted-foreground">העלו מסמכים רלוונטיים שיידונו בדיון או שיעזרו להבין את הנושא. המסמכים יכולים להיות מצגות, דוחות, או כל חומר אחר שיעזור להבין את הנושא.</p>
          </div>
        </div>
      `,
      position: 'left',
    },
    {
      id: 'dashboard-filters',
      target: '[data-tutorial="dashboard-filters"]',
      title: 'סינון בקשות דיון',
      content: 'השתמשו בפילטרים כדי לסנן את הבקשות דיון לפי סטטוס.',
      position: 'bottom',
    },
    {
      id: 'dashboard-view',
      target: '[data-tutorial="dashboard-view"]',
      title: 'החלפת תצוגה',
      content: 'החליפו בין תצוגת טבלה לתצוגת כרטיסים.',
      position: 'bottom',

    },
  ],
};

export const adminTutorialPath: TutorialPath = {
  id: 'admin',
  steps: [
    {
      id: 'admin-dashboard',
      target: '[data-tutorial="admin-dashboard"]',
      title: 'לוח בקרה למנהל',
      content: 'ברוכים הבאים ללוח הבקרה למנהלים. כאן תוכלו לנהל את כל בקשות הדיון.',
      position: 'bottom',
    },
    {
      id: 'admin-tab-requests',
      target: '#admin-tab-requests',
      title: 'כל הבקשות',
      content: 'כאן תמצאו את כל הבקשות במערכת.',
      position: 'left',
    },
    {
      id: 'admin-tab-weekly',
      target: '#admin-tab-weekly',
      title: 'לוח שבועי',
      content: 'כאן תמצאו את לוח הפגישות השבועי. לחץ כעת למעבר.',
      position: 'left',
      required: true,
      waitForClickId: 'admin-tab-weekly',
    },
    {
      id: 'admin-tab-overview',
      target: '#admin-tab-overview',
      title: 'סקירה כללית',
      content: 'כאן תמצאו נתונים סטטיסטיים וסקירה על כל הבקשות במערכת. לחץ כעת למעבר.',
      position: 'left',
      required: true,
      waitForClickId: 'admin-tab-overview',
    },
    {
      id: 'admin-tab-back-to-requests',
      target: '#admin-tab-requests',
      title: 'חזרה לכל הבקשות',
      content: 'חזרו ללשונית "כל הבקשות" כדי להמשיך בהדרכה.',
      position: 'left',
      required: true,
      waitForClickId: 'admin-tab-requests',
    },
    {
      id: 'admin-requests',
      target: '[data-tutorial="admin-requests"]',
      title: 'ניהול בקשות דיון',
      content: 'צפו בכל בקשות הדיון הממתינות לאישור, אישרו או דחו בקשות דיון.',
      position: 'top',
    },
    {
      id: 'admin-table-headers',
      target: '[data-tutorial="admin-table-headers"]',
      title: 'עמודות טבלת הבקשות דיון',
      content: 'כאן תוכל לראות את כל העמודות של טבלת הבקשות דיון . כל עמודה מספקת מידע חשוב על כל בקשה.',
      position: 'bottom',
    },
    {
      id: 'admin-title',
      target: '[data-tutorial="admin-title"]',
      title: 'כותרת',
      content: 'כותרת הבקשה לדיון.',
      position: 'top',
    },
    {
      id: 'admin-requester',
      target: '[data-tutorial="admin-requester"]',
      title: 'מבקש',
      content: 'שם המבקש של הדיון.',
      position: 'top',
    },
    {
      id: 'admin-deadline',
      target: '[data-tutorial="admin-deadline"]',
      title: 'מועד מבוקש',
      content: 'המועד המבוקש לדיון.',
      position: 'top',
    },
    {
      id: 'admin-status',
      target: '[data-tutorial="admin-status"]',
      title: 'סטטוס',
      content: 'הסטטוס הנוכחי של הבקשה.',
      position: 'top',
    },
    {
      id: 'admin-scheduled',
      target: '[data-tutorial="admin-scheduled"]',
      title: 'מועד שנקבע',
      content: 'המועד שנקבע לדיון.',
      position: 'top',
    },
    {
      id: 'admin-documents',
      target: '[data-tutorial="admin-documents"]',
      title: 'מסמכים',
      content: 'כאן תראו כמה מסמכים צורפו לבקשה.',
      position: 'top',
    },
    {
      id: 'admin-actions',
      target: '[data-tutorial="admin-actions"]',
      title: 'פעולות',
      content: 'כאן ניתן לאשר, לדחות או לקבוע מועד לבקשה.',
      position: 'top',
    },
    {
      id: 'admin-view-switch',
      target: '[data-tutorial="admin-view"]',
      title: 'החלפת תצוגה',
      content: 'כאן ניתן להחליף בין תצוגת רשימה לתצוגת כרטיסים. לחץ על אחד מהכפתורים כדי להמשיך.',
      position: 'top',
      required: true,
      waitForClickId: 'admin-view-grid', // אפשר גם admin-view-list
    },
    // {
    //   id: 'dashboard-filters',
    //   target: '[data-tutorial="admin-filters"]',
    //   title: 'סינון בקשות דיון',
    //   content: 'השתמשו בפילטרים כדי לסנן את הבקשות דיון לפי סטטוס.',
    //   position: 'bottom',
    // },


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