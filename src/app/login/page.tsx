import PasswordGateClient from './login-client'

export default function LoginPage() {
  // Pass the access code as a prop to ensure it's available on the client
  const accessCode = process.env.NEXT_PUBLIC_VOIDWALLZ_ACCESS_CODE ?? ''
  
  return <PasswordGateClient accessCode={accessCode} />
}