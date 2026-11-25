// Máscaras de campo (portadas do site: maskPhone / maskPlate)
export function maskPhone(value) {
  let v = String(value ?? '').replace(/\D/g, '').slice(0, 11);
  if (v.length > 6) v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  else if (v.length > 0) v = `(${v}`;
  return v;
}

export function maskPlate(value) {
  let v = String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (v.length > 3) v = `${v.slice(0, 3)}-${v.slice(3)}`;
  return v;
}
