'use client'

import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/core/button'
import { FormField } from '@/components/ui/forms/form-field'
import { Input } from '@/components/ui/forms/input'
import { Textarea } from '@/components/ui/forms/textarea'

type ContactFormData = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  website: string
}

type ContactFormErrors = Partial<Record<keyof ContactFormData, string>>

const initialForm: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
}

export function ContactForm() {
  const [form, setForm] = useState<ContactFormData>(initialForm)
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isSubmitDisabled = useMemo(() => {
    return (
      submitting ||
      !form.name.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    )
  }, [form.name, form.email, form.message, submitting])

  function updateField<K extends keyof ContactFormData>(
    field: K,
    value: ContactFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    if (!digits) {
      updateField('phone', '')
      return
    }

    if (digits.length <= 10) {
      const formatted = digits
        .replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*$/, (_, ddd, first, second) => {
          if (!ddd) return ''
          if (!first) return `(${ddd}`
          if (!second) return `(${ddd}) ${first}`
          return `(${ddd}) ${first}-${second}`
        })
        .trim()

      updateField('phone', formatted)
      return
    }

    const formatted = digits.replace(
      /^(\d{2})(\d{5})(\d{4}).*$/,
      '($1) $2-$3'
    )

    updateField('phone', formatted)
  }

  function validateForm(): ContactFormErrors {
    const nextErrors: ContactFormErrors = {}

    const trimmedName = form.name.trim()
    const trimmedEmail = form.email.trim()
    const trimmedPhone = form.phone.trim()
    const trimmedSubject = form.subject.trim()
    const trimmedMessage = form.message.trim()
    const trimmedWebsite = form.website.trim()

    if (!trimmedName) {
      nextErrors.name = 'Informe seu nome.'
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Nome deve ter pelo menos 2 caracteres.'
    } else if (trimmedName.length > 100) {
      nextErrors.name = 'Nome deve ter no máximo 100 caracteres.'
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Informe seu e-mail.'
    } else {
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
      if (!isEmailValid) {
        nextErrors.email = 'Informe um e-mail válido.'
      } else if (trimmedEmail.length > 160) {
        nextErrors.email = 'E-mail deve ter no máximo 160 caracteres.'
      }
    }

    if (trimmedPhone) {
      const digits = trimmedPhone.replace(/\D/g, '')
      if (digits.length < 10 || digits.length > 11) {
        nextErrors.phone = 'Informe um telefone válido.'
      }
    }

    if (trimmedSubject.length > 150) {
      nextErrors.subject = 'Assunto deve ter no máximo 150 caracteres.'
    }

    if (!trimmedMessage) {
      nextErrors.message = 'Informe sua mensagem.'
    } else if (trimmedMessage.length < 5) {
      nextErrors.message = 'Mensagem deve ter pelo menos 5 caracteres.'
    } else if (trimmedMessage.length > 2000) {
      nextErrors.message = 'Mensagem deve ter no máximo 2000 caracteres.'
    }

    if (trimmedWebsite) {
      nextErrors.website = 'Envio inválido.'
    }

    return nextErrors
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (submitting) return

    setSuccess(null)
    setError(null)

    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setErrors({})
    setSubmitting(true)

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        website: form.website.trim() || undefined,
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (Array.isArray(data.error)) {
          const fieldErrors: ContactFormErrors = {}

          for (const issue of data.error) {
            if (
              issue &&
              typeof issue.path === 'string' &&
              typeof issue.message === 'string'
            ) {
              const path = issue.path as keyof ContactFormData
              fieldErrors[path] = issue.message
            }
          }

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
            throw new Error('Verifique os campos informados.')
          }
        }

        throw new Error(data.error || 'Não foi possível enviar sua mensagem.')
      }

      setSuccess('Mensagem enviada com sucesso. Retornaremos em breve.')
      setForm(initialForm)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao enviar mensagem.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) => updateField('website', e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          id="name"
          label="Nome"
          required
          error={errors.name}
          hint="Informe seu nome completo."
        >
          <Input
            type="text"
            placeholder="Seu nome"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            autoComplete="name"
            maxLength={100}
          />
        </FormField>

        <FormField
          id="email"
          label="E-mail"
          required
          error={errors.email}
          hint="Usaremos esse e-mail para retorno."
        >
          <Input
            type="email"
            placeholder="voce@exemplo.com"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            autoComplete="email"
            maxLength={160}
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          id="phone"
          label="Telefone"
          error={errors.phone}
          hint="Opcional, com DDD."
        >
          <Input
            type="tel"
            inputMode="tel"
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            autoComplete="tel"
            maxLength={15}
          />
        </FormField>

        <FormField
          id="subject"
          label="Assunto"
          error={errors.subject}
          hint="Opcional."
        >
          <Input
            type="text"
            placeholder="Assunto da mensagem"
            value={form.subject}
            onChange={(e) => updateField('subject', e.target.value)}
            autoComplete="off"
            maxLength={150}
          />
        </FormField>
      </div>

      <FormField
        id="message"
        label="Mensagem"
        required
        error={errors.message}
        hint="Descreva sua dúvida, solicitação ou problema."
      >
        <Textarea
          placeholder="Digite sua mensagem"
          value={form.message}
          onChange={(e) => updateField('message', e.target.value)}
          maxLength={2000}
        />
      </FormField>

      {error ? (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {success ? (
        <div
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          role="status"
        >
          {success}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitDisabled}>
        {submitting ? 'Enviando solicitação...' : 'Enviar solicitação'}
      </Button>
    </form>
  )
}
