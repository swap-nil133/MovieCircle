import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../../context/groupStore';

export default function CreateGroupModal({ onClose }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { createGroup } = useGroupStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    setLoading(true);
    const result = await createGroup(form.name.trim(), form.description.trim());
    setLoading(false);
    if (result.success) {
      toast.success(`"${result.group.name}" created!`);
      onClose();
      navigate(`/group/${result.group._id}`);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 modal-backdrop bg-cinema-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md card shadow-modal animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-cinema-text">Create Group</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-cinema-muted hover:bg-cinema-border flex items-center justify-center text-cinema-subtle hover:text-cinema-text transition-all"
            >✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Group Name *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Friday Night Films"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoFocus
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Description</label>
              <textarea
                className="input-field resize-none"
                placeholder="What's this group about?"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={200}
              />
              <p className="text-xs text-cinema-subtle mt-1 text-right">{form.description.length}/200</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-cinema-black/30 border-t-cinema-black rounded-full animate-spin" />Creating...</>
                ) : 'Create Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
