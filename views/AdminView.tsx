
import React, { useState, useEffect } from 'react';
import { User, UserRole, Booking, BookingStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyzeStats } from '../services/geminiService';

interface AdminViewProps {
  users: User[];
  bookings: Booking[];
  onAddStaff: (name: string, email: string) => void;
  onDeleteUser: (id: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ users, bookings, onAddStaff, onDeleteUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string>('Generating AI insight...');

  const staffMembers = users.filter(u => u.role === UserRole.STAFF);
  const paidCount = bookings.filter(b => b.status === BookingStatus.PAID || b.status === BookingStatus.VALIDATED).length;
  const unpaidCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;

  const chartData = [
    { name: 'Paid', value: paidCount },
    { name: 'Unpaid', value: unpaidCount },
  ];

  const COLORS = ['#4F46E5', '#E11D48'];

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (bookings.length === 0) {
        setAiAnalysis("No booking data available yet for analysis.");
        return;
      }
      try {
        const statsSummary = {
          total: bookings.length,
          paid: paidCount,
          unpaid: unpaidCount,
        };
        const result = await analyzeStats(statsSummary);
        setAiAnalysis(result || "Insight generation failed.");
      } catch (err) {
        setAiAnalysis("Analysis engine offline.");
      }
    };
    fetchAnalysis();
  }, [bookings.length, paidCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onAddStaff(name, email);
      setName('');
      setEmail('');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Reservation Stats</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex-[2] bg-indigo-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-6">
              <span className="bg-indigo-500/30 p-2 rounded-lg">
                <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              </span>
              <h3 className="text-xl font-bold tracking-tight">AI Administrative Insight</h3>
            </div>
            <p className="text-indigo-100 text-lg leading-relaxed italic">"{aiAnalysis}"</p>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-800">Staff Directory</h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{staffMembers.length} Accounts</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {staffMembers.map(staff => (
              <li key={staff.id} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{staff.name}</p>
                    <p className="text-xs text-gray-500">{staff.email}</p>
                  </div>
                </div>
                <button onClick={() => onDeleteUser(staff.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-bold text-gray-800 mb-6">Onboard New Staff</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Staff Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter full name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="staff@uniresto.edu" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-[0.98]">
              Create Staff Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
