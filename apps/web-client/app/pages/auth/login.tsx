import { zodResolver } from '@hookform/resolvers/zod'
import { useGoogleLogin } from '@react-oauth/google'
import { Button } from '@repo/ui/components/ui/button'
import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { z } from 'zod'
import { GOOGLE_CLIENT_ID } from '~/common/constant'
import { PasskeyLoginSection } from '~/components/auth/passkey-login-section'
import { UnderlinedInput } from '~/components/form-fields'
import { useFormMutation } from '~/hooks/use-form-mutation'
import { getInstance } from '~/middlewares/i8n'
import { browserHasStoredPasskeyHint } from '~/services/passkey'
import { queryClient } from '~/store/store'
import { authTokenAtom } from '~/store/token'
import { apiClient } from '~/utils/axios'
import type { Route } from './+types/login'

const schema = z.object({
  email: z.email('Email tidak valid'),
  password: z
    .string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[a-z]/, 'Harus ada huruf kecil')
    .regex(/[A-Z]/, 'Harus ada huruf besar')
    .regex(/[0-9]/, 'Harus ada angka')
    .regex(/[\W_]/, 'Harus ada karakter khusus'),
})

type Schema = z.infer<typeof schema>

export async function loader({ context }: Route.LoaderArgs) {
  const { t } = getInstance(context)

  return {
    meta: {
      title: `${t('appName', { ns: 'common' })} | Login`,
      description:
        'Login ke Baguspay untuk membeli pulsa, voucher game, dan berbagai produk PPOB dengan mudah dan aman.',
    },
  }
}

export default function Login({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation('login')
  const navigate = useNavigate()

  const [, setAuthToken] = useAtom(authTokenAtom)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isPasskeyPromptOpen, setIsPasskeyPromptOpen] = useState(false)
  const [isCheckingSecurity, setIsCheckingSecurity] = useState(false)
  const [postLoginRoute, setPostLoginRoute] = useState<string | null>(null)
  const hasPromptedRef = useRef(false)

  const form = useForm({
    resolver: zodResolver(schema),
  })
  const emailValue = form.watch('email') || ''

  const handleAuthSuccess = (data: any) => {
    toast.success(t('loginSuccess'))
    setAuthToken({
      accessToken: data.access_token,
      accessTokenExpiresAt: data.access_token_expired_at,
      refreshToken: data.refresh_token,
      refreshTokenExpiresAt: data.refresh_token_expired_at,
    })
    queryClient.invalidateQueries({
      queryKey: ['userAtom'],
      exact: false,
    })
    form.reset()
    navigate(`/${i18n.language}/user/profile`, {
      replace: true,
    })
  }

  const handleEmailLoginSuccess = async (data: any) => {
    toast.success(t('loginSuccess'))

    setAuthToken({
      accessToken: data.access_token,
      accessTokenExpiresAt: data.access_token_expired_at,
      refreshToken: data.refresh_token,
      refreshTokenExpiresAt: data.refresh_token_expired_at,
    })

    const defaultRedirect = `/${i18n.language}/user/profile`
    queryClient.invalidateQueries({
      queryKey: ['userAtom'],
      exact: false,
    })
    form.reset()

    setIsCheckingSecurity(true)

    try {
      const securityResponse = await apiClient.get('/user/security-info', {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      })

      const hasPasskey = Boolean(securityResponse?.data?.data?.has_passkey)
      const hasBrowserPasskey = browserHasStoredPasskeyHint()

      if (!hasPasskey && !hasBrowserPasskey) {
        setPostLoginRoute(defaultRedirect)
        setIsPasskeyPromptOpen(true)
        return
      }
    } catch {
      // Fallback: if security-info check fails, continue normal flow
    } finally {
      setIsCheckingSecurity(false)
    }

    navigate(defaultRedirect, {
      replace: true,
    })
  }

  const login = useFormMutation({
    form,
    mutationKey: ['login'],
    mutationFn: async (data: Schema) =>
      apiClient
        .post('/auth/login', data)
        .then((res) => res.data.data)
        .catch((err) => {
          throw new Error(err.response?.data?.message || 'Login failed. Please try again.')
        }),
    onError: (error) => {
      toast.error(error.message)
    },
    onSuccess: (data) => {
      void handleEmailLoginSuccess(data)
    },
  })

  const googleLogin = useGoogleLogin({
    scope: 'openid email profile',
    prompt: 'consent',
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token
        const idToken = (tokenResponse as any).id_token

        if (!accessToken) {
          throw new Error('Token Google tidak lengkap')
        }

        const res = await apiClient.post('/auth/google', {
          id_token: idToken,
          access_token: accessToken,
        })

        handleAuthSuccess(res.data.data)
      } catch (err: any) {
        toast.error(err?.message || 'Login Google gagal, coba lagi')
      } finally {
        setIsGoogleLoading(false)
      }
    },
    onError: () => {
      toast.error('Login Google dibatalkan atau gagal')
      setIsGoogleLoading(false)
    },
    flow: 'implicit',
  })

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      toast.error('GOOGLE_CLIENT_ID belum diset di env')
      return
    }
    setIsGoogleLoading(true)
    googleLogin()
  }

  const handleSubmit = (data: Schema) => {
    login.mutate(data)
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    if (typeof window === 'undefined') return
    if (hasPromptedRef.current) return

    const initOneTap = () => {
      const google = (window as any).google
      if (!google?.accounts?.id) return

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential?: string }) => {
          if (!response?.credential) return
          setIsGoogleLoading(true)
          try {
            const res = await apiClient.post('/auth/google', {
              id_token: response.credential,
            })
            handleAuthSuccess(res.data.data)
          } catch (err: any) {
            toast.error(err?.message || 'Login Google gagal, coba lagi')
          } finally {
            setIsGoogleLoading(false)
          }
        },
        cancel_on_tap_outside: true,
        auto_select: false,
      })

      google.accounts.id.prompt()
      hasPromptedRef.current = true
    }

    if (!(window as any).google) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initOneTap
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }

    initOneTap()
  }, [])

  return (
    <>
      <title>{loaderData?.meta.title}</title>
      <meta property="og:title" content={loaderData.meta.title} />
      <meta name="description" content={loaderData.meta.description} />

      <main className="container max-w-md   mx-auto p-6 md:p-0">
        <div className="mx-auto text-center mt-10">
          <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
        </div>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          method="post"
          className="max-w-md mx-auto space-y-4 mt-5"
        >
          <div>
            <UnderlinedInput
              label={t('emailLabel')}
              type="email"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
          </div>
          <div>
            <UnderlinedInput
              label={t('passwordLabel')}
              type="password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />

            <div className="text-end">
              <Link to="/auth/forgot-password" className="text-xs mt-1 hover:text-primary">
                {t('forgotPassword')}
              </Link>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full rounded-2xl" disabled={login.isPending}>
            {login.isPending ? 'Loading...' : t('submitButton')}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t('orLoginWith')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full rounded-2xl border-border flex items-center justify-center gap-3 h-12"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <svg
                className="h-4 w-4 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              <svg className="size-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
            )}
            <span className="text-sm font-medium">
              {isGoogleLoading ? 'Loading...' : t('loginWithGoogle')}
            </span>
          </Button>

          <PasskeyLoginSection
            email={emailValue}
            isDisabled={login.isPending || isGoogleLoading || isCheckingSecurity}
            autoPrompt
          />
        </div>

        <div className="text-center text-sm text-muted-foreground mt-8">
          {t('noAccount')}{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline">
            {t('registerLinkText')}
          </Link>
        </div>
      </main>
    </>
  )
}
