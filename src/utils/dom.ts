export const safeQuerySelector = <T extends Element = Element>(
  selector: string,
  context: Document | Element = document
): T | null => {
  try {
    return context.querySelector<T>(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
};

export const parseTransform = (transform: string): { x: number; y: number } => {
  if (!transform || typeof transform !== 'string') {
    return { x: 0, y: 0 };
  }

  const translateMatch = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
  if (translateMatch) {
    const x = parseFloat(translateMatch[1]) || 0;
    const y = parseFloat(translateMatch[2]) || 0;
    return { x, y };
  }

  const translate3dMatch = transform.match(
    /translate3d\(([^,]+),\s*([^,]+),\s*[^)]+\)/
  );
  if (translate3dMatch) {
    const x = parseFloat(translate3dMatch[1]) || 0;
    const y = parseFloat(translate3dMatch[2]) || 0;
    return { x, y };
  }

  return { x: 0, y: 0 };
};

export const safeSetStyle = (
  element: HTMLElement | null,
  property: string,
  value: string
): void => {
  if (!element || !element.style) {
    return;
  }

  try {
    (element.style as any)[property] = value;
  } catch (error) {
    console.warn(`Failed to set style ${property}: ${value}`, error);
  }
};
