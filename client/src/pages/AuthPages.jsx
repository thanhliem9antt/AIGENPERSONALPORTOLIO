import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button, Field } from '../components/common/UI';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="grid min-h-[calc(100vh-80px)] place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/15 text-violet-300">
            <Sparkles />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
        </div>
        <div className="glass rounded-3xl p-6 sm:p-8">{children}</div>
      </div>
    </main>
  );
}

export function LoginPage() {
  const [form, setForm] = useState({ identity: '', password: '', remember: true });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form);
      notify('Chào mừng bạn trở lại');
      navigate(location.state?.from || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đăng nhập');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthShell title="Chào mừng trở lại" subtitle="Tiếp tục xây dựng dấu ấn của bạn.">
      <form className="grid gap-4" onSubmit={submit}>
        <Field
          label="Email hoặc username"
          autoComplete="username"
          value={form.identity}
          onChange={(e) => setForm({ ...form, identity: e.target.value })}
          required
        />
        <div className="relative">
          <Field
            label="Mật khẩu"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={error}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-zinc-500"
            aria-label="Hiện hoặc ẩn mật khẩu"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />{' '}
          Ghi nhớ đăng nhập
        </label>
        <Button disabled={busy} className="mt-2 w-full">
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Chưa có tài khoản?{' '}
        <Link className="text-violet-300" to="/register">
          Đăng ký
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) next.username = 'Chỉ dùng chữ, số và dấu gạch dưới';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Email không hợp lệ';
    if (form.password.length < 8) next.password = 'Tối thiểu 8 ký tự';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = form;
      await register(payload);
      notify('Tài khoản đã sẵn sàng');
      navigate('/dashboard/profile');
    } catch (err) {
      setErrors({ ...next, form: err.response?.data?.message || 'Không thể đăng ký' });
    } finally {
      setBusy(false);
    }
  };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <AuthShell title="Tạo profile của bạn" subtitle="Bắt đầu với một tài khoản miễn phí.">
      <form className="grid gap-4" onSubmit={submit}>
        <Field label="Họ và tên" value={form.fullName} onChange={set('fullName')} required />
        <Field label="Username" value={form.username} onChange={set('username')} error={errors.username} required />
        <Field label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email} required />
        <div className="relative">
          <Field
            label="Mật khẩu"
            type={show ? 'text' : 'password'}
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-10 text-zinc-500"
            aria-label="Hiện hoặc ẩn mật khẩu"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <Field
          label="Xác nhận mật khẩu"
          type={show ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={set('confirmPassword')}
          error={errors.confirmPassword}
          required
        />
        {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}
        <Button disabled={busy} className="mt-2 w-full">
          {busy ? 'Đang tạo…' : 'Tạo tài khoản'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-400">
        Đã có tài khoản?{' '}
        <Link className="text-violet-300" to="/login">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}
