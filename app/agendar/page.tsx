'use client';

import { useState, useEffect, useMemo } from 'react';
import { mockSchedule, Service } from '@/lib/mock_data';
import { Scissors, User, Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AgendarPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(mockSchedule[0].date);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useEffect(() => {
    // 1. Busca Serviços do Banco (Tabela Nova)
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.services) setDbServices(data.services);
      })
      .catch(console.error)
      .finally(() => setIsLoadingServices(false));

    // 2. Busca Ocupados do Banco (Supabase appointments)
    fetch('/api/agendar')
      .then(res => res.json())
      .then(data => {
        if (data.appointments) {
          const booked = data.appointments.map((apt: any) => {
            const d = new Date(apt.start_time);
            // Corrige o offset de timezone local extraindo direto (gambiarra de protótipo segura pra BR)
            // Extrai YYYY-MM-DD
            const isoString = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
            const dateKey = isoString.split('T')[0];
            const timeKey = isoString.substring(11, 16); // HH:mm
            return `${dateKey}-${timeKey}`;
          });
          setBookedSlots(booked);
        }
      })
      .catch(console.error);
  }, []);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !customerName || !customerPhone) return;
    
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // 1. Prepara as datas no padrão ISO para o Banco de Dados (Postgres timestamp with time zone)
      const startDateTime = new Date(`${selectedDate}T${selectedTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + selectedService.durationMinutes * 60000);

      // 2. Chama a nossa API de Produção (Camada 3)
      const res = await fetch('/api/agendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: customerName,
          client_phone: customerPhone.replace(/\D/g, ''), // Manda só os números pro banco
          service_id: selectedService.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Ex: Erro 409 Double Booking (Trava do Postgres barrando)
        throw new Error(data.error || 'Falha ao agendar horário');
      }

      // 3. Se passou pela Trava e marcou no Google, a gente mostra sucesso e abre o WhatsApp
      setShowSuccess(true);
      
      const message = `Olá Augusto! Gostaria de agendar um ${selectedService.name} para o dia ${selectedDate.split('-').reverse().join('/')} às ${selectedTime}. Meu nome é ${customerName}.`;
      const whatsappUrl = `https://wa.me/5513955509911?text=${encodeURIComponent(message)}`;
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setShowSuccess(false);
        // Reseta o fluxo lindamente
        setStep(1);
        setSelectedService(null);
        setSelectedDate(mockSchedule[0].date);
        setSelectedTime(null);
        setCustomerName('');
        setCustomerPhone('');
      }, 600);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = (iconName?: string) => {
    return <Scissors className="w-6 h-6" />;
  };

  // Agrupamento de datas para o Calendário Mensal
  const calendarMonths = useMemo(() => {
    return mockSchedule.reduce((acc, day) => {
      const d = new Date(day.date + 'T12:00:00');
      const monthName = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      if (!acc[capitalized]) acc[capitalized] = [];
      acc[capitalized].push(day);
      return acc;
    }, {} as Record<string, typeof mockSchedule>);
  }, []);

  return (
    <main className="min-h-[100dvh] flex flex-col items-center py-4 sm:py-8 px-3 sm:px-6 lg:px-8 bg-black">
      {/* Success Notification */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-yellow-500 px-6 py-3 rounded-full shadow-2xl border border-yellow-500/20 flex items-center gap-2 transition-all duration-300 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Agendamento preparado! Redirecionando...</span>
      </div>

      {/* Error Notification */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-950 text-red-500 px-6 py-3 rounded-full shadow-2xl border border-red-500/20 flex items-center gap-2 transition-all duration-300 ${errorMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <span className="font-medium">{errorMessage}</span>
      </div>

      {/* Header */}
      <header className="w-full max-w-3xl mb-8 relative flex items-center justify-center">
        <Link href="/" className="absolute left-0 text-neutral-400 hover:text-yellow-500 transition-colors flex items-center gap-2 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 rounded-lg px-2 py-1" aria-label="Voltar para a página inicial">
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
        <div className="font-serif flex flex-col items-center leading-none drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
          <div className="flex gap-2 text-2xl font-bold tracking-wider">
            <span className="text-yellow-500">GU</span>
            <span className="text-white">CORTES</span>
          </div>
          <span className="text-yellow-500 text-lg tracking-widest mt-1">BARBEARIA</span>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-neutral-900 -z-10"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-yellow-500 -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${step >= i ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
            {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-3xl bg-neutral-900/80 backdrop-blur-md border-0 sm:border border-neutral-800/50 rounded-[2rem] sm:rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl">
        
        {/* Step 1: Select Service */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="font-serif text-2xl text-neutral-50 mb-6 flex items-center gap-2">
              <Scissors className="text-yellow-500" />
              Escolha o Serviço
            </h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {isLoadingServices ? (
                <div className="col-span-full text-neutral-500 py-10 flex justify-center items-center gap-2">
                  <Loader2 className="animate-spin w-6 h-6"/> Carregando cardápio de serviços...
                </div>
              ) : dbServices.length === 0 ? (
                <div className="col-span-full text-neutral-500 py-10 text-center">Nenhum serviço disponível no momento.</div>
              ) : dbServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-[1.5rem] sm:rounded-xl border border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(234,179,8,0.15)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 overflow-hidden"
                  aria-label={`Selecionar serviço: ${service.name}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/5 group-hover:to-transparent transition-all duration-500"></div>
                  <div className="w-14 h-14 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-yellow-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    {getIcon(service.icon)}
                  </div>
                  <h3 className="font-serif text-xl font-medium text-neutral-100 mb-2">{service.name}</h3>
                  <p className="text-sm text-neutral-400 mb-4 flex-grow">{service.description}</p>
                  <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-neutral-800/50">
                    <span className="text-yellow-500 font-semibold">R$ {service.price.toFixed(2)}</span>
                    <span className="text-neutral-500 text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> {service.durationMinutes} min</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-neutral-50 flex items-center gap-2">
                <CalendarIcon className="text-yellow-500" />
                Escolha o Horário
              </h2>
              <button onClick={() => setStep(1)} className="text-sm text-neutral-400 hover:text-yellow-500 transition-colors">
                Voltar
              </button>
            </div>

            {/* Date Selector (Monthly Calendar Grid) */}
            <div className="mb-8 space-y-6">
              {(() => {
                const monthEntries = Object.entries(calendarMonths);
                if (monthEntries.length === 0) return null;
                const [month, days] = monthEntries[currentMonthIndex];
                
                return (
                  <div key={month} className="bg-neutral-900/40 rounded-3xl sm:rounded-2xl p-3 sm:p-4 md:p-6 border border-neutral-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <button 
                        onClick={() => setCurrentMonthIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentMonthIndex === 0}
                        className="p-2 text-neutral-400 hover:text-yellow-500 disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5"/>
                      </button>
                      
                      <h3 className="text-xl font-serif text-yellow-500 text-center">{month}</h3>
                      
                      <button 
                        onClick={() => setCurrentMonthIndex(prev => Math.min(monthEntries.length - 1, prev + 1))}
                        disabled={currentMonthIndex === monthEntries.length - 1}
                        className="p-2 text-neutral-400 hover:text-yellow-500 disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5"/>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, idx) => (
                        <div key={idx} className="text-center text-xs font-bold text-neutral-500 uppercase">{dia}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {days.map((day) => {
                        const dateObj = new Date(day.date + 'T12:00:00');
                        const dayOfWeek = dateObj.getDay(); 
                        const dayNumber = dateObj.getDate();
                        const isSelected = selectedDate === day.date;
                        const isDayAvailable = day.slots.some(s => s.available);
                        
                        return (
                          <button
                            key={day.date}
                            style={{ gridColumnStart: dayOfWeek + 1 }}
                            disabled={!isDayAvailable}
                            onClick={() => { setSelectedDate(day.date); setSelectedTime(null); }}
                            className={`aspect-square min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center rounded-xl sm:rounded-2xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 ${
                              !isDayAvailable 
                                ? 'bg-black/20 text-neutral-700 border-neutral-900 cursor-not-allowed opacity-50'
                                : isSelected 
                                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] font-bold scale-105' 
                                  : 'bg-black/50 text-neutral-300 border-neutral-800 hover:border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-500 hover:scale-105 active:scale-95'
                            }`}
                            aria-label={`Selecionar data: ${dayNumber}`}
                            aria-pressed={isSelected}
                          >
                            <span className="text-sm sm:text-lg font-serif">{dayNumber}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {mockSchedule.find(d => d.date === selectedDate)?.slots.map((slot) => {
                const searchKey = `${selectedDate}-${slot.time}`;
                const isBookedInDB = bookedSlots.includes(searchKey);
                const isAvailable = slot.available && !isBookedInDB;
                
                return (
                  <button
                    key={slot.time}
                    disabled={!isAvailable}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`py-4 sm:py-3 rounded-xl sm:rounded-lg text-base sm:text-sm font-medium transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 ${
                      !isAvailable 
                        ? 'bg-black/50 text-neutral-600 border-neutral-900 cursor-not-allowed' 
                        : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-yellow-500/50 hover:text-yellow-500 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(234,179,8,0.1)] active:scale-95'
                    }`}
                    aria-label={`Selecionar horário: ${slot.time}`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-800"></div> Disponível</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-black/50 border border-neutral-900"></div> Ocupado</div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-neutral-50 flex items-center gap-2">
                <CheckCircle2 className="text-yellow-500" />
                Confirme seu Agendamento
              </h2>
              <button onClick={() => setStep(2)} className="text-sm text-neutral-400 hover:text-yellow-500 transition-colors">
                Voltar
              </button>
            </div>

            <div className="bg-black/50 border border-neutral-800 rounded-xl p-5 mb-8">
              <h3 className="text-yellow-500 font-medium mb-4 uppercase tracking-wider text-sm">Resumo do Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Serviço</span>
                  <span className="text-neutral-100 font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Data</span>
                  <span className="text-neutral-100 font-medium">{selectedDate.split('-').reverse().join('/')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Horário</span>
                  <span className="text-neutral-100 font-medium">{selectedTime}</span>
                </div>
                <div className="pt-3 mt-3 border-t border-neutral-800 flex justify-between items-center">
                  <span className="text-neutral-400">Total</span>
                  <span className="text-yellow-500 font-serif text-xl font-bold">R$ {selectedService?.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-400 mb-1">Seu Nome</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="Como devemos te chamar?"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-neutral-400 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={customerPhone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.length > 11) val = val.slice(0, 11);
                    
                    if (val.length > 10) {
                      val = val.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                    } else if (val.length > 6) {
                      val = val.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
                    } else if (val.length > 2) {
                      val = val.replace(/^(\d{2})(\d{0,4}).*/, '($1) $2');
                    } else if (val.length > 0) {
                      val = val.replace(/^(\d{0,2}).*/, '($1');
                    }
                    setCustomerPhone(val);
                  }}
                  className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 transition-all"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-500/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Confirmar via WhatsApp
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
