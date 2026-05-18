export const SERVICES = [
  "Service 1",
  "Service 2",
  "Service 3",
];

export const MANDATORY_PROVIDERS: Record<string, number[]> = {
  "Service 1": [1],

  "Service 2": [5],

  "Service 3": [1, 4],
};

export const FAIR_DISTRIBUTION_POOLS: Record<string, number[]> = {
  "Service 1": [2, 3, 4],

  "Service 2": [6, 7, 8],

  "Service 3": [2, 3, 5, 6, 7, 8],
};