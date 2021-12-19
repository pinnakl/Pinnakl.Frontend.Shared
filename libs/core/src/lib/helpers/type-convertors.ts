export const getBooleanFromString = (value: string): boolean | null => {
  return value.toLowerCase() === 'true' ? true : value.toLowerCase() === 'false' ? false : null;
};
