'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { apiPost } from '@/shared/lib/api'
import { setTokens } from '@/shared/lib/auth'

const LoginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginFormValues = z.infer<typeof LoginSchema>

type AuthWithUserResponseDto = {
  access_token: string
  refresh_token: string
  user: {
    id: string
    username: string
    email: string
  }
}

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const from = search.get('from') ?? '/dashboard'
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(LoginSchema) })

  const onSubmit = async (values: LoginFormValues) => {
    setError('')
    try {
      const data = await apiPost<LoginFormValues, AuthWithUserResponseDto>('/auth/login', values)
      setTokens(data.access_token, data.refresh_token)
      router.replace(from)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка входа')
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>Введите email и пароль, чтобы продолжить</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Не удалось войти</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="email" className="text-sm">Email</label>
              <Input id="email" type="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register('email')} />
              {errors.email?.message ? (
                <span className="text-destructive text-xs">{errors.email.message}</span>
              ) : null}
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="password" className="text-sm">Пароль</label>
              <Input id="password" type="password" placeholder="••••••••" aria-invalid={!!errors.password} {...register('password')} />
              {errors.password?.message ? (
                <span className="text-destructive text-xs">{errors.password.message}</span>
              ) : null}
            </div>
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? 'Входим…' : 'Войти'}
            </Button>
          </form>
          <div className="mt-3 text-sm text-muted-foreground">
            Нет аккаунта?
            <Button asChild variant="link" size="sm" className="px-1">
              <Link href="/auth/register">Зарегистрироваться</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


