
import React, { useState } from 'react';
import { Menu, Booking, BookingStatus, MealType, PaymentMethod } from '../types';

interface StudentViewProps {
  menus: Menu[];
  bookings: Booking[];
  onBook: (menuId: string, paymentMethod: PaymentMethod) => void;
  onPay: (bookingId: string) => void;
}

const StudentView: React.FC<StudentViewProps> = ({ menus, bookings, onBook, onPay }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'tickets'>('browse');
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  
  const activeMenus = menus.filter(m => m.isActive);

  const handleBookingStart = (menuId: string) => {
    setSelectedMenuId(menuId);
  };

  const handleBookingConfirm = (method: PaymentMethod) => {
    if (selectedMenuId) {
      onBook(selectedMenuId, method);
      setSelectedMenuId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            Restaurant Universitaire 🇲🇷
          </h2>
          <p className="text-gray-500 font-medium italic">Spécialités Mauritaniennes & Qualité</p>
        </div>
        <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm flex space-x-1">
          <button onClick={() => setActiveTab('browse')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'browse' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Menu du jour</button>
          <button onClick={() => setActiveTab('tickets')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'tickets' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Mes Tickets</button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {activeMenus.map(menu => {
            const isBooked = bookings.some(b => b.menuId === menu.id);
            return (
              <div key={menu.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                {menu.imageUrl && (
                  <div className="h-52 overflow-hidden relative">
                    <img src={menu.imageUrl} alt={menu.description} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/95 backdrop-blur shadow-sm ${
                        menu.type === MealType.LUNCH ? 'text-blue-600' : 'text-indigo-600'
                      }`}>
                        {menu.type}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-bold text-gray-900">{new Date(menu.date).toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}</h4>
                    <span className="text-2xl font-black text-emerald-600">{menu.price.toFixed(2)} MRU</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-8 h-12 line-clamp-2">{menu.description}</p>
                  <button 
                    disabled={isBooked}
                    onClick={() => handleBookingStart(menu.id)}
                    className={`w-full py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                      isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700'
                    }`}
                  >
                    {isBooked ? 'Déjà Réservé' : 'Réserver pour 3.50 MRU'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const menu = menus.find(m => m.id === booking.menuId);
            const isUsed = booking.status === BookingStatus.VALIDATED;

            return (
              <div key={booking.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6 transition-opacity ${isUsed ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className={`p-4 rounded-2xl border-2 border-dashed ${isUsed ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="relative">
                    <svg className={`w-16 h-16 ${isUsed ? 'text-gray-400' : 'text-gray-800'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h4v4H3V3zm14 0h4v4h-4V3zM3 17h4v4H3v-4zm5-5h4v4H8v-4zm5-5h4v4h-4V7zM8 3h4v4H8V3zm5 0h4v4h-4V3zM3 8h4v4H3V8zm5 0h4v4H8V8zm5 0h4v4h-4V8zm5 0h4v4h-4V8zM3 13h4v4H3v-4zm5 5h4v4H8v-4zm5 0h4v4h-4v-4zm5-5h4v4h-4v-4zm0 5h4v4h-4v-4z" />
                    </svg>
                    {isUsed && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-1 bg-red-500/50 rotate-45"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-center mt-2 font-bold uppercase">{booking.qrCode}</p>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      booking.status === BookingStatus.PAID ? 'bg-green-500' : 
                      booking.status === BookingStatus.VALIDATED ? 'bg-gray-400' : 'bg-amber-500'
                    }`}></span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {booking.status === BookingStatus.VALIDATED ? 'Ticket Utilisé' : booking.status}
                    </span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {booking.paymentMethod === PaymentMethod.ONLINE ? 'En ligne' : 'Sur place'}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{menu?.type} - {booking.date}</h4>
                  <p className="text-sm text-gray-500 line-clamp-1">{menu?.description}</p>
                </div>

                <div className="w-full md:w-auto">
                  {booking.status === BookingStatus.PENDING ? (
                    <button onClick={() => onPay(booking.id)} className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-all">
                      {booking.paymentMethod === PaymentMethod.ONLINE ? `Payer 3.50 MRU` : 'Régler au guichet'}
                    </button>
                  ) : booking.status === BookingStatus.PAID ? (
                    <div className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-100 text-center">
                      Prêt pour le retrait
                    </div>
                  ) : (
                    <div className="px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl border border-gray-200 text-center flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Consommé</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {bookings.length === 0 && (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">Vous n'avez pas encore de tickets.</p>
            </div>
          )}
        </div>
      )}

      {/* Payment Selection Modal */}
      {selectedMenuId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-indigo-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Méthode de Paiement</h3>
              <p className="text-gray-500 mt-2 font-medium">Comment souhaitez-vous régler votre repas ?</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => handleBookingConfirm(PaymentMethod.ONLINE)}
                className="w-full flex items-center p-5 border-2 border-indigo-100 rounded-3xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V17m-3 3.935V19a2 2 0 012-2h1a2.5 2.5 0 002.5-2.5V14a2 2 0 00-2-2h-1a2 2 0 00-2-2V5a2 2 0 00-2-2H9.828a2 2 0 00-1.414.586l-1.359 1.359" />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-900">Payer en Ligne</p>
                  <p className="text-xs text-gray-500 font-medium italic">Accès rapide au self</p>
                </div>
              </button>

              <button 
                onClick={() => handleBookingConfirm(PaymentMethod.ONSITE)}
                className="w-full flex items-center p-5 border-2 border-gray-100 rounded-3xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
              >
                <div className="p-3 bg-gray-100 text-gray-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div className="ml-4 text-left">
                  <p className="font-bold text-gray-900">Payer sur Place</p>
                  <p className="text-xs text-gray-500 font-medium italic">Règlement au guichet</p>
                </div>
              </button>
            </div>

            <button 
              onClick={() => setSelectedMenuId(null)}
              className="w-full mt-8 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Annuler la réservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentView;
