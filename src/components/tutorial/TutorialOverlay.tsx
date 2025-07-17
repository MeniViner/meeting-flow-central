// src/components/tutorial/TutorialOverlay.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useTutorial, userTutorialPath, adminTutorialPath } from '../../contexts/TutorialContext';
import { cn } from '../../lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const TutorialOverlay: React.FC = () => {
  const { isActive, currentStep, userRole, nextStep, previousStep, endTutorial } = useTutorial();
  const [targetPosition, setTargetPosition] = useState<Position | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Position | null>(null);
  const [clicked, setClicked] = useState(false); // For waitForClickId
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  // Move these two lines up so 'step' is available for all hooks
  const currentPath = userRole === 'admin' ? adminTutorialPath : userTutorialPath;
  const step = currentPath.steps[currentStep];

  console.log('TutorialOverlay render:', { isActive, currentStep, userRole });

  // Effect to find and position the target element
  useEffect(() => {
    console.log('TutorialOverlay target effect running');
    if (!isActive) {
      console.log('Tutorial not active, clearing target position');
      setTargetPosition(null);
      targetRef.current = null;
      return;
    }

    if (!step) {
      console.error('No step found for current index:', currentStep);
      setTargetPosition(null);
      targetRef.current = null;
      return;
    }

    // Support multiple targets
    let allTargetsExist = true;
    let mainTargetElement: HTMLElement | null = null;
    if (step.targets && Array.isArray(step.targets)) {
      const elements = step.targets.map(sel => document.querySelector(sel) as HTMLElement).filter(Boolean);
      allTargetsExist = elements.length === step.targets.length;
      mainTargetElement = elements[0] || null;
    } else if (step.target) {
      mainTargetElement = document.querySelector(step.target) as HTMLElement;
      allTargetsExist = !!mainTargetElement;
    }
    targetRef.current = mainTargetElement;

    if (mainTargetElement) {
      const rect = mainTargetElement.getBoundingClientRect();
      setTargetPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    } else {
      setTargetPosition(null);
    }
  }, [isActive, currentStep, userRole, step]);

  // Effect to position the tooltip
  useEffect(() => {
    console.log('TutorialOverlay tooltip effect running');
    if (!isActive || !targetPosition || !tooltipRef.current || !targetRef.current) {
      console.log('Tooltip positioning prerequisites not met');
      setTooltipPosition(null);
      return;
    }

    console.log('Calculating tooltip position');
    if (!step) {
       console.error('No step found for current index while positioning tooltip:', currentStep);
       setTooltipPosition(null);
       return;
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const targetRect = targetRef.current.getBoundingClientRect(); // Use targetRef.current

    const positions = calculateTooltipPosition(targetRect, tooltipRect, step.position);
    setTooltipPosition(positions);
    console.log('Tooltip position set:', positions);

    const handleResizeOrScroll = () => {
        if (tooltipRef.current && targetRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const targetRect = targetRef.current.getBoundingClientRect();
            const positions = calculateTooltipPosition(targetRect, tooltipRect, step.position);
            setTooltipPosition(positions);
        }
    };

    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll);

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll);
    };

  }, [isActive, currentStep, userRole, targetPosition, tooltipRef.current, step]); // Added dependencies

  // Wait for click on specific element if waitForClickId is set
  useEffect(() => {
    setClicked(false);
    if (step && step.waitForClickId) {
      const el = document.getElementById(step.waitForClickId);
      if (!el) return;
      const handler = () => setClicked(true);
      el.addEventListener('click', handler);
      return () => el.removeEventListener('click', handler);
    }
  }, [step]);

  const calculateTooltipPosition = (
    targetRect: DOMRect,
    tooltipRect: DOMRect,
    preferredPosition: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    const spacing = 10;
    const positions = {
      top: {
        top: targetRect.top - tooltipRect.height - spacing,
        left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
      },
      right: {
        top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
        left: targetRect.right + spacing,
      },
      bottom: {
        top: targetRect.bottom + spacing,
        left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
      },
      left: {
        top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
        left: targetRect.left - tooltipRect.width - spacing,
      },
    };

    // Ensure tooltip stays within viewport
    const position = positions[preferredPosition];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Add width and height to the position object
    const finalPosition = {
      ...position,
      width: tooltipRect.width,
      height: tooltipRect.height,
    };

    if (finalPosition.left < 0) finalPosition.left = spacing;
    if (finalPosition.left + finalPosition.width > viewportWidth) {
      finalPosition.left = viewportWidth - finalPosition.width - spacing;
    }
    if (finalPosition.top < 0) finalPosition.top = spacing;
    if (finalPosition.top + finalPosition.height > viewportHeight) {
      finalPosition.top = viewportHeight - finalPosition.height - spacing;
    }

    return finalPosition;
  };

  if (!isActive) {
    console.log('Tutorial not active, not rendering overlay');
    return null;
  }

  console.log('Rendering tutorial overlay');

  if (!step) {
    console.error('No step found for current index:', currentStep);
    return null;
  }

  // Determine if the next button should be disabled
  const isNextDisabled = step.required === true && (
    (step.waitForClickId ? !clicked : false) ||
    (step.targets && (!step.targets.every(sel => document.querySelector(sel))) ) ||
    (step.target && !document.querySelector(step.target))
  );

  return (
    <div className="fixed inset-0 z-[999] pointer-events-none">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Highlight overlay for multiple targets */}
      {step.targets && step.targets.map((sel, idx) => {
        const el = document.querySelector(sel) as HTMLElement;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return (
          <div
            key={sel + idx}
            className="absolute border-2 border-blue-500 rounded-lg bg-blue-500/10"
            style={{
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
              width: rect.width,
              height: rect.height,
            }}
          />
        );
      })}

      {/* Highlight overlay for single target */}
      {targetPosition && (
        <div
          className="absolute border-2 border-blue-500 rounded-lg bg-blue-500/10"
          style={{
            top: targetPosition.top,
            left: targetPosition.left,
            width: targetPosition.width,
            height: targetPosition.height,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "absolute bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-80 pointer-events-auto",
          "border border-gray-200 dark:border-gray-700",
          "tutorial-tooltip",
          !tooltipPosition && 'invisible' // Hide initially until position is calculated
        )}
        style={{
          top: tooltipPosition?.top,
          left: tooltipPosition?.left,
        }}
        data-position={step.position}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step.title}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={endTutorial}
            className="h-6 w-6 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4"
          dangerouslySetInnerHTML={{ __html: step.content }}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1"
            >
              <ChevronRight className="h-4 w-4" />
              הקודם
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={nextStep}
              disabled={isNextDisabled} // Disable next button based on step requirement
              className="flex items-center gap-1"
            >
              {currentStep === currentPath.steps.length - 1 ? 'סיום' : 'הבא'}
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} / {currentPath.steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}; 