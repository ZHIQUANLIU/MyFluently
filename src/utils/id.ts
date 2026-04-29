/**
 * A safe ID generator that doesn't rely on native crypto/random values,
 * which often cause issues in React Native/Expo environments without polyfills.
 */
export const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
};
