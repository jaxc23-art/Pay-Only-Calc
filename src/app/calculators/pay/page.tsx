'use client';
import React, { useState } from 'react';
import NumberInput from '@components/NumberInput';
import Toggle from '@components/Toggle';
import { calcPay } from '@lib/paycalc';
import type { PayItem, Deduction, Taxes } from '@lib/types';

export default function PayCalcPage(){
  const [base, setBase] = useState(4000);
  const [bah, setBAH] = useState(2000);
  const [bas, setBAS] = useState(452.56);
  const [tspPct, setTspPct] = useState(0.05);
  const [czte, setCZTE] = useState(false);

  const entitlements: PayItem[] = [
    { label:'Base Pay', amountMonthly: base, taxable: true, ficaEligible: true, timing:'split' },
    { label:'BAH', amountMonthly: bah, taxable: false, ficaEligible: false, timing:'split' },
    { label:'BAS', amountMonthly: bas, taxable: false, ficaEligible: false, timing:'split' },
  ];

  const deductions: Deduction[] = [
    { label:'TSP (Traditional)', percentOfBase: tspPct, preTax: true, timing:'split' },
    { label:'SGLI', amountMonthly: 31.0, preTax: false, timing:'split' },
  ];

  const taxes: Taxes = { source:'ESTIMATE', stateRate: 0.03, addlWithholding:0, czte };

  const res = calcPay({ basePayMonthly: base, entitlements, deductions, taxes });

  return (
    <main>
      <h2>Paycheck calculator (MVP)</h2>
      <div style={{ display:'grid', gap:12, gridTemplateColumns:'repeat(2, minmax(200px,1fr))', alignItems:'end' }}>
        <NumberInput label='Base Pay (monthly)' value={base} onChange={setBase} step={1} />
        <NumberInput label='BAH (monthly)' value={bah} onChange={setBAH} step={1} />
        <NumberInput label='BAS (monthly)' value={bas} onChange={setBAS} step={1} />
        <NumberInput label='TSP % of base' value={tspPct} onChange={v=>setTspPct(v)} step={0.01} />
        <Toggle label='CZTE (deployment month)' checked={czte} onChange={setCZTE} />
      </div>

      <section style={{ marginTop:16 }}>
        <h3>Results</h3>
        <p><b>Monthly Net:</b> ${res.monthlyNet.toFixed(2)}</p>
        <p><b>Mid-month:</b> ${res.midNet.toFixed(2)} &nbsp; <b>EOM:</b> ${res.eomNet.toFixed(2)}</p>
        <details>
          <summary>Breakdown</summary>
          <pre style={{ background:'#f7f7f7', padding:12, borderRadius:8 }}>{JSON.stringify(res.breakdown, null, 2)}</pre>
        </details>
      </section>
    </main>
  );
}
