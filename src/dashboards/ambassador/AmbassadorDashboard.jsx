import React from 'react';

const AmbassadorDashboard = () => {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-700 text-white">
        <h2 className="text-xl font-bold p-4">Ambassador Dashboard</h2>
        <ul>
          <li><a href="#" className="block px-4 py-2 hover:bg-gray-600">Performance</a></li>
          <li><a href="#" className="block px-4 py-2 hover:bg-gray-600">Earnings</a></li>
        </ul>
      </aside>
      <main className="flex-1 p-4 bg-gray-200">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Ambassador Dashboard</h1>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700">Logout</button>
        </header>
        <section>
          <p>Welcome to the Ambassador Dashboard!</p>
        </section>
      </main>
    </div>
  );
};

export default AmbassadorDashboard;