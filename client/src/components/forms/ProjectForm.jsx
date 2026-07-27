import { Button, Field, Select } from '../common/UI';

export default function ProjectForm({ form, setForm, onSubmit }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <Field label="Tên dự án" value={form.title || ''} onChange={set('title')} required />
      <Field
        as="textarea"
        rows="3"
        label="Mô tả ngắn"
        value={form.shortDescription || ''}
        onChange={set('shortDescription')}
      />
      <Field
        as="textarea"
        rows="5"
        label="Mô tả chi tiết"
        value={form.description || ''}
        onChange={set('description')}
      />
      <Field
        label="Công nghệ (phân cách bằng dấu phẩy)"
        value={(form.technologies || []).join(', ')}
        onChange={(e) =>
          setForm({
            ...form,
            technologies: e.target.value
              .split(',')
              .map((x) => x.trim())
              .filter(Boolean),
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Link demo" value={form.demoUrl || ''} onChange={set('demoUrl')} />
        <Field label="Link GitHub" value={form.githubUrl || ''} onChange={set('githubUrl')} />
      </div>
      <Select label="Trạng thái" value={form.status || 'Đang phát triển'} onChange={set('status')}>
        <option>Đang phát triển</option>
        <option>Đã hoàn thành</option>
        <option>Tạm dừng</option>
      </Select>
      <div className="flex gap-5 text-sm">
        <label>
          <input
            type="checkbox"
            checked={!!form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />{' '}
          Nổi bật
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.isVisible !== false}
            onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
          />{' '}
          Hiển thị
        </label>
      </div>
      <Button>Lưu dự án</Button>
    </form>
  );
}
