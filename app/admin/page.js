 // app/admin/page.js
'use client';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminPage() {
  const [stats, setStats] = useState({});
  const [report, setReport] = useState({ users: [], swaps: [] });
  const [loading, setLoading] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const fetchStats = async () => {
    const res = await fetch('/api/admin?action=stats');
    const data = await res.json();
    setStats(data);
  };

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch('/api/admin?action=report');
    const data = await res.json();
    setReport(data);
    setLoading(false);
  };

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    doc.text('Skill Swap Platform - Admin Report', 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [['Name', 'Email', 'Location', 'Banned']],
      body: report.users.map(user => [
        user.name,
        user.email,
        user.location || '-',
        user.isBanned ? 'Yes' : 'No'
      ])
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['From', 'To', 'Offered', 'Wanted', 'Status']],
      body: report.swaps.map(swap => [
        swap.fromUser?.name,
        swap.toUser?.name,
        swap.offeredSkill,
        swap.wantedSkill,
        swap.status
      ])
    });

    doc.save('admin-report.pdf');
  };

  const banUser = async (id) => {
    await fetch(`/api/admin?action=ban&userId=${id}`, { method: 'PUT' });
    fetchReport();
  };

  const unbanUser = async (id) => {
    await fetch(`/api/admin?action=unban&userId=${id}`, { method: 'PUT' });
    fetchReport();
  };

  const rejectSwap = async (id) => {
    await fetch(`/api/admin?action=reject&swapId=${id}`, { method: 'PUT' });
    fetchReport();
  };

  const handleLogin = async () => {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (data.success) setAdminAuth(true);
    else alert('Invalid credentials');
  };

  useEffect(() => {
    if (adminAuth) {
      fetchStats();
      fetchReport();
    }
  }, [adminAuth]);

  if (!adminAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🔐 Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="p-8 bg-gradient-to-tr from-gray-100 to-white min-h-screen space-y-10">
      <h1 className="text-4xl font-bold text-center text-gray-900 tracking-tight">🛠️ Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, color: 'indigo' },
          { label: 'Banned Users', value: stats.bannedUsers, color: 'red' },
          { label: 'Total Swaps', value: stats.totalSwaps, color: 'green' },
          { label: 'Pending Swaps', value: stats.pendingSwaps, color: 'yellow' },
        ].map((stat, index) => (
          <div key={index} className={`bg-white border-t-4 border-${stat.color}-500 rounded-xl shadow p-6 text-center`}>
            <h2 className="text-gray-600 font-medium mb-1">{stat.label}</h2>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={downloadPDFReport} className="px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow hover:scale-105 transition">⬇️ Download PDF Report</button>
      </div>

      {/* Users Table */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">👥 Users</h2>
        <div className="overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {report.users.map(user => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={user.profilePhoto || '/images/avatar.png'} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.location || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {user.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBanned ? (
                      <button onClick={() => unbanUser(user._id)} className="text-green-600 hover:underline font-medium">Unban</button>
                    ) : (
                      <button onClick={() => banUser(user._id)} className="text-red-600 hover:underline font-medium">Ban</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Swap Requests Table */}
      <div className="bg-white p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">🔁 Swap Requests</h2>
        <div className="overflow-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wanted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {report.swaps.map(swap => (
                <tr key={swap._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{swap.fromUser?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{swap.toUser?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{swap.offeredSkill}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{swap.wantedSkill}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{swap.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {swap.status === 'pending' && (
                      <button onClick={() => rejectSwap(swap._id)} className="text-red-600 hover:underline font-medium">Reject</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}