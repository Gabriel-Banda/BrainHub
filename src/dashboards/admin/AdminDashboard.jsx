import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white">
        <h2 className="text-xl font-bold p-4">Admin Dashboard</h2>
        <ul>
          <li><a href="#" className="block px-4 py-2 hover:bg-gray-700">User Management</a></li>
          <li><a href="#" className="block px-4 py-2 hover:bg-gray-700">Analytics</a></li>
        </ul>
      </aside>
      <main className="flex-1 p-4 bg-gray-100">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>
        </header>
        <section>
          <p>Welcome to the Admin Dashboard!</p>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;