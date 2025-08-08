import { Deduction, PayItem, PayResult, Taxes } from './types';

const SS_RATE = 0.062;
const MED_RATE = 0.0145;
const SS_WAGE_BASE_2025 = 168600; // editable constant

export function calcPay({
  basePayMonthly,
  entitlements,
  deductions,
  taxes,
}:{
  basePayMonthly: number;
  entitlements: PayItem[];
  deductions: Deduction[];
  taxes: Taxes;
}): PayResult {

  // 1) Compute monthly amounts with timing buckets
  const incomeMid: Record<string, number> = {};
  const incomeEom: Record<string, number> = {};
  const dedMid: Record<string, number> = {};
  const dedEom: Record<string, number> = {};

  const allIncome = entitlements.map(i => ({
    ...i,
    amt: i.amountMonthly
  }));

  const allDeds = deductions.map(d => {
    const amt = d.amountMonthly ?? (d.percentOfBase ? (basePayMonthly * d.percentOfBase) : 0);
    return { ...d, amt };
  });

  // Helper assign by timing
  const applyTiming = (timing: 'split'|'mid'|'eom', amt: number, mid: Record<string, number>, eom: Record<string, number>, key: string) => {
    if (timing === 'split') {
      mid[key] = (mid[key]||0) + amt/2;
      eom[key] = (eom[key]||0) + amt/2;
    } else if (timing === 'mid') {
      mid[key] = (mid[key]||0) + amt;
    } else {
      eom[key] = (eom[key]||0) + amt;
    }
  };

  // 2) Taxability bases
  let taxableGross = 0;
  let nonTaxable = 0;
  let ficaBase = 0;

  for (const i of allIncome) {
    const taxableThis = (taxes.czte && i.label.toLowerCase().includes('base')) ? false : i.taxable;
    if (taxableThis) taxableGross += i.amt;
    else nonTaxable += i.amt;
    if (i.ficaEligible) ficaBase += i.amt;
    applyTiming(i.timing, i.amt, incomeMid, incomeEom, i.label);
  }

  // 3) Pre-tax deductions reduce taxable wages
  let preTax = 0;
  for (const d of allDeds.filter(d=>d.preTax)) {
    preTax += d.amt;
    applyTiming(d.timing, d.amt, dedMid, dedEom, d.label + ' (pre-tax)');
  }

  const taxableWages = Math.max(0, taxableGross - preTax);

  // 4) Taxes
  let fed=0, state=0, ss=0, med=0;
  if (taxes.source === 'LES') {
    fed = taxes.federal||0;
    state = taxes.state||0;
    ss = taxes.ficaSS||0;
    med = taxes.ficaMed||0;
  } else {
    // Estimate mode (simple): FIT as 12% of taxable, SIT as stateRate%, FICA standard with cap
    fed = Math.max(0, taxableWages * 0.12) + (taxes.addlWithholding||0);
    state = Math.max(0, taxableWages * (taxes.stateRate||0));
    const ytd = taxes.ytdSSWages||0;
    const remainingSSCap = Math.max(0, SS_WAGE_BASE_2025 - ytd);
    const ssBaseThisMonth = Math.min(remainingSSCap, ficaBase);
    ss = ssBaseThisMonth * SS_RATE;
    med = ficaBase * MED_RATE;
  }

  // Assign taxes as EOM by default (DFAS typically settles at EOM), but split is okay too
  applyTiming('eom', fed, dedMid, dedEom, 'Federal Tax');
  applyTiming('eom', state, dedMid, dedEom, 'State Tax');
  applyTiming('split', ss, dedMid, dedEom, 'FICA-SS');
  applyTiming('split', med, dedMid, dedEom, 'FICA-Med');

  // 5) Post-tax deductions
  let postTax = 0;
  for (const d of allDeds.filter(d=>!d.preTax)) {
    postTax += d.amt;
    applyTiming(d.timing, d.amt, dedMid, dedEom, d.label);
  }

  const totalTaxes = fed + state + ss + med;

  // 6) Monthly Net
  const monthlyNet = taxableWages + nonTaxable - totalTaxes - postTax;

  // 7) Per-paycheck nets
  const midIncome = Object.values(incomeMid).reduce((a,b)=>a+b,0);
  const eomIncome = Object.values(incomeEom).reduce((a,b)=>a+b,0);
  const midDeds = Object.values(dedMid).reduce((a,b)=>a+b,0);
  const eomDeds = Object.values(dedEom).reduce((a,b)=>a+b,0);

  const midNet = midIncome - midDeds;
  const eomNet = eomIncome - eomDeds;

  return {
    monthlyNet, midNet, eomNet,
    breakdown: {
      monthly: {
        taxableGross,
        nonTaxable,
        preTaxDeductions: preTax,
        taxes: { federal: fed, state, ficaSS: ss, ficaMed: med, total: totalTaxes },
        postTaxDeductions: postTax,
      },
      mid: { income: midIncome, deductions: midDeds, net: midNet, detail: incomeMid },
      eom: { income: eomIncome, deductions: eomDeds, net: eomNet, detail: incomeEom },
    }
  };
}
