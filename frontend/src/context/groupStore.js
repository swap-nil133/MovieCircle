import { create } from 'zustand';
import api from '../utils/api';

const useGroupStore = create((set, get) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,

  fetchGroups: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/groups');
      set({ groups: data.groups, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch groups', loading: false });
    }
  },

  fetchGroup: async (groupId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/groups/${groupId}`);
      set({ currentGroup: data.group, loading: false });
      return data.group;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch group', loading: false });
      return null;
    }
  },

  createGroup: async (name, description) => {
    try {
      const { data } = await api.post('/groups', { name, description });
      set((state) => ({ groups: [data.group, ...state.groups] }));
      return { success: true, group: data.group };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create group' };
    }
  },

  joinGroup: async (inviteCode) => {
    try {
      const { data } = await api.post('/groups/join', { inviteCode });
      set((state) => ({ groups: [...state.groups, data.group] }));
      return { success: true, group: data.group, message: data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to join group' };
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await api.delete(`/groups/${groupId}/leave`);
      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        currentGroup: state.currentGroup?._id === groupId ? null : state.currentGroup,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to leave group' };
    }
  },

  setCurrentGroup: (group) => set({ currentGroup: group }),
  clearCurrentGroup: () => set({ currentGroup: null }),
}));

export default useGroupStore;
