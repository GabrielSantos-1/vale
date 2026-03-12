import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function LeadForm() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form className="space-y-4">
      <Input name="name" placeholder="Nome" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="phone" placeholder="Telefone" />
      <Input name="city" placeholder="Cidade" />
      <Input name="district" placeholder="Bairro" />
      <Input name="cep" placeholder="CEP" />
      <Button disabled={submitting}>Enviar</Button>
    </form>
  );
}
