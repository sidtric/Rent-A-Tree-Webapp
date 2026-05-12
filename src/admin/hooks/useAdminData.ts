import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api';
import type {
  AdminTree, AdminRental, AdminOrder,
  AdminReview, AdminMessage, AdminPublicUpdate, AdminStats,
} from '../types';

export function useAdminData() {
  const [trees, setTrees]               = useState<AdminTree[]>([]);
  const [rentals, setRentals]           = useState<AdminRental[]>([]);
  const [orders, setOrders]             = useState<AdminOrder[]>([]);
  const [reviews, setReviews]           = useState<AdminReview[]>([]);
  const [messages, setMessages]         = useState<AdminMessage[]>([]);
  const [publicUpdates, setPublicUpdates] = useState<AdminPublicUpdate[]>([]);
  const [stats, setStats]               = useState<AdminStats | null>(null);

  useEffect(() => {
    api.get('/admin/trees').then(d => setTrees(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/rentals').then(d => setRentals(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/orders').then(d => setOrders(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/reviews').then(d => setReviews(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/messages').then(d => setMessages(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/public-updates').then(d => setPublicUpdates(Array.isArray(d) ? d : [])).catch(() => {});
    api.get('/admin/stats').then(setStats).catch(() => {});
  }, []);

  const updateRentalStatus = useCallback(async (id: string, status: string) => {
    const res = await api.patchBody(`/admin/rentals/${id}/status`, { status });
    if (res._id) setRentals(r => r.map(x => x._id === id ? res : x));
    return res;
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    const res = await api.patchBody(`/admin/orders/${id}/status`, { status });
    if (res._id) setOrders(o => o.map(x => x._id === id ? res : x));
    return res;
  }, []);

  const deleteReview = useCallback(async (id: string) => {
    await api.del(`/admin/reviews/${id}`);
    setReviews(r => r.filter(x => x._id !== id));
  }, []);

  const deleteMessage = useCallback(async (id: string) => {
    await api.del(`/admin/messages/${id}`);
    setMessages(m => m.filter(x => x._id !== id));
  }, []);

  const deletePublicUpdate = useCallback(async (id: string) => {
    await api.del(`/admin/public-updates/${id}`);
    setPublicUpdates(u => u.filter(x => x._id !== id));
  }, []);

  const addPublicUpdate = useCallback((update: AdminPublicUpdate) => {
    setPublicUpdates(u => [update, ...u]);
  }, []);

  const addTree = useCallback((tree: AdminTree) => {
    setTrees(t => [tree, ...t]);
  }, []);

  const updateTree = useCallback((tree: AdminTree) => {
    setTrees(t => t.map(x => x._id === tree._id ? tree : x));
  }, []);

  const removeTree = useCallback((id: string) => {
    setTrees(t => t.filter(x => x._id !== id));
  }, []);

  return {
    trees, rentals, orders, reviews, messages, publicUpdates, stats,
    updateRentalStatus, updateOrderStatus,
    deleteReview, deleteMessage, deletePublicUpdate,
    addPublicUpdate, addTree, updateTree, removeTree,
  };
}

export function usePayments() {
  const [payments, setPayments]                   = useState<any[]>([]);
  const [totalCaptured, setTotalCaptured]         = useState(0);
  const [total, setTotal]                         = useState(0);
  const [loading, setLoading]                     = useState(false);
  const [error, setError]                         = useState('');
  const [count, setCount]                         = useState(50);

  const fetchPayments = useCallback(async (n = count) => {
    setLoading(true); setError('');
    try {
      const data = await api.get(`/admin/payments?count=${n}`);
      if (data.message) { setError(data.message); return; }
      setPayments(data.payments || []);
      setTotal(data.total || 0);
      setTotalCaptured(data.totalCaptured || 0);
    } catch { setError('Failed to load payments'); }
    finally { setLoading(false); }
  }, [count]);

  return { payments, totalCaptured, total, loading, error, count, setCount, fetchPayments };
}

export function useUserRoles() {
  const [search, setSearch]       = useState('');
  const [results, setResults]     = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating]   = useState<string | null>(null);

  const searchUsers = useCallback(async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/admin/users/search?email=${encodeURIComponent(search.trim())}`);
      setResults(Array.isArray(res) ? res : []);
      return Array.isArray(res) && res.length > 0;
    } catch { return false; }
    finally { setSearching(false); }
  }, [search]);

  const setRole = useCallback(async (userId: string, role: 'user' | 'admin') => {
    setUpdating(userId);
    try {
      const updated = await api.patchBody(`/admin/users/${userId}/role`, { role });
      if (updated._id) setResults(prev => prev.map(u => u._id === userId ? updated : u));
      return updated;
    } finally { setUpdating(null); }
  }, []);

  return { search, setSearch, results, searching, updating, searchUsers, setRole };
}
