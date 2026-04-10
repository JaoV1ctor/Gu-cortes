'use client';

import { useState, useEffect } from 'react';
import { Lock, LogOut, Settings, Calendar, DollarSign, Edit2, Plus, Trash2, Menu, X, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'services' | 'schedule'>('services');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAptId, setDeletingAptId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', durationMinutes: '', description: '', icon: 'scissors' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'services') fetchServices();
      if (activeTab === 'schedule') fetchAppointments();
    }
  }, [isLoggedIn, activeTab]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/agendar');
      const data = await res.json();
      if (data.appointments) setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!id) return;
    setDeletingAptId(id);
    try {
       const res = await fetch(`/api/agendar?id=${id}`, { method: 'DELETE' });
       if (res.ok) {
         setAppointments(appointments.filter(a => a.id !== id));
       } else {
         alert("Erro ao excluir agendamento.");
       }
    } catch(e) {
       console.error(e);
       alert("Erro de conexão.");
    } finally {
       setDeletingAptId(null);
    }
  };

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (data.services) setServices(data.services);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    setTimeout(() => {
      if (password === 'admin123') {
        setIsLoggedIn(true);
      } else {
        setError('Senha incorreta.');
      }
      setIsLoggingIn(false);
    }, 300);
  };

  const handleOpenModal = (service: any = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: service.name, 
        price: service.price.toString(), 
        durationMinutes: service.durationMinutes.toString(), 
        description: service.description || '', 
        icon: service.icon || 'scissors' 
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', price: '', durationMinutes: '', description: '', icon: 'scissors' });
    }
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const method = editingService ? 'PUT' : 'POST';
    const body = {
      id: editingService?.id,
      name: formData.name,
      price: Number(formData.price),
      durationMinutes: Number(formData.durationMinutes),
      description: formData.description,
      icon: formData.icon
    };

    try {
      const res = await fetch('/api/services', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchServices();
      } else {
        alert("Erro ao salvar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServices(services.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
    setDeletingId(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border border-neutral-800 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-center text-neutral-50 mb-2">Acesso Restrito</h1>
          <p className="text-neutral-400 text-center mb-8 text-sm">Painel de controle Gu Cortes</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3.5 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                placeholder="••••••••"
              />
              {error && <p className="text-red-400 text-sm mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</p>}
            </div>
            <button
              type="submit" disabled={isLoggingIn}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <><Loader2 className="w-5 h-5 animate-spin" />Verificando...</> : 'Entrar no Painel'}
            </button>
          </form>
          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-neutral-500 hover:text-yellow-500">&larr; Voltar para o site</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-neutral-800">
        <h2 className="font-serif text-xl font-bold text-yellow-500">Admin</h2>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-neutral-400">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-20" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:relative w-full sm:w-80 md:w-72 bg-neutral-900 flex flex-col z-30 h-full md:h-screen shadow-2xl md:shadow-none`}>
        <div className="hidden md:block p-8 border-b border-neutral-800">
          <h2 className="font-serif text-2xl font-bold text-yellow-500 tracking-wide">GU CORTES</h2>
          <p className="text-xs text-neutral-400 mt-1 uppercase">Painel Admin</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 flex flex-col">
          <button onClick={() => { setActiveTab('services'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${activeTab === 'services' ? 'bg-yellow-500 text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
            <Settings className="w-5 h-5" /> Serviços e Preços
          </button>
          <button onClick={() => { setActiveTab('schedule'); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${activeTab === 'schedule' ? 'bg-yellow-500 text-black' : 'text-neutral-400 hover:bg-neutral-800'}`}>
            <Calendar className="w-5 h-5" /> Agenda e Horários
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button onClick={() => setIsLoggedIn(false)} className="flex items-center gap-3 px-4 py-3.5 text-neutral-400 hover:text-red-400 w-full rounded-xl hover:bg-red-500/10">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto bg-black relative">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-serif font-bold text-neutral-50 mb-2">{activeTab === 'services' ? 'Serviços' : 'Agenda'}</h1>
            </div>
            {activeTab === 'services' && (
              <button onClick={() => handleOpenModal()} className="bg-yellow-500 text-black px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-yellow-400">
                <Plus className="w-5 h-5" /> Novo Serviço
              </button>
            )}
          </header>

          {activeTab === 'services' && (
            <div className="grid gap-4">
              {isLoading ? <div className="text-neutral-500 flex items-center gap-2"><Loader2 className="animate-spin w-5 h-5"/> Carregando...</div> : services.length === 0 ? <p className="text-neutral-500">Nenhum serviço encontrado.</p> : services.map((service) => (
                <div key={service.id} className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between group relative overflow-hidden gap-4 sm:gap-0">
                  {deletingId === service.id && (
                    <div className="absolute inset-0 bg-neutral-900/95 backdrop-blur-sm z-20 flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl animate-in fade-in zoom-in duration-200">
                      <span className="text-sm font-bold text-red-500 uppercase tracking-widest text-center">Excluir "{service.name}"?</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(service.id)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95">Sim, apagar</button>
                        <button onClick={() => setDeletingId(null)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95">Cancelar</button>
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-medium text-neutral-100 mb-1">{service.name}</h3>
                    <p className="text-sm text-neutral-400">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="text-yellow-500 font-bold flex items-center gap-1 sm:justify-end"><DollarSign className="w-4 h-4" />{service.price}</div>
                      <div className="text-sm text-neutral-500 flex items-center gap-1 sm:justify-end"><Calendar className="w-3 h-3" />{service.durationMinutes} min</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(service)} className="p-2.5 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeletingId(service.id)} className="p-2.5 bg-neutral-800 text-red-400 rounded-lg hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'schedule' && (
             <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
                  <h3 className="font-medium text-neutral-200">Próximos Agendamentos Constatados</h3>
                  <span className="text-sm text-neutral-500">{appointments.length} Sessões Ativas</span>
                </div>
                <div className="divide-y divide-neutral-800">
                  {isLoading ? (
                    <div className="p-8 text-neutral-500 flex justify-center"><Loader2 className="animate-spin w-5 h-5"/></div>
                  ) : appointments.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">Nenhum evento futuro marcado.</div>
                  ) : appointments.map((apt, idx) => {
                    const d = new Date(apt.start_time);
                    const brTime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
                    const day = brTime.split('T')[0].split('-').reverse().join('/');
                    const time = brTime.substring(11, 16);
                    return (
                      <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-neutral-800/30 transition-colors group relative overflow-hidden gap-4 sm:gap-0">
                        {deletingAptId === apt.id && (
                          <div className="absolute inset-0 bg-neutral-900/95 backdrop-blur-sm z-20 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-right-4 duration-200">
                            <span className="text-xs font-bold text-red-500 uppercase tracking-tight text-center">Cancelar horário?</span>
                            <div className="flex gap-2">
                              <button onClick={() => handleDeleteAppointment(apt.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold active:scale-95">Confirmar</button>
                              <button onClick={() => setDeletingAptId(null)} className="bg-neutral-800 text-neutral-300 px-4 py-2 rounded-lg text-xs font-bold active:scale-95">Voltar</button>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-4">
                          <div className="bg-yellow-500/10 text-yellow-500 p-3 rounded-xl"><Calendar className="w-5 h-5"/></div>
                          <div>
                            <p className="text-neutral-200 font-medium">{day} às {time}</p>
                            <p className="text-neutral-500 text-sm">Cliente: <span className="text-neutral-300">{apt.client_name || 'N/A'}</span></p>
                            {apt.service_id && <p className="text-neutral-500 text-sm uppercase text-xs mt-1">Serviço: {apt.service_id}</p>}
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-4">
                          <span className="inline-block bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold uppercase ring-1 ring-green-500/20">Confirmado</span>
                          <button onClick={() => setDeletingAptId(apt.id)} className="p-2.5 bg-neutral-800 text-red-400 rounded-lg hover:bg-red-500/20 md:opacity-0 md:group-hover:opacity-100 transition-opacity" title="Cancelar Agendamento">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          )}

        </div>
      </main>

      {/* Modal Novo/Editar Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-lg">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="text-sm text-neutral-400">Nome</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 mt-1 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-neutral-400">Preço</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="R$ 0,00"
                    value={formData.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(formData.price)) : ''} 
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '');
                      if (!digits) {
                        setFormData({...formData, price: ''});
                        return;
                      }
                      const val = Number(digits) / 100;
                      setFormData({...formData, price: val.toString()});
                    }}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 mt-1 text-white" 
                  />
                </div>
                <div>
                  <label className="text-sm text-neutral-400">Duração</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="0 min"
                    value={formData.durationMinutes ? `${formData.durationMinutes} min` : ''} 
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, durationMinutes: digits});
                    }}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 mt-1 text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-400">Descrição (Opcional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 mt-1 text-white h-24" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-3 text-neutral-400 hover:text-white">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-5 py-3 bg-yellow-500 text-black font-bold rounded-xl flex items-center gap-2">
                  {isSaving && <Loader2 className="animate-spin w-4 h-4"/>} Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
