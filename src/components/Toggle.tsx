import React from 'react';

export default function Toggle({ label, checked, onChange }:{ label:string; checked:boolean; onChange:(v:boolean)=>void }){
  return (
    <label style={{ display:'flex', alignItems:'center', gap:8 }}>
      <input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
