import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useGroupStore from '../../context/groupStore';

export default function JoinGroupModal({ onClose }) {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { joinGroup } = useGroupStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }
    setLoading(true);
    const result = await joinGroup(inviteCode.trim().toUpperCase());
    setLoading(false);
    if (result.success) {
      toast.success(result.message || 'Joined group!');
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
            <h2 className="font-display text-2xl font-bold text-cinema-text">Join Group</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-cinema-muted hover:bg-cinema-border flex items-center justify-center text-cinema-subtle hover:text-cinema-text transition-all"
            >✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-cinema-subtle mb-2">Invite Code</label>
              <input
                type="text"
                className="input-field font-mono uppercase tracking-widest text-center text-lg"
                placeholder="XXXXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase().slice(0, 8))}
                autoFocus
                maxLength={8}
              />
              <p className="text-xs text-cinema-subtle mt-2 text-center">
                Ask a group member to share their 8-character invite code
              </p>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-cinema-black/30 border-t-cinema-black rounded-full animate-spin" />Joining...</>
                ) : 'Join Group'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
