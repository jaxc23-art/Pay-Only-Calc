import { Timing } from './types';

export type BudgetItem = {
  label: string;
  amountMonthly: number;
  timing: Timing;        // 'split' | 'mid' | 'eom'
  category: 'Housing'|'Transport'|'Insurance'|'Debt'|'Utilities'|'Subscriptions'|'Childcare'|'Groceries'|'Fuel'|'Dining'|'Fun'|'Sinking'|'Other';
};

export type BudgetResult = {
  monthlyTotal: number;
  midTotal: number;
  eomTotal: number;
  proportions: Record<string, number>;
  marginMonthly: number;
  marginMid: number;
  marginEom: number;
  flags: { housing: 'ok'|'warn'|'over'; transport: 'ok'|'warn'|'over' };
  maxHousing: { target: number; cap: number };
  maxTransport: { payment: number; allIn: number };
};

export function calcBudget({
  items,
  monthlyNet,
  midNet,
  eomNet,
  bahMonthly,
  includeUtilitiesInHousing=true,
  housingBackstopPctOfNet=0.25, // 25% of monthly net (target) for housing
}:{
  items: BudgetItem[];
  monthlyNet: number;
  midNet: number;
  eomNet: number;
  bahMonthly: number;
  includeUtilitiesInHousing?: boolean;
  housingBackstopPctOfNet?: number;
}): BudgetResult {
  const sum = (arr:number[]) => arr.reduce((a,b)=>a+b,0);

  const mid = items.filter(i=>i.timing!=='eom').map(i=> i.timing==='split'? i.amountMonthly/2 : i.amountMonthly);
  const eom = items.filter(i=>i.timing!=='mid').map(i=> i.timing==='split'? i.amountMonthly/2 : i.amountMonthly);
  const midTotal = sum(mid);
  const eomTotal = sum(eom);
  const monthlyTotal = items.reduce((a,b)=>a+b.amountMonthly,0);

  // proportions by category
  const byCat: Record<string, number> = {};
  for (const i of items) byCat[i.category] = (byCat[i.category]||0) + i.amountMonthly;
  const proportions: Record<string, number> = {};
  for (const [cat, amt] of Object.entries(byCat)) proportions[cat] = monthlyNet>0? amt/monthlyNet : 0;

  // margins
  const marginMonthly = monthlyNet - monthlyTotal;
  const marginMid = midNet - midTotal;
  const marginEom = eomNet - eomTotal;

  // housing & transport caps
  const housingSpend = items.filter(i=> i.category==='Housing' || (includeUtilitiesInHousing && i.category==='Utilities')).reduce((a,b)=>a+b.amountMonthly,0);
  const transportSpend = items.filter(i=> i.category==='Transport').reduce((a,b)=>a+b.amountMonthly,0);

  // Recommended caps
  const housingTargetBAH = bahMonthly * 0.9;
  const housingCapBAH = bahMonthly * 1.0;
  const housingTargetNet = monthlyNet * housingBackstopPctOfNet;

  const target = Math.min(housingTargetBAH, housingTargetNet);
  const cap = Math.min(housingCapBAH, monthlyNet*0.28); // 28% of gross-taxable proxied by net*0.28 (MVP simplification)

  let housingFlag: 'ok'|'warn'|'over' = 'ok';
  if (housingSpend > cap) housingFlag = 'over';
  else if (housingSpend > target) housingFlag = 'warn';

  // transport caps
  const transportPaymentCap = monthlyNet * 0.08;
  const transportAllInCap = monthlyNet * 0.15;
  let transportFlag: 'ok'|'warn'|'over' = 'ok';
  if (transportSpend > transportAllInCap) transportFlag = 'over';
  else if (transportSpend > transportPaymentCap) transportFlag = 'warn';

  return {
    monthlyTotal,
    midTotal,
    eomTotal,
    proportions,
    marginMonthly,
    marginMid,
    marginEom,
    flags: { housing: housingFlag, transport: transportFlag },
    maxHousing: { target: target, cap: cap },
    maxTransport: { payment: transportPaymentCap, allIn: transportAllInCap },
  };
}
