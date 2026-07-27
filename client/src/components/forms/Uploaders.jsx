import { ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import api from '../../api/axiosClient';
import { Button } from '../common/UI';
import { useToast } from '../../contexts/ToastContext';

export function ImageUploader({ endpoint, label, onUploaded }) {
  const ref = useRef();
  const [busy, setBusy] = useState(false);
  const { notify } = useToast();
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('image', file);
    setBusy(true);
    try {
      const { data } = await api.post(endpoint, body);
      onUploaded?.(data.profile);
      notify(`${label} đã được cập nhật`);
    } catch (err) {
      notify(err.response?.data?.message || 'Tải ảnh thất bại', 'error');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };
  return (
    <>
      <input
        ref={ref}
        className="hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={upload}
      />
      <Button type="button" variant="ghost" disabled={busy} onClick={() => ref.current.click()}>
        <ImagePlus size={16} />
        {busy ? 'Đang tải…' : label}
      </Button>
    </>
  );
}

export const AvatarUploader = ImageUploader;
