export type Timing = 'split' | 'mid' | 'eom';

export type PayItem = {
  label: string;
  amountMonthly: number;
  taxable: boolean;        // subject to fed/state income tax
  ficaEligible: boolean;   // subject to FICA
  timing: Timing;
};

export type Deduction = {
  label: string;
  amountMonthly?: number;
  percentOfBase?: number;  // for TSP% etc., computed from base pay
  preTax: boolean;         // pre-tax reduces taxable wages
  timing: Timing;
};

export type Taxes = {
  source: 'LES' | 'ESTIMATE';
  federal?: number; state?: number; ficaSS?: number; ficaMed?: number;
  filingStatus?: 'single'|'married';
  stateRate?: number;        // simple state % for estimate mode
  addlWithholding?: number;
  czte?: boolean;            // combat zone tax exclusion for eligible pays
  ytdSSWages?: number;       // to cap SS (optional MVP simplification)
};

export type Profile = {
  grade?: string;
  yos?: number;
  stateCode?: string;
  zipBAH?: string;
  withDependents?: boolean;
};

export type PayResult = {
  monthlyNet: number;
  midNet: number;
  eomNet: number;
  breakdown: {
    monthly: {
      taxableGross: number;
      nonTaxable: number;
      preTaxDeductions: number;
      taxes: { federal: number; state: number; ficaSS: number; ficaMed: number; total: number };
      postTaxDeductions: number;
    };
    mid: { income: number; deductions: number; net: number; detail: Record<string, number> };
    eom: { income: number; deductions: number; net: number; detail: Record<string, number> };
  }
};
