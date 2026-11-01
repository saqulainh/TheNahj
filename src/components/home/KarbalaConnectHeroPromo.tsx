import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function KarbalaConnectHeroPromo() {
  return (
    <aside className="relative mt-7 w-full max-w-[680px] overflow-hidden rounded-[22px] border border-white/[.09] bg-[#14221a]/90 p-4 text-left text-white shadow-[0_18px_48px_-30px_rgba(0,0,0,.9)] backdrop-blur-xl sm:mt-8 sm:rounded-[25px] sm:p-5" aria-label="Karbala Connect app">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-emerald-400/10 blur-[70px]" />
      <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
        <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[16px] border border-[#d9bb79]/40 bg-[#064a37] shadow-[0_8px_24px_-12px_rgba(0,0,0,.8)] sm:h-[68px] sm:w-[68px] sm:rounded-[19px]">
          <Image src="/karbala-connect-logo.webp" alt="" fill sizes="68px" className="scale-[1.12] object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-[.14em] sm:text-[11px]">
            <span className="text-emerald-200">Karbala Connect</span>
            <span className="inline-flex items-center gap-1.5 text-white/55"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.75)]" />Live now</span>
          </div>
          <p className="mt-1 text-[13px] font-semibold leading-snug sm:text-base">A home for the voices of Karbala</p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/55 sm:text-xs">Nauhe, duas, recitations and community.</p>
        </div>
        <Link href="/karbala-connect" aria-label="Explore Karbala Connect" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[.1] text-white transition-colors hover:bg-emerald-400 hover:text-[#06110b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-300 sm:h-12 sm:w-12">
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
