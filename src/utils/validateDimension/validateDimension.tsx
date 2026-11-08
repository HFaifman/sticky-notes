export function isValidDimension(value: string, min: number, max: number) {
  if (value.trim() === '') return false;

  const parsedValue = Number(value);
  return (
    Number.isFinite(parsedValue) &&
    Number.isInteger(parsedValue) &&
    parsedValue >= min &&
    parsedValue <= max
  );
}
