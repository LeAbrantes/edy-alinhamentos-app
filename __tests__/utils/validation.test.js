import {
  validateAppointment,
  validateEmail,
  validateLogin,
  validatePassword,
  validateRegister,
} from '../../src/utils/validation';

const ok = {
  name: 'João',
  phone: '(21) 99999-8888',
  car: 'Uno',
  date: '2026-11-19',
  services: ['alinhamento'],
  slot: '09:00',
};

describe('validateAppointment', () => {
  test('dados completos => sem erro', () => {
    expect(validateAppointment(ok)).toBeNull();
  });

  test.each([
    ['name', '', 'Informe o nome do cliente!'],
    ['name', '   ', 'Informe o nome do cliente!'],
    ['phone', '', 'Informe o telefone!'],
    ['car', '', 'Informe o veículo!'],
    ['date', '', 'Selecione a data!'],
    ['services', [], 'Selecione pelo menos um serviço!'],
    ['slot', null, 'Selecione o horário!'],
  ])('campo %s inválido (%p)', (campo, valor, msg) => {
    expect(validateAppointment({ ...ok, [campo]: valor })).toBe(msg);
  });
});

describe('e-mail e senha', () => {
  test('validateEmail', () => {
    expect(validateEmail('a@b.com')).toBeNull();
    expect(validateEmail('  a@b.com  ')).toBeNull();
    expect(validateEmail('a@b')).not.toBeNull();
    expect(validateEmail('sem-arroba')).not.toBeNull();
    expect(validateEmail('')).not.toBeNull();
  });

  test('validatePassword exige 6+ caracteres e aceita acentos', () => {
    expect(validatePassword('123456')).toBeNull();
    expect(validatePassword('12345')).toMatch(/6 caracteres/);
    expect(validatePassword('senhaçã1')).toBeNull();
  });
});

describe('validateRegister / validateLogin', () => {
  const base = { nome: 'Edy', email: 'edy@x.com', senha: 'abc123', confirmar: 'abc123' };

  test('cadastro válido', () => {
    expect(validateRegister(base)).toBeNull();
  });

  test('erros de cadastro', () => {
    expect(validateRegister({ ...base, nome: ' ' })).toBe('Informe seu nome.');
    expect(validateRegister({ ...base, email: 'x' })).toMatch(/e-mail/);
    expect(validateRegister({ ...base, senha: '123', confirmar: '123' })).toMatch(/6 caracteres/);
    expect(validateRegister({ ...base, confirmar: 'outra1' })).toBe('As senhas não conferem.');
  });

  test('login', () => {
    expect(validateLogin({ email: 'a@b.com', senha: 'x' })).toBeNull();
    expect(validateLogin({ email: '', senha: 'x' })).toBe('Informe e-mail e senha.');
    expect(validateLogin({ email: 'a@b.com', senha: '' })).toBe('Informe e-mail e senha.');
    expect(validateLogin({ email: 'invalido', senha: 'x' })).toMatch(/e-mail/);
  });
});
