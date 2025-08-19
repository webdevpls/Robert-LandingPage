"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export default function Landing() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const lastTimeRef = useRef(0); // guarda o último tempo válido (para desfazer seeks)
  const startedRef = useRef(false); // só dispara VideoPlay 1x
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const ctaUnlockedRef = useRef(false);

  // formatador de mm:ss
  const fmt = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // quando o vídeo começar a tocar pela primeira vez
  const onPlay = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      window.fbq?.("trackCustom", "VideoPlay");
    }
  };

  // mantém o tempo e controla o desbloqueio do CTA por tempo assistido
  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrent(t);
    lastTimeRef.current = t;

    // libera CTA ao atingir 10s assistidos
    if (!ctaUnlockedRef.current && t >= 10) {
      ctaUnlockedRef.current = true;
      setButtonEnabled(true);
      window.fbq?.("trackCustom", "CTAUnlockedAfter10s");
    }
  };

  // bloqueia tentativas de seek (mouse, teclado, arrastar timeline nativa, etc.)
  const onSeeking = () => {
    if (!videoRef.current) return;
    // sempre retorna ao último tempo válido
    if (Math.abs(videoRef.current.currentTime - lastTimeRef.current) > 0.25) {
      videoRef.current.currentTime = lastTimeRef.current;
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current?.duration) setDuration(videoRef.current.duration);
  };

  // também bloqueia atalhos de teclado que mudam o tempo (← → , .)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      // seta de esquerda/direita, J/L, vírgula/ponto (alguns navegadores)
      const keys = ["ArrowLeft", "ArrowRight", "j", "l", "J", "L", ",", "."];
      if (keys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () =>
      window.removeEventListener("keydown", handler, { capture: true } as any);
  }, []);

  const handleCTA = () => {
    window.fbq?.("track", "Lead");
  };

  // porcentagem para preencher a barra (somente visual)
  const pct = duration ? Math.min(100, (current / duration) * 100) : 0;

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-zinc-100 antialiased">
      {/* Meta Pixel */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1034863538856741');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1034863538856741&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0b0b0c]/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
          <span className="text-sm font-semibold tracking-wide text-zinc-200">
            RobertVillanueva
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pb-10 pt-16 sm:pt-20 md:pt-8">
        <h1 className="text-center text-3xl font-bold leading-tight sm:text-4xl md:text-5xl bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-100 bg-clip-text text-transparent">
          Entenda como donos de negócio automatizam todo operacional com
          Inteligência Artificial
        </h1>

        <p className="mt-4 text-center text-zinc-400 sm:text-lg md:mt-6 md:text-xl">
          Veja na prática como{" "}
          <span className="text-transparent bg-clip-text bg-[#d6b36c]">
            automação personalizada com IA
          </span>{" "}
          está eliminando gargalos, multiplicando faturamento e devolvendo tempo
          aos decisores
        </p>

        {/* Video Card */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30">
          <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
            <video
              ref={videoRef}
              src="/meu-video.mp4" // 👉 ajuste o caminho do seu arquivo
              playsInline
              controls // mantém play/pause/volume/etc.
              controlsList="nodownload noplaybackrate"
              className="w-full h-auto block"
              onLoadedMetadata={onLoadedMetadata}
              onPlay={onPlay}
              onTimeUpdate={onTimeUpdate}
              onSeeking={onSeeking}
            />
          </div>

          {/* Barra de progresso somente leitura */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span>{fmt(current)}</span>
              <span>{fmt(duration || 0)}</span>
            </div>

            {/* barra visual (sem interação) */}
            <div
              className="h-2 w-full rounded-full bg-zinc-700/60 relative select-none"
              // truque para não aceitar cliques/arrastos
              style={{ pointerEvents: "none" }}
              aria-hidden="true"
            >
              <div
                className="absolute left-0 top-0 h-2 rounded-full bg-[#d6b36c]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          id="cta"
          className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4"
        >
          <button
            disabled={!buttonEnabled}
            onClick={handleCTA}
            className={`group inline-flex w-full items-center justify-center rounded-[8px] px-6 py-4 text-center text-base font-semibold text-black shadow-lg transition focus:outline-none focus:ring-2 ${
              buttonEnabled
                ? "bg-[#d6b36c] shadow-amber-900/30 hover:brightness-105 focus:ring-[#d6b36c]/70"
                : "bg-gray-600/60 cursor-not-allowed opacity-60 focus:ring-transparent"
            }`}
          >
            Receber Solução Personalizada
          </button>
          {!buttonEnabled && (
            <span className="text-xs text-zinc-500">
              O botão libera após 10s de reprodução.
            </span>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-zinc-500">
        <span>CNPJ: 60.341.141/0001-08</span> © {new Date().getFullYear()}{" "}
        Robert Villanueva — todos os direitos reservados
      </footer>
    </main>
  );
}
