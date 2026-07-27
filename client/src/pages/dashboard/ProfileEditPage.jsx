import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { Button, ErrorState, Field, LoadingSpinner } from '../../components/common/UI';
import { ImageUploader } from '../../components/forms/Uploaders';
import ProfilePreview from '../../components/profile/ProfilePreview';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export default function ProfileEditPage() {
  const { user, setUser } = useAuth();
  const { notify } = useToast();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [skill, setSkill] = useState('');
  const load = useCallback(() => {
    setError(null);
    api
      .get('/profile/me')
      .then(({ data }) => setForm({ ...data.profile, username: user.username, skills: data.profile?.skills || [] }))
      .catch(setError);
  }, [user.username]);
  useEffect(() => {
    load();
  }, [load]);
  if (error) return <ErrorState message={error.response?.data?.message} onRetry={load} />;
  if (!form) return <LoadingSpinner />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/profile/me', form);
      setForm({ ...data.profile, username: data.user.username });
      setUser(data.user);
      notify('Đã lưu profile');
    } catch (err) {
      notify(err.response?.data?.message || 'Không thể lưu', 'error');
    } finally {
      setBusy(false);
    }
  };
  const addSkill = (e) => {
    e.preventDefault();
    const value = skill.trim();
    if (value && !form.skills.includes(value)) setForm({ ...form, skills: [...form.skills, value] });
    setSkill('');
  };
  return (
    <section>
      <p className="eyebrow">Profile</p>
      <h1 className="mt-2 text-3xl font-semibold">Chỉnh sửa profile</h1>
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <form onSubmit={save} className="glass grid gap-5 rounded-3xl p-5 sm:grid-cols-2 sm:p-7">
          <Field label="Tên hiển thị" value={form.displayName || ''} onChange={set('displayName')} />
          <Field label="Username" value={form.username || ''} onChange={set('username')} />
          <Field
            label="Tiêu đề nghề nghiệp"
            className="sm:col-span-2"
            value={form.headline || ''}
            onChange={set('headline')}
          />
          <Field
            as="textarea"
            rows="5"
            label="Tiểu sử"
            className="sm:col-span-2"
            value={form.bio || ''}
            onChange={set('bio')}
          />
          <Field label="Vị trí" value={form.location || ''} onChange={set('location')} />
          <Field
            label="Trạng thái làm việc"
            value={form.availabilityStatus || ''}
            onChange={set('availabilityStatus')}
          />
          <Field label="Email liên hệ" type="email" value={form.contactEmail || ''} onChange={set('contactEmail')} />
          <Field label="Số điện thoại" value={form.phone || ''} onChange={set('phone')} />
          <Field label="Website" className="sm:col-span-2" value={form.website || ''} onChange={set('website')} />
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm text-zinc-300">Kỹ năng</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addSkill(e);
                }}
                placeholder="Nhập kỹ năng và nhấn Enter"
              />
              <Button type="button" variant="ghost" onClick={addSkill}>
                Thêm
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.skills.map((item) => (
                <button
                  type="button"
                  title="Nhấn để xóa"
                  onClick={() => setForm({ ...form, skills: form.skills.filter((x) => x !== item) })}
                  key={item}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs"
                >
                  {item} ×
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <ImageUploader
              endpoint="/profile/avatar"
              label="Đổi avatar"
              onUploaded={(p) => setForm({ ...form, ...p })}
            />
            <ImageUploader
              endpoint="/profile/background"
              label="Đổi ảnh nền"
              onUploaded={(p) => setForm({ ...form, ...p })}
            />
          </div>
          <Button disabled={busy} className="sm:col-span-2">
            {busy ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </form>
        <aside className="xl:sticky xl:top-24 xl:self-start">
          <p className="mb-3 text-sm text-zinc-500">Xem trước</p>
          <ProfilePreview profile={form} user={{ ...user, username: form.username }} />
        </aside>
      </div>
    </section>
  );
}
