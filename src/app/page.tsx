"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function Landing() {
  const playerRef = useRef<any>(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const startedRef = useRef(false);
  const ctaUnlockedRef = useRef(false);

  // Lógica disparada quando o vídeo realmente começa (estado PLAYING)
  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT?.PlayerState.PLAYING && !startedRef.current) {
      startedRef.current = true;
      window.fbq?.("trackCustom", "VideoPlay");

      // libera CTA após 10 segundos de reprodução
      setTimeout(() => {
        if (!ctaUnlockedRef.current) {
          ctaUnlockedRef.current = true;
          setButtonEnabled(true);
          window.fbq?.("trackCustom", "CTAUnlockedAfter10s");
        }
      }, 10000);
    }
  };

  useEffect(() => {
    // Função chamada quando API do YouTube estiver pronta
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: "3hSPuxqynVk",
        playerVars: { playsinline: 1 },
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    };

    // Carrega o script da API de forma assincrônica
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  const handleCTA = () => {
    window.fbq?.("track", "Lead");
  };

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
            <div id="yt-player" className="w-full h-[400px]" />
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
