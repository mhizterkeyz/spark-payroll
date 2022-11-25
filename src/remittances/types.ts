export type ProcessRemittancePayload<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  country: string;
  employee: {
    totalBonus: number;
    salary: number;
  };
};

export type NamedAmount = {
  name: string;
  value: number;
};
