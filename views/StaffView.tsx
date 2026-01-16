
import React, { useState } from 'react';
import { Menu, MealType, Booking, BookingStatus, User, PaymentMethod } from '../types';
import { suggestMenu } from '../services/geminiService';

interface StaffViewProps {
  menus: Menu[];
  bookings: Booking[];
  users: User[];
  onAddMenu: (menu: Omit<Menu, 'id'>) => void;
  onToggleMenu: (id: string) => void;
  onDeleteMenu: (id: string) => void;
  onUpdateBooking: (id: string, status: BookingStatus) => void;
}

const StaffView: React.FC<StaffViewProps> = ({ menus, bookings, users, onAddMenu, onToggleMenu, onDeleteMenu, onUpdateBooking }) => {
  const [activeTab, setActiveTab] = useState<'menus' | 'validate'>('menus');
  const [ticketCode, setTicketCode] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);

  // Menu Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<MealType>(MealType.LUNCH);
  const [price, setPrice] = useState(3.50);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSuggest = async () => {
    setIsAiLoading(true);
    try {
      const suggestion = await suggestMenu("healthy university lunch with protein and fiber");
      setDescription(`${suggestion.title}: ${suggestion.description}`);
    } catch (err) {
      alert("Failed to get AI suggestion.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMenu({ date, type, price, description, isActive: true, imageUrl });
    setDescription('');
    setImageUrl('');
  };

  const handleSearch = () => {
    const b = bookings.find(x => x.qrCode.toUpperCase() === ticketCode.toUpperCase());
    if (b) {
      setFoundBooking(b);
    } else {
      setFoundBooking(null);
      alert("Code de ticket introuvable.");
    }
  };

  const handleProcessPayment = () => {
    if (foundBooking) {
      onUpdateBooking(foundBooking.id, BookingStatus.PAID);
      setFoundBooking({ ...foundBooking, status: BookingStatus.PAID });
      alert("Paiement encaissé ! Vous pouvez maintenant valider le repas.");
    }
  };

  const handleConsume = () => {
    if (foundBooking) {
      if (foundBooking.status === BookingStatus.PENDING) {
        alert("Attention: Le ticket n'est pas encore payé !");
        return;
      }
      onUpdateBooking(foundBooking.id, BookingStatus.VALIDATED);
      setFoundBooking({ ...foundBooking, status: BookingStatus.VALIDATED });
      alert("Ticket validé et désactivé. Bon appétit !");
      setTicketCode('');
      setFoundBooking(null);
    }
  };

  const foundStudent = foundBooking ? users.find(u => u.id === foundBooking.studentId) : null;
  const foundMenu = foundBooking ? menus.find(m => m.id === foundBooking.menuId) : null;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('menus')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'menus' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Gérer les Menus
        </button>
        <button 
          onClick={() => setActiveTab('validate')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'validate' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Vérifier un Ticket
        </button>
      </div>

      {activeTab === 'menus' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Creation */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ajouter un Menu 🇲🇷
            </h3>
            <form onSubmit={handleAddMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <input type="date" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={type} onChange={e => setType(e.target.value as MealType)}>
                    {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prix (MRU)</label>
                  <input type="number" step="0.01" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={price} onChange={e => setPrice(parseFloat(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Image URL</label>
                  <input type="text" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase">Description</label>
                  <button 
                    type="button" 
                    onClick={handleSuggest}
                    disabled={isAiLoading}
                    className="text-[10px] flex items-center text-indigo-600 font-bold hover:text-indigo-800 disabled:opacity-50"
                  >
                    {isAiLoading ? 'GÉNÉRATION...' : 'SUGGESTION IA'}
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </button>
                </div>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  placeholder="Ex: Thieboudienne Mauritanien..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all shadow-md">
                Publier le Menu
              </button>
            </form>
          </div>

          {/* Menu List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Menus Actuels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menus.map(menu => (
                <div key={menu.id} className={`p-4 rounded-xl border-2 transition-all bg-white flex flex-col ${menu.isActive ? 'border-indigo-100 shadow-sm' : 'border-gray-200 opacity-75'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex space-x-3">
                      {menu.imageUrl && <img src={menu.imageUrl} className="w-12 h-12 rounded-lg object-cover" />}
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          menu.type === MealType.BREAKFAST ? 'bg-yellow-100 text-yellow-700' : 
                          menu.type === MealType.LUNCH ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {menu.type}
                        </span>
                        <h4 className="font-bold text-gray-900 mt-1">{menu.date}</h4>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">{menu.price.toFixed(2)} MRU</p>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">{menu.description}</p>
                  <div className="flex items-center space-x-2 border-t pt-4">
                    <button 
                      onClick={() => onToggleMenu(menu.id)}
                      className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all ${menu.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {menu.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button 
                      onClick={() => onDeleteMenu(menu.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {menus.length === 0 && <div className="col-span-full p-12 text-center text-gray-400 border-2 border-dashed rounded-xl">Aucun menu créé.</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto py-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-indigo-700 p-8 text-white text-center">
              <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-full mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold">Vérification de Ticket</h3>
              <p className="text-indigo-200 mt-2">Scannez ou saisissez le code pour vérifier le statut</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    className="flex-grow px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none transition-all uppercase font-mono"
                    placeholder="Saisir le code (ex: UR-MR...)"
                    value={ticketCode}
                    onChange={e => setTicketCode(e.target.value)}
                  />
                  <button 
                    onClick={handleSearch}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    Chercher
                  </button>
                </div>

                {foundBooking && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Étudiant</p>
                        <p className="text-lg font-bold text-gray-900">{foundStudent?.name || 'Inconnu'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        foundBooking.status === BookingStatus.PAID ? 'bg-green-100 text-green-700' : 
                        foundBooking.status === BookingStatus.VALIDATED ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {foundBooking.status === BookingStatus.PAID ? 'Payé' : 
                         foundBooking.status === BookingStatus.VALIDATED ? 'Déjà Utilisé' : 'En Attente'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Repas</p>
                        <p className="text-sm font-bold text-indigo-600">{foundMenu?.type || 'Menu Supprimé'}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Paiement</p>
                        <p className="text-sm font-bold text-gray-700">
                          {foundBooking.paymentMethod === PaymentMethod.ONLINE ? 'En Ligne' : 'Sur Place'}
                        </p>
                      </div>
                    </div>

                    {foundBooking.status === BookingStatus.PAID ? (
                      <button 
                        onClick={handleConsume}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Valider et Désactiver le Ticket</span>
                      </button>
                    ) : foundBooking.status === BookingStatus.VALIDATED ? (
                      <div className="w-full bg-gray-200 text-gray-500 font-bold py-4 rounded-xl text-center flex items-center justify-center space-x-2 border border-gray-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Ce ticket a déjà été utilisé</span>
                      </div>
                    ) : (
                      <button 
                        onClick={handleProcessPayment}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>Encaisser Paiement ({foundMenu?.price.toFixed(2)} MRU)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
