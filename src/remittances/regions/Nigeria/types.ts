import { NamedAmount } from 'remittances/types';

export enum TaxTypeEnum {
  PAYE = 'PAYE',
  WITHHOLDING = 'WITHHOLDING',
}

export type TaxType = keyof typeof TaxTypeEnum;

export type TaxSettings = {
  enabled?: boolean;
  type?: TaxType;
  whTaxRate?: number;
  taxRelief?: NamedAmount[];
};

export type ProcessTaxPayload = {
  totalBonus: number;
  taxSettings?: TaxSettings;
  group?: {
    taxSettings?: TaxSettings;
  };
  salary: number;
};

export type ProcessNigeriaRemittancePayload = {
  taxSettings?: TaxSettings;
  group?: {
    taxSettings?: TaxSettings;
  };
};

export type ProcessNigeriaRemittanceResponse = {
  tax: number;
};
