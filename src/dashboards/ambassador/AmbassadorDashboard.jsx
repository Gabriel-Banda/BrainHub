import React, { useEffect, useMemo, useState } from 'react';
import {
  Rocket, Wallet, Copy, Check, Loader2, LogOut, Users, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

const TABS = [
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'earnings', label: 'Earnings', icon: Wallet },
];

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  );
}

export default function AmbassadorDashboard() {
  const [authState, setAuthState] = useState('checking'); // checking | denied | ok
  const [activeTab, setActiveTab] = useState('performance');
  const [profile, setProfile] = useState(null);
  const [ambassador, setAmbassador] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthState('denied'); return; }
      const { data: p } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
      if (!p || (p.role !== 'ambassador' && p.role !== 'admin')) { setAuthState('denied'); return; }
      setProfile(p);

      const { data: amb, error: ambErr } = await supabase
        .from('ambassadors').select('*').eq('user_id', user.id).single();
      if (ambErr || !amb) { setError('No ambassador record found for this account yet.'); setAuthState('ok'); return; }
      setAmbassador(amb);
      setAuthState('ok');
      loadReferrals(amb.id);
      loadEarnings(amb.id);
      loadPayouts(amb.id);
    })();
  }, []);

  async function loadReferrals(ambassadorId) {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('referrals').select('*').eq('ambassador_id', ambassadorId).order('created_at', { ascending: false });
    if (err) setError(err.message); else setReferrals(data || []);
    setLoading(false);
  }

  async function loadEarnings(ambassadorId) {
    const { data, error: err } = await supabase
      .from('earnings').select('*').eq('ambassador_id', ambassadorId).order('created_at', { ascending: false });
    if (err) setError(err.message); else setEarnings(data || []);
  }

  async function loadPayouts(ambassadorId) {
    const { data } = await supabase
      .from('payout_requests').select('*').eq('ambassador_id', ambassadorId).order('requested_at', { ascending: false });
    setPayoutRequests(data || []);
  }

  const totals = useMemo(() => {
    const verified = referrals.filter(r => r.status === 'verified').length;
    const paid = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.amount), 0);
    const pending = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + Number(e.amount), 0);
    const conversion = referrals.length ? Math.round((verified / referrals.length) * 100) : 0;
    return { verified, paid, pending, conversion };
  }, [referrals, earnings]);

  const hasOpenRequest = payoutRequests.some(r => r.status === 'requested' || r.status === 'approved');

  async function requestPayout() {
    if (!ambassador || totals.pending <= 0 || hasOpenRequest) return;
    setRequesting(true);
    const { data, error: err } = await supabase
      .from('payout_requests')
      .insert({ ambassador_id: ambassador.id, amount: totals.pending })
      .select().single();
    if (err) setError(err.message); else setPayoutRequests(prev => [data, ...prev]);
    setRequesting(false);
  }

  function copyLink() {
    const link = `https://brainhub.pages.dev/?ref=${ambassador.referral_code}`;
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

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
          <Rocket className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <h1 className="text-lg font-bold text-slate-900">Ambassador access required</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in with an ambassador account to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <aside className="w-64 shrink-0 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-300 flex flex-col">
        <div className="px-5 py-6 flex items-center gap-2 border-b border-white/10">
          <Rocket className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-extrabold text-lg tracking-tight">BrainHub<span className="text-cyan-400">.</span> Ambassador</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${active ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-900/30' : 'hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
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

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {TABS.find(t => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-400">Welcome back, {profile?.full_name}</p>
          </div>
          {ambassador && (
            <button
              onClick={copyLink}
              className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 hover:border-cyan-400 hover:text-cyan-600 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : `Your link: ${ambassador.referral_code}`}
            </button>
          )}
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {!ambassador ? null : (
            <>
              {activeTab === 'performance' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Total referrals" value={referrals.length} />
                    <StatCard label="Verified sign-ups" value={totals.verified} accent="text-cyan-600" />
                    <StatCard label="Conversion rate" value={`${totals.conversion}%`} />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <h2 className="text-sm font-bold text-slate-700">Your referrals</h2>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left font-semibold px-5 py-3">Referred</th>
                          <th className="text-left font-semibold px-5 py-3">Status</th>
                          <th className="text-left font-semibold px-5 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {referrals.map(r => (
                          <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 text-slate-700">{r.referred_email || 'Anonymous sign-up'}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                r.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>{r.status}</span>
                            </td>
                            <td className="px-5 py-3 text-slate-500">{r.created_at?.slice(0, 10)}</td>
                          </tr>
                        ))}
                        {!loading && referrals.length === 0 && (
                          <tr><td colSpan={3} className="text-center text-slate-400 py-10">
                            No referrals yet — share your link to start earning.
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'earnings' && (
                <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard label="Paid out" value={`K${totals.paid.toFixed(2)}`} accent="text-emerald-600" />
                    <StatCard label="Pending balance" value={`K${totals.pending.toFixed(2)}`} accent="text-amber-600" />
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-700">Request a payout</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {hasOpenRequest ? 'You have a request in progress.' : `Available: K${totals.pending.toFixed(2)}`}
                      </p>
                    </div>
                    <button
                      onClick={requestPayout}
                      disabled={requesting || totals.pending <= 0 || hasOpenRequest}
                      className="px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500 text-white hover:bg-cyan-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {requesting ? 'Requesting…' : 'Request payout'}
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-3 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-700">Transaction history</h2>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left font-semibold px-5 py-3">Description</th>
                          <th className="text-left font-semibold px-5 py-3">Amount</th>
                          <th className="text-left font-semibold px-5 py-3">Status</th>
                          <th className="text-left font-semibold px-5 py-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {earnings.map(e => (
                          <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 text-slate-700">{e.description || 'Referral bonus'}</td>
                            <td className="px-5 py-3 font-semibold text-slate-800">K{Number(e.amount).toFixed(2)}</td>
                            <td className="px-5 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                e.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>{e.status}</span>
                            </td>
                            <td className="px-5 py-3 text-slate-500">{e.created_at?.slice(0, 10)}</td>
                          </tr>
                        ))}
                        {!loading && earnings.length === 0 && (
                          <tr><td colSpan={4} className="text-center text-slate-400 py-10">No earnings recorded yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
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
