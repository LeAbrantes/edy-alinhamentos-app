// Validações de formulários. Cada função devolve a mensagem de erro ou null se estiver ok.

export function validateAppointment({ name, phone, car, date, services, slot }) {
  if (!String(name || '').trim()) return 'Informe o nome do cliente!';
  if (!String(phone || '').trim()) return 'Informe o telefone!';
  if (!String(car || '').trim()) return 'Informe o veículo!';
  if (!date) return 'Selecione a data!';
  if (!services || !services.length) return 'Selecione pelo menos um serviço!';
  if (!slot) return 'Selecione o horário!';
  return null;
}

export function validateEmail(email) {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  return ok ? null : 'Informe um e-mail válido.';
}

export function validatePassword(password) {
  const p = String(password || '');
  if (p.length < 6) return 'A senha deve ter pelo menos 6 caracteres.';
  return null;
}

export function validateRegister({ nome, email, senha, confirmar }) {
  if (!String(nome || '').trim()) return 'Informe seu nome.';
  const emailError = validateEmail(email);
  if (emailError) return emailError;
  const passError = validatePassword(senha);
  if (passError) return passError;
  if (senha !== confirmar) return 'As senhas não conferem.';
  return null;
}

export function validateLogin({ email, senha }) {
  if (!String(email || '').trim() || !String(senha || '').trim()) return 'Informe e-mail e senha.';
  return validateEmail(email);
}
