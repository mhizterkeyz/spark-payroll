import { NamedAmount } from '../../types';

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
  tax?: TaxSettings;
  group?: {
    remittanceProcessingContext?: {
      tax?: TaxSettings;
    };
  };
  salary: number;
};

export type ProcessNigeriaRemittancePayload = {
  omit?: {
    tax?: boolean;
  };
  tax?: TaxSettings;
  group?: {
    remittanceProcessingContext?: {
      tax?: TaxSettings;
    };
  };
};

export type ProcessNigeriaRemittanceResponse = {
  tax: number;
  remittances: { name: string; amount: number }[];
};
