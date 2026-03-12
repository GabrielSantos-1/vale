import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  return (
    <form className="space-y-4">
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Senha" required />
      <Button disabled={loading}>Entrar</Button>
    </form>
  );
}
