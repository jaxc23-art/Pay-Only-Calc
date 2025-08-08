'use client';
import React, { useState } from 'react';
import NumberInput from '@components/NumberInput';
import { calcPay } from '@lib/paycalc';
import type { PayItem, Deduction, Taxes } from '@lib/types';
import { calcBudget, BudgetItem } from '@lib/budget';

export default function BudgetPage(){
  const [base, setBase] = useState(4000);
  const [bah, setBAH] = useState(2000);
  const [bas, setBAS] = useState(452.56);
  const entitlements: PayItem[] = [
    { label:'Base Pay', amountMonthly: base, taxable: true, ficaEligible: true, timing:'split' },
    { label:'BAH', amountMonthly: bah, taxable: false, ficaEligible: false, timing:'split' },
    { label:'BAS', amountMonthly: bas, taxable: false, ficaEligible: false, timing:'split' },
  ];
  const deductions: Deduction[] = [{ label:'TSP (Traditional)', percentOfBase: 0.05, preTax: true, timing:'split' }];
  const taxes: Taxes = { source:'ESTIMATE', stateRate:0.03, addlWithholding:0, czte:false };
  const pay = calcPay({ basePayMonthly: base, entitlements, deductions, taxes });

  const [items, setItems] = useState<BudgetItem[]>([
    { label:'Rent/Mortgage', amountMonthly: 1800, timing:'eom', category:'Housing' },
    { label:'Utilities', amountMonthly: 200, timing:'split', category:'Utilities' },
    { label:'Auto Payment', amountMonthly: 350, timing:'eom', category:'Transport' },
    { label:'Insurance (Auto)', amountMonthly: 120, timing:'eom', category:'Transport' },
    { label:'Phone', amountMonthly: 80, timing:'eom', category:'Subscriptions' },
  ]);

  const b = calcBudget({
    items, monthlyNet: pay.monthlyNet, midNet: pay.midNet, eomNet: pay.eomNet, bahMonthly: bah
  });

  return (
    <main>
      <h2>Budget (by paycheck)</h2>
      <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
        <div>
          <h3>Income (from Pay calc)</h3>
          <NumberInput label='Base Pay (monthly)' value={base} onChange={setBase} />
          <NumberInput label='BAH (monthly)' value={bah} onChange={setBAH} />
          <NumberInput label='BAS (monthly)' value={bas} onChange={setBAS} />
          <p><b>Mid:</b> ${pay.midNet.toFixed(2)} &nbsp; <b>EOM:</b> ${pay.eomNet.toFixed(2)}</p>
        </div>
        <div>
          <h3>Summary</h3>
          <p><b>Monthly Net:</b> ${pay.monthlyNet.toFixed(2)}</p>
          <p><b>Budget Total:</b> ${b.monthlyTotal.toFixed(2)} &nbsp; <b>Margin:</b> ${b.marginMonthly.toFixed(2)}</p>
          <p><b>Mid Margin:</b> ${b.marginMid.toFixed(2)} &nbsp; <b>EOM Margin:</b> ${b.marginEom.toFixed(2)}</p>
          <p><b>Housing cap target/cap:</b> ${b.maxHousing.target.toFixed(0)} / ${b.maxHousing.cap.toFixed(0)} &nbsp; <b>Status:</b> {b.flags.housing}</p>
          <p><b>Transport cap payment/all-in:</b> ${b.maxTransport.payment.toFixed(0)} / ${b.maxTransport.allIn.toFixed(0)} &nbsp; <b>Status:</b> {b.flags.transport}</p>
        </div>
      </div>
      <details>
        <summary>Proportions</summary>
        <pre style={{ background:'#f7f7f7', padding:12, borderRadius:8 }}>{JSON.stringify(b.proportions, null, 2)}</pre>
      </details>
    </main>
  );
}
