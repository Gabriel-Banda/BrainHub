import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AdminDashboard from './dashboards/admin/AdminDashboard';
import AmbassadorDashboard from './dashboards/ambassador/AmbassadorDashboard';
import { supabase } from './dashboards/supabaseClient';

const App = () => {
  const [role, setRole] = useState(null); // null while loading
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecked(true); return; }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      setRole(profile?.role || 'student');
      setChecked(true);
    })();
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'ambassador') return <AmbassadorDashboard />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="text-center max-w-sm">
        <h1 className="text-lg font-bold text-slate-900">No dashboard for this account</h1>
        <p className="text-sm text-slate-500 mt-2">
          This area is for admins and ambassadors. Sign in with an admin or ambassador account, or head back to BrainHub.
        </p>
        <a href="/index.html" className="inline-block mt-4 text-sm font-semibold text-blue-600 hover:underline">
          ← Back to BrainHub
        </a>
      </div>
    </div>
  );
};

export default App;
