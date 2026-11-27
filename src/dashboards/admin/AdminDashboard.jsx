import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, Users, TrendingUp, Megaphone, Search,
  ShieldCheck, ShieldOff, LogOut, Loader2, ChevronDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { supabase } from '../../supabaseClient';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'ambassadors', label: 'Ambassadors', icon: Megaphone },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
];

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

function KpiCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: 'bg-blue-50 text-blue-700 border-blue-200',
    ambassador: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    student: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[role] || styles.student}`}>
      {role}
    </span>
  );
}

export default function AdminDashboard() {
  const [authState, setAuthState] = useState('checking'); // checking | denied | ok
  const [activeTab, setActiveTab] = useState('overview');
  const [adminName, setAdminName] = useState('');

  const [overview, setOverview] = useState(null);
  const [signupSeries, setSignupSeries] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Auth gate ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { setAuthState('denied'); return; }
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('full_name, role, status').eq('id', user.id).single();
      if (profileError || profile?.role !== 'admin' || profile?.status === 'suspended') {
        setAuthState('denied');
        return;
      }
      setAdminName(profile.full_name || 'Admin');
      setAuthState('ok');
    })();
  }, []);

  // ── Load data per tab ────────────────────────────────────
  useEffect(() => {
    if (authState !== 'ok') return;
    setError('');
    if (activeTab === 'overview') loadOverview();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'ambassadors') loadAmbassadors();
    if (activeTab === 'analytics') { loadOverview(); loadSignupSeries(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState, activeTab]);

  async function loadOverview() {
    setLoading(true);
    const { data, error: err } = await supabase.rpc('admin_dashboard_overview');
    if (err) setError(err.message);
    else setOverview(data || null);
    setLoading(false);
  }

  async function loadSignupSeries() {
    const { data, error: err } = await supabase.rpc('admin_dashboard_signups');
    if (err) setError(err.message);
    else setSignupSeries((data || []).map(d => ({
      day: d.day?.slice(5),
      signups: Number(d.signups || 0),
    })));
  }

  async function loadUsers() {
    setLoading(true);
    const { data, error: err } = await supabase.rpc('admin_list_users', {
      p_search: null,
      p_role_filter: null,
      p_limit: 200,
      p_offset: 0,
    });
    if (err) setError(err.message);
    else setUsers(data || []);
    setLoading(false);
  }

  async function loadAmbassadors() {
    setLoading(true);
    const { data, error: err } = await supabase.rpc('admin_list_users', {
      p_search: null,
      p_role_filter: 'ambassador',
      p_limit: 200,
      p_offset: 0,
    });
    if (err) setError(err.message);
    else setAmbassadors(data || []);
    setLoading(false);
  }

  async function toggleSuspend(user) {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const { error: err } = await supabase.from('profiles').update({ status: nextStatus }).eq('id', user.id);
    if (err) { setError(err.message); return; }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
  }

  async function changeRole(user, role) {
    const { error: err } = await supabase.from('profiles').update({ role }).eq('id', user.id);
    if (err) { setError(err.message); return; }
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role } : u));
  }

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !userSearch ||
        u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
  }

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (authState === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="text-center max-w-sm">
          <ShieldOff className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-slate-900">Admin access required</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in with an admin account to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col">
        <div className="px-5 py-6 flex items-center gap-2 border-b border-white/10">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span className="text-white font-extrabold text-lg tracking-tight">BrainHub<span className="text-blue-400">.</span> Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-400">Welcome back, {adminName}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {initials(adminName)}
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard label="Total users" value={overview?.total_users ?? '—'} sub={`+${overview?.signups_last_7d ?? 0} in last 7 days`} />
                <KpiCard label="Ambassadors" value={overview?.total_ambassadors ?? '—'} />
                <KpiCard label="XP awarded" value={overview?.total_xp_awarded?.toLocaleString?.() ?? '—'} />
                <KpiCard label="Docs completed" value={overview?.total_docs_completed ?? '—'} />
              </div>
              {overview?.suspended_users > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
                  {overview.suspended_users} account{overview.suspended_users === 1 ? '' : 's'} currently suspended — check User Management.
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4 animate-[fadeIn_0.3s_ease]">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name or email…"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="ambassador">Ambassador</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-semibold px-5 py-3">User</th>
                      <th className="text-left font-semibold px-5 py-3">Role</th>
                      <th className="text-left font-semibold px-5 py-3">Status</th>
                      <th className="text-left font-semibold px-5 py-3">Joined</th>
                      <th className="text-right font-semibold px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                              {initials(u.full_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">{u.full_name || 'Unnamed'}</p>
                              <p className="text-xs text-slate-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="relative inline-block">
                            <select
                              value={u.role}
                              onChange={e => changeRole(u, e.target.value)}
                              className="appearance-none text-xs font-semibold border border-slate-200 rounded-full pl-3 pr-7 py-1 bg-white"
                            >
                              <option value="student">student</option>
                              <option value="lecturer">lecturer</option>
                              <option value="ambassador">ambassador</option>
                              <option value="admin">admin</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            u.status === 'suspended' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{u.created_at?.slice(0, 10)}</td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => toggleSuspend(u)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                              u.status === 'suspended'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                          >
                            {u.status === 'suspended' ? 'Reinstate' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!loading && filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="text-center text-slate-400 py-10">No users match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ambassadors' && (
            <div className="space-y-3 animate-[fadeIn_0.3s_ease]">
              <p className="text-sm text-slate-500">
                Ambassador accounts are listed here. Referral codes, commissions and payouts are not yet stored in this database.
              </p>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left font-semibold px-5 py-3">Ambassador</th>
                      <th className="text-left font-semibold px-5 py-3">Email</th>
                      <th className="text-left font-semibold px-5 py-3">University</th>
                      <th className="text-left font-semibold px-5 py-3">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ambassadors.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-semibold text-slate-800">{a.full_name || 'Unnamed'}</td>
                        <td className="px-5 py-3 text-slate-500">{a.email || '—'}</td>
                        <td className="px-5 py-3 text-slate-500">{a.university || '—'}</td>
                        <td className="px-5 py-3 text-slate-500">{a.created_at?.slice(0, 10) || '—'}</td>
                      </tr>
                    ))}
                    {!loading && ambassadors.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-slate-400 py-10">No ambassador accounts yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm animate-[fadeIn_0.3s_ease]">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Signups — last 30 days</h2>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={signupSeries}>
                  <defs>
                    <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="signups" stroke="#2563eb" strokeWidth={2} fill="url(#signupFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
