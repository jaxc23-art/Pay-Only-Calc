'use client';
import React, { useState } from 'react';
import NumberInput from '@components/NumberInput';
import { projectRetirement } from '@lib/retirement';

export default function RetirementPage(){
  const [high3, setHigh3] = useState(7000); // monthly high-3
  const [yos, setYOS] = useState(20);
  const [plan, ] = useState<'BRS'|'High-3'>('BRS');
  const [tspNow, setTspNow] = useState(37000);
  const [contrib, setContrib] = useState(0.15);
  const [baseNow, setBaseNow] = useState(5000);
  const [ageNow, setAgeNow] = useState(26);
  const [ageRet, setAgeRet] = useState(40);

  const res = projectRetirement({
    plan,
    yosAtRetirement: yos,
    high3MonthlyBase: high3,
    colaPct: 0.0225,
    currentAge: ageNow,
    retireAge: ageRet,
    tspBalanceNow: tspNow,
    contribPctOfBase: contrib,
    rothShare: 1,
    brsMatch: true,
    monthlyBaseNow: baseNow,
    fundMix: { G:0.05, F:0.05, C:0.6, S:0.2, I:0.1 },
    expectedReturns: { G:0.0275, F:0.045, C:0.09, S:0.10, I:0.075 },
    expenseRatio: 0.0006,
    monthlyBaseGrowthPct: 0.02,
  });

  return (
    <main>
      <h2>Retirement (BRS / High-3 + TSP)</h2>
      <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(2, minmax(220px,1fr))' }}>
        <NumberInput label='High-3 (monthly)' value={high3} onChange={setHigh3} />
        <NumberInput label='YOS at retirement' value={yos} onChange={setYOS} />
        <NumberInput label='TSP balance now' value={tspNow} onChange={setTspNow} />
        <NumberInput label='Contrib % of base' value={contrib} onChange={setContrib} step={0.01} />
        <NumberInput label='Base pay now (monthly)' value={baseNow} onChange={setBaseNow} />
        <NumberInput label='Current age' value={ageNow} onChange={setAgeNow} />
        <NumberInput label='Retire age' value={ageRet} onChange={setAgeRet} />
      </div>
      <section style={{ marginTop:16 }}>
        <p><b>Pension (Year 0):</b> ${res.pensionYear0.toFixed(0)}/yr</p>
        <p><b>TSP at retirement:</b> ${res.tspAtRetirement.toFixed(0)}</p>
        <p><b>Pension at age 60 (COLA):</b> ${res.pensionAtAge(60).toFixed(0)} &nbsp; <b>TSP at 60:</b> ${res.tspAtAge(60).toFixed(0)}</p>
      </section>
    </main>
  );
}
