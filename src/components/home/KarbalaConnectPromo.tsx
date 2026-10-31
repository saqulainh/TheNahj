import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function KarbalaConnectPromo() {
  return (
    <aside
      className="karbala-connect-card relative mt-7 w-full max-w-[620px] overflow-hidden rounded-[22px] border border-white/10 bg-[#171d18]/90 p-4 text-left text-white shadow-[0_22px_60px_-34px_rgba(0,0,0,.9)] backdrop-blur-xl sm:mt-8 sm:p-5"
      aria-label="Karbala Connect app"
    >
      <div className="kc-leaf-layer" aria-hidden="true">
        <i className="kc-leaf kc-leaf--a kc-leaf--one" />
        <i className="kc-leaf kc-leaf--c kc-leaf--two" />
        <i className="kc-leaf kc-leaf--f kc-leaf--three" />
        <i className="kc-leaf kc-leaf--g kc-leaf--four" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[17px] border border-[#d9bb79]/35 bg-[#064a37] shadow-[0_8px_24px_-12px_rgba(0,0,0,.8)] sm:h-[62px] sm:w-[62px]">
            <Image src="/karbala-connect-logo.webp" alt="" fill sizes="62px" className="scale-[1.12] object-cover" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[.15em] text-emerald-200">Karbala Connect</span>
              <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[.11em] text-white/55">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.75)]" />
                Live now
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug text-white sm:text-[15px]">A home for the voices of Karbala</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/55">Nauhe, duas, recitations and community.</p>
          </div>
        </div>

        <Link href="/karbala-connect" aria-label="Explore Karbala Connect" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[.1] text-white transition-all hover:bg-emerald-400 hover:text-[#06110b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-emerald-300">
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
