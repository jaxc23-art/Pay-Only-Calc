export type PensionPlan = 'BRS' | 'High-3';

export type TSPMix = { G:number; F:number; C:number; S:number; I:number };

export type RetirementInputs = {
  plan: PensionPlan;
  yosAtRetirement: number;
  high3MonthlyBase: number;      // monthly base pay average at retirement (High-3)
  colaPct: number;               // annual COLA (nominal)
  currentAge: number;
  retireAge: number;

  tspBalanceNow: number;
  contribPctOfBase: number;      // employee % of base
  rothShare: number;             // 0..1
  brsMatch: boolean;             // true for BRS
  monthlyBaseNow: number;        // current monthly base (for contrib)
  fundMix: TSPMix;
  expectedReturns: TSPMix;       // nominal expected returns by fund (0.09 = 9%)
  expenseRatio: number;          // total ER (e.g., 0.0006 = 0.06%)
  monthlyBaseGrowthPct: number;  // expected base pay growth p.a. until retirement
  yearsUntilRetirement?: number; // optional override
};

export type RetirementOutputs = {
  pensionYear0: number;            // annual pension at retirement (nominal)
  pensionAtAge: (age:number)=>number; // function to get COLA-adjusted pension at any age
  tspAtRetirement: number;
  tspAtAge: (age:number)=>number;  // balance if left to grow (no withdrawals)
};

function blendedReturn(mix:TSPMix, rets:TSPMix): number {
  return (mix.G*rets.G + mix.F*rets.F + mix.C*rets.C + mix.S*rets.S + mix.I*rets.I);
}

export function calcPension(plan:PensionPlan, yos:number, high3MonthlyBase:number): number {
  const mult = plan === 'BRS' ? 0.02 : 0.025;
  return mult * yos * high3MonthlyBase * 12;
}

export function projectRetirement(inp: RetirementInputs): RetirementOutputs {
  const years = inp.yearsUntilRetirement ?? Math.max(0, inp.retireAge - inp.currentAge);
  const monthlyRet = years*12;

  // Pension
  const pensionYear0 = calcPension(inp.plan, inp.yosAtRetirement, inp.high3MonthlyBase);

  const pensionAtAge = (age:number) => {
    const dYears = Math.max(0, age - inp.retireAge);
    return pensionYear0 * Math.pow(1 + inp.colaPct, dYears);
  };

  // TSP growth: monthly compounding, base pay grows yearly at monthlyBaseGrowthPct
  let bal = inp.tspBalanceNow;
  let monthlyBase = inp.monthlyBaseNow;
  const rMonthly = blendedReturn(inp.fundMix, inp.expectedReturns)/12 - (inp.expenseRatio/12);

  for (let m=0; m<monthlyRet; m++) {
    const contrib = monthlyBase * inp.contribPctOfBase; // ignoring IRS cap for MVP
    bal = (bal + contrib) * (1 + rMonthly);
    if ((m+1)%12===0) {
      monthlyBase *= (1 + inp.monthlyBaseGrowthPct);
    }
  }

  const tspAtRetirement = bal;

  const tspAtAge = (age:number) => {
    const dYears = Math.max(0, age - inp.retireAge);
    return tspAtRetirement * Math.pow(1 + blendedReturn(inp.fundMix, inp.expectedReturns) - inp.expenseRatio, dYears);
  };

  return { pensionYear0, pensionAtAge, tspAtRetirement, tspAtAge };
}
