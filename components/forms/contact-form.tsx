import { useState } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  return (
    <form className="space-y-4">
      <Input name="name" placeholder="Nome" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="phone" placeholder="Telefone" />
      <Textarea name="message" placeholder="Mensagem" required />
      <Button disabled={submitting}>Enviar</Button>
    </form>
  );
}
