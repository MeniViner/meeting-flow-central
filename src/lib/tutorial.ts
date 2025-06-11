// src/lib/tutorial.ts
/**
 * Utility functions for the tutorial system
 */

/**
 * Gets the tutorial element by its data-tutorial attribute
 * @param tutorialId The tutorial element ID
 * @returns The element or null if not found
 */
export const getTutorialElement = (tutorialId: string): Element | null => {
  return document.querySelector(`[data-tutorial="${tutorialId}"]`);
};

/**
 * Checks if a tutorial element exists
 * @param tutorialId The tutorial element ID
 * @returns True if the element exists
 */
export const hasTutorialElement = (tutorialId: string): boolean => {
  return !!getTutorialElement(tutorialId);
};

/**
 * Gets the position of a tutorial element
 * @param tutorialId The tutorial element ID
 * @returns The element's position or null if not found
 */
export const getTutorialElementPosition = (tutorialId: string): DOMRect | null => {
  const element = getTutorialElement(tutorialId);
  return element ? element.getBoundingClientRect() : null;
};

/**
 * Scrolls a tutorial element into view
 * @param tutorialId The tutorial element ID
 * @param options ScrollIntoViewOptions
 */
export const scrollTutorialElementIntoView = (
  tutorialId: string,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' }
): void => {
  const element = getTutorialElement(tutorialId);
  element?.scrollIntoView(options);
};

/**
 * Highlights a tutorial element
 * @param tutorialId The tutorial element ID
 * @param highlight Whether to highlight or remove highlight
 */
export const highlightTutorialElement = (tutorialId: string, highlight: boolean = true): void => {
  const element = getTutorialElement(tutorialId);
  if (element) {
    if (highlight) {
      element.classList.add('tutorial-highlight');
    } else {
      element.classList.remove('tutorial-highlight');
    }
  }
};

/**
 * Adds a click event listener to a tutorial element
 * @param tutorialId The tutorial element ID
 * @param callback The callback function
 * @returns A function to remove the event listener
 */
export const addTutorialElementClickListener = (
  tutorialId: string,
  callback: (event: MouseEvent) => void
): (() => void) => {
  const element = getTutorialElement(tutorialId);
  if (element) {
    element.addEventListener('click', callback);
    return () => element.removeEventListener('click', callback);
  }
  return () => {};
}; 