
import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (email: string, password?: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const handleDemoFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transition-all duration-300 hover:shadow-indigo-100/50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-700 rounded-2xl mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Portail UniResto 🇲🇷</h2>
          <p className="mt-2 text-gray-500 font-medium">Connectez-vous à votre espace personnel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Adresse Email</label>
            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-gray-300"
              placeholder="votre@email.mr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Mot de Passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transform active:scale-[0.98] transition-all mt-4"
          >
            Se Connecter
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Comptes de Démonstration</h3>
          <div className="grid grid-cols-1 gap-2">
            <button 
              onClick={() => handleDemoFill('admin@uniresto.mr', 'adminpassword')} 
              className="flex items-center justify-between text-xs bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-indigo-100 font-bold"
            >
              <span>👑 Administrateur</span>
              <span className="opacity-40 font-normal">adminpassword</span>
            </button>
            <button 
              onClick={() => handleDemoFill('chef@uniresto.mr', 'staffpassword')} 
              className="flex items-center justify-between text-xs bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-indigo-100 font-bold"
            >
              <span>👨‍🍳 Staff Restaurant</span>
              <span className="opacity-40 font-normal">staffpassword</span>
            </button>
            <button 
              onClick={() => handleDemoFill('sidi@uniresto.mr', 'studentpassword')} 
              className="flex items-center justify-between text-xs bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 px-4 py-3 rounded-xl transition-all border border-transparent hover:border-indigo-100 font-bold"
            >
              <span>🎓 Sidi Étudiant</span>
              <span className="opacity-40 font-normal">studentpassword</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
