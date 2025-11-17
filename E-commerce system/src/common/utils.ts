export const mapArrayToIds = <T>(
  array: T[],
  key: keyof T,
): Record<string, T[]> => {
  return array.reduce(
    (acc, item) => {
      const id = String(item[key]);

      if (!acc[id]) {
        acc[id] = [];
      }

      acc[id].push(item);

      return acc;
    },
    {} as Record<string, T[]>,
  );
};
