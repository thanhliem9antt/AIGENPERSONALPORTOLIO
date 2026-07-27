import { useEffect, useState } from 'react';
import { Crown, Save, Search, ShieldCheck, Tags, Users } from 'lucide-react';
import api from '../../api/axiosClient';
import { Button, ErrorState, LoadingSpinner } from '../../components/common/UI';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const roleLabels = {
  user: 'Người dùng',
  admin: 'Quản trị viên',
  moderator: 'Điều hành viên',
  creator: 'Nhà sáng tạo',
  verified: 'Đã xác minh',
  vip: 'VIP',
};

function AccessCard({ account, availableRoles, currentUserId, onUpdated }) {
  const { notify } = useToast();
  const [roles, setRoles] = useState(account.roles);
  const [titles, setTitles] = useState(account.titles.join(', '));
  const [saving, setSaving] = useState(false);
  const isSelf = account._id === currentUserId;

  const toggleRole = (role) => {
    if (role === 'user' || isSelf) return;
    setRoles((items) => (items.includes(role) ? items.filter((item) => item !== role) : [...items, role]));
  };

  const save = async () => {
    setSaving(true);
    try {
      const titleItems = titles
        .split(',')
        .map((title) => title.trim())
        .filter(Boolean);
      const { data } = await api.put(`/admin/users/${account._id}/access`, {
        roles,
        titles: titleItems,
      });
      setRoles(data.user.roles);
      setTitles(data.user.titles.join(', '));
      onUpdated(data.user);
      notify(data.message);
    } catch (error) {
      notify(error.response?.data?.message || 'Không thể cập nhật quyền', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-semibold">{account.fullName}</h2>
            {roles.includes('admin') && <Crown size={15} className="shrink-0 text-amber-300" />}
          </div>
          <p className="mt-1 truncate text-sm text-zinc-500">
            @{account.username} · {account.email}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs ${
            account.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'
          }`}
        >
          {account.isActive ? 'Đang hoạt động' : 'Đã khóa'}
        </span>
      </div>

      <fieldset className="mt-5" disabled={isSelf}>
        <legend className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <ShieldCheck size={16} /> Roles
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {availableRoles.map((role) => (
            <label
              key={role}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                roles.includes(role)
                  ? 'border-violet-400/30 bg-violet-500/10 text-violet-200'
                  : 'border-white/10 bg-black/10 text-zinc-400'
              } ${role === 'user' || isSelf ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              <input
                type="checkbox"
                className="accent-violet-500"
                checked={roles.includes(role)}
                disabled={role === 'user' || isSelf}
                onChange={() => toggleRole(role)}
              />
              {roleLabels[role] || role}
            </label>
          ))}
        </div>
        {isSelf && <p className="mt-2 text-xs text-amber-300/80">Bạn không thể thay đổi role của chính mình.</p>}
      </fieldset>

      <label className="mt-5 grid gap-2 text-sm text-zinc-300">
        <span className="flex items-center gap-2 font-medium">
          <Tags size={16} /> Danh hiệu
        </span>
        <input
          className="input"
          value={titles}
          maxLength="409"
          onChange={(event) => setTitles(event.target.value)}
          placeholder="Ví dụ: Nhà sáng lập, Top Creator, Thành viên kỳ cựu"
        />
        <span className="text-xs text-zinc-600">Tối đa 10 danh hiệu, phân cách bằng dấu phẩy.</span>
      </label>

      <Button className="mt-5 w-full sm:w-auto" variant="accent" disabled={saving} onClick={save}>
        <Save size={16} /> {saving ? 'Đang lưu…' : 'Lưu quyền & danh hiệu'}
      </Button>
    </article>
  );
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [accounts, setAccounts] = useState(null);
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState(null);

  const load = (page = 1, search = submittedQuery) => {
    setError(null);
    api
      .get('/admin/users', { params: { q: search || undefined, page } })
      .then(({ data }) => {
        setAccounts(data.users);
        setRoles(data.availableRoles);
        setPagination(data.pagination);
      })
      .catch(setError);
  };

  useEffect(() => {
    load(1, '');
    // Initial admin directory load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <ErrorState message={error.response?.data?.message || error.message} onRetry={() => load()} />;
  if (!accounts) return <LoadingSpinner label="Đang tải danh sách người dùng" />;

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Quản trị hệ thống</p>
          <h1 className="mt-2 text-3xl font-semibold">Roles & danh hiệu</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {pagination.total} tài khoản · Mọi thay đổi quyền đều được ghi lại.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-200/80">
          <Crown size={16} /> Admin có thể cấp quyền admin cho người khác
        </div>
      </div>

      <form
        className="glass mt-7 flex flex-col gap-3 rounded-3xl p-4 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(query.trim());
          load(1, query.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-zinc-600" size={18} />
          <input
            className="input pl-11"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, username hoặc email…"
            aria-label="Tìm người dùng"
          />
        </div>
        <Button variant="accent">
          <Search size={17} /> Tìm kiếm
        </Button>
      </form>

      {accounts.length ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {accounts.map((account) => (
            <AccessCard
              key={account._id}
              account={account}
              availableRoles={roles}
              currentUserId={user._id}
              onUpdated={(updated) =>
                setAccounts((items) => items.map((item) => (item._id === updated._id ? updated : item)))
              }
            />
          ))}
        </div>
      ) : (
        <div className="glass mt-5 grid place-items-center rounded-3xl p-12 text-center">
          <Users className="text-zinc-600" />
          <p className="mt-3 font-medium">Không tìm thấy người dùng</p>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="ghost" disabled={pagination.page <= 1} onClick={() => load(pagination.page - 1)}>
            Trang trước
          </Button>
          <span className="text-sm text-zinc-500">
            {pagination.page}/{pagination.pages}
          </span>
          <Button
            variant="ghost"
            disabled={pagination.page >= pagination.pages}
            onClick={() => load(pagination.page + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </section>
  );
}
