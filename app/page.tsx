'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Instagram, MessageCircle, MapPin, Scissors, ChevronRight, Clock, Share2, CheckCircle2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LandingPage() {
  const [showShareToast, setShowShareToast] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5; // Multiplicador para uma rolagem mais suave/rápida
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Gu Cortes Barbearia',
          text: 'Agende seu horário na melhor barbearia da região!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erro ao compartilhar', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black selection:bg-yellow-500/30 selection:text-yellow-200">
      
      {/* Toast Notification for Share */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-yellow-500 px-6 py-3 rounded-full shadow-2xl border border-yellow-500/20 flex items-center gap-2 transition-all duration-300 ${showShareToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <CheckCircle2 className="w-5 h-5" />
        <span className="font-medium">Link copiado!</span>
      </div>
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image (Fachada) */}
        <div className="absolute inset-0 z-0 text-white">
          <Image 
            src="https://picsum.photos/seed/barbershop-facade/1920/1080" 
            alt="Fachada da Barbearia" 
            fill 
            sizes="100vw"
            quality={90}
            className="object-cover opacity-60"
            priority
            referrerPolicy="no-referrer"
          />
          {/* Overlay escuro para garantir leitura do texto */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-yellow-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center px-4 py-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full max-w-7xl mx-auto">
          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="absolute top-0 right-4 p-3 bg-black/50 backdrop-blur-md border border-neutral-800 rounded-full text-neutral-300 hover:text-yellow-500 hover:border-yellow-500/50 transition-all duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
            aria-label="Compartilhar página"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-neutral-900 mb-8 shadow-[0_0_40px_rgba(234,179,8,0.2)] group bg-black flex items-center justify-center hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-all duration-500">
            <div className="absolute inset-0 border-4 border-yellow-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
            <Image 
              src="/logo.jpg" 
              alt="Gu Cortes Barbearia Logo" 
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              priority
            />
          </div>

          {/* Logo Text */}
          <div className="flex flex-col items-center font-serif mb-8 drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]">
            <div className="flex gap-3 text-5xl sm:text-6xl md:text-8xl tracking-wider">
              <span className="text-yellow-500">GU</span>
              <span className="text-white">CORTES</span>
            </div>
            <span className="text-yellow-500 text-3xl sm:text-4xl md:text-6xl tracking-widest mt-2 uppercase">Barbearia</span>
          </div>
          
          <p className="text-neutral-300 max-w-lg mb-12 text-lg md:text-xl leading-relaxed font-light">
            Especialista em cortes clássicos, degradês perfeitos e barboterapia. 
            Elevando sua autoestima com um atendimento exclusivo.
          </p>

          {/* CTA Button */}
          <Link 
            href="/agendar" 
            className="group relative overflow-hidden bg-yellow-500 text-black font-bold text-lg md:text-xl py-4 px-8 md:py-5 md:px-12 rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)] transition-all duration-300 flex items-center gap-3 hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-500/50"
            aria-label="Agendar meu horário"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <Scissors className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Agendar Meu Horário</span>
            <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-neutral-500">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-yellow-500/50 to-transparent"></div>
        </div>
      </section>

      {/* 2. ABOUT SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative bg-black">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Photo */}
          <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)] border border-neutral-900 group">
            <Image 
              src="https://picsum.photos/seed/barber-working/800/1000" 
              alt="Augusto trabalhando" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          </div>
          
          {/* Text */}
          <div className="w-full md:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium mb-2">
              <Scissors className="w-4 h-4" />
              <span>A Arte da Barbearia</span>
            </div>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-neutral-50 leading-tight">
              Muito mais que um <span className="text-yellow-500 italic">simples corte</span>.
            </h2>
            <div className="space-y-4 text-neutral-400 text-lg leading-relaxed font-light">
              <p>
                Olá, eu sou o Augusto. Com mais de 8 anos de experiência na arte da barbearia, 
                minha missão sempre foi proporcionar mais do que apenas um serviço estético, mas sim uma 
                experiência de renovação e confiança.
              </p>
              <p>
                Acredito que cada cliente possui um estilo único. Por isso, dedico tempo para entender 
                o que você busca, combinando técnicas clássicas e tendências modernas para entregar um 
                resultado impecável, seja em um degradê navalhado ou em uma barboterapia relaxante.
              </p>
              <p className="text-neutral-300 font-medium border-l-2 border-yellow-500 pl-4 mt-6">
                &quot;O seu visual é a sua assinatura. Deixe-me ajudar a torná-la inesquecível.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CAROUSEL / GALLERY SECTION */}
      <section className="py-24 bg-neutral-900/30 border-y border-neutral-900/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
              Nosso <span className="text-yellow-500">Trabalho</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl">
              Confira alguns dos cortes e estilos que saem da nossa cadeira todos os dias. 
              Arraste para o lado para ver mais.
            </p>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `::-webkit-scrollbar { display: none; }`}} />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="min-w-[280px] md:min-w-[350px] h-[350px] md:h-[450px] relative rounded-2xl overflow-hidden snap-center shrink-0 border border-neutral-800 group cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(234,179,8,0.15)] transition-all duration-500 ease-out"
            >
              <Image 
                src={`https://picsum.photos/seed/haircut-style-${i}/600/800`} 
                alt={`Exemplo de Corte ${i}`} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-yellow-500 font-serif text-xl font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Estilo #{i}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CONTACT & LOCATION SECTION */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-50 mb-4">
            Onde <span className="text-yellow-500">Estamos</span>
          </h2>
          <p className="text-neutral-400 text-lg">Venha tomar um café e dar um tapa no visual.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 bg-neutral-900/40 border border-neutral-800/50 rounded-3xl p-6 md:p-10">
          
          {/* Contact Info */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-10">
            
            {/* Address */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                <MapPin className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-neutral-50 font-serif text-xl mb-2">Endereço</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Av. Paulista, 1000 - Bela Vista<br />
                  São Paulo - SP, 01310-100<br />
                  Sala 42 (Edifício Premium)
                </p>
              </div>
            </div>

            {/* Hours */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0 border border-yellow-500/20">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-neutral-50 font-serif text-xl mb-2">Horário</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Terça a Sexta: 09:00 às 20:00<br />
                  Sábado: 09:00 às 18:00<br />
                  Domingo e Segunda: Fechado
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-neutral-800/50">
              <h3 className="text-neutral-50 font-serif text-xl mb-6">Redes e Contato</h3>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/gu__cortess/" target="_blank" rel="noopener noreferrer" aria-label="Acessar Instagram" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-yellow-500 hover:text-yellow-500 hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-300 group">
                  <Instagram className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium uppercase tracking-wider">Instagram</span>
                </a>
                <a href="https://wa.me/5513955509911" target="_blank" rel="noopener noreferrer" aria-label="Entrar em contato pelo WhatsApp" className="flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:border-yellow-500 hover:text-yellow-500 hover:-translate-y-1 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 transition-all duration-300 group">
                  <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-medium uppercase tracking-wider">WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

          {/* Google Maps */}
          <div className="w-full lg:w-2/3 h-[400px] lg:h-auto min-h-[400px] rounded-2xl overflow-hidden border border-neutral-800 relative group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none z-10"></div>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.19758702902!2d-46.65649438502221!3d-23.56134958468263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sAv.%20Paulista%2C%20S%C3%A3o%20Paulo%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v1629999999999!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            ></iframe>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-8 text-center border-t border-neutral-800/50 bg-black mt-auto">
        <p className="text-neutral-500 text-sm mb-4">© {new Date().getFullYear()} Gu Cortes Digital. Todos os direitos reservados.</p>
        <Link href="/admin" className="text-xs text-neutral-600 hover:text-yellow-500 transition-colors uppercase tracking-wider font-medium">
          Acesso Restrito (Admin)
        </Link>
      </footer>
    </div>
  );
}
