'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

const RegisterSchema = z.object({
  username: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type RegisterFormValues = z.infer<typeof RegisterSchema>

type AuthWithUserResponseDto = {
  access_token: string
  refresh_token: string
  user: {
    id: string
    username: string
    email: string
  }
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(RegisterSchema) })

  const onSubmit = async (values: RegisterFormValues) => {
    setError('')
    try {
      const data = await apiPost<RegisterFormValues, AuthWithUserResponseDto>('/auth/register', values)
      setTokens(data.access_token, data.refresh_token)
      router.replace('/dashboard')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка регистрации')
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте аккаунт, чтобы продолжить</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Не удалось зарегистрироваться</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
            <div className="grid gap-1.5">
              <label htmlFor="username" className="text-sm">Имя пользователя</label>
              <Input id="username" type="text" placeholder="john" aria-invalid={!!errors.username} {...register('username')} />
              {errors.username?.message ? (
                <span className="text-destructive text-xs">{errors.username.message}</span>
              ) : null}
            </div>
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
              {isSubmitting ? 'Создаём…' : 'Зарегистрироваться'}
            </Button>
          </form>
          <div className="mt-3 text-sm text-muted-foreground">
            Уже есть аккаунт?
            <Button asChild variant="link" size="sm" className="px-1">
              <Link href="/auth/login">Войти</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


