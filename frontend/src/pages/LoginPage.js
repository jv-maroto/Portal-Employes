import LoginForm from '@/components/auth/login-form';

export default function LoginPage({ onLogin }) {
  return <LoginForm onLogin={onLogin} />;
}
