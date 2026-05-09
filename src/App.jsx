import React from 'react';
import AdminDashboard from './dashboards/admin/AdminDashboard';
import AmbassadorDashboard from './dashboards/ambassador/AmbassadorDashboard';

const App = () => {
  const userRole = 'admin'; // Change this to 'admin' or 'ambassador' to test dashboards.

  return (
    <div>
      {userRole === 'admin' ? (
        <AdminDashboard />
      ) : (
        <AmbassadorDashboard />
      )}
    </div>
  );
};

export default App;