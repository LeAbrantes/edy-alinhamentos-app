import { maskPhone, maskPlate } from '../../src/utils/masks';

describe('maskPhone', () => {
  test.each([
    ['', ''],
    ['2', '(2'],
    ['21', '(21'],
    ['219', '(21) 9'],
    ['21999998888', '(21) 99999-8888'],
    ['(21) 99999-8888', '(21) 99999-8888'],
    ['219999988889999', '(21) 99999-8888'], // limita a 11 dígitos
    ['abc21', '(21'], // ignora letras
  ])('maskPhone(%p) => %p', (entrada, esperado) => {
    expect(maskPhone(entrada)).toBe(esperado);
  });
});

describe('maskPlate', () => {
  test.each([
    ['', ''],
    ['abc', 'ABC'],
    ['abc1234', 'ABC-1234'],
    ['abc-1d23', 'ABC-1D23'],
    ['abc12345678', 'ABC-1234'], // limita a 7 caracteres
    ['a!b@c#1', 'ABC-1'],
  ])('maskPlate(%p) => %p', (entrada, esperado) => {
    expect(maskPlate(entrada)).toBe(esperado);
  });
});
