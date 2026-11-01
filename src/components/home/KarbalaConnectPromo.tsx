import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Headphones, MapPin, Radio, WifiOff } from "lucide-react";
import { StoreBadges } from "@/components/home/StoreBadges";

const features = [
  { label: "Nauhe, marsiye and manqabat", icon: Headphones },
  { label: "Quran and recitations", icon: BookOpen },
  { label: "Duas and ziyarat", icon: Radio },
  { label: "Anjumans and local community", icon: MapPin },
];

export function KarbalaConnectPromo() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 md:py-10" aria-labelledby="karbala-connect-promo-title">
      <div className="karbala-connect-card relative isolate overflow-hidden rounded-[26px] border border-white/10 bg-[#171b18] px-5 py-7 text-white shadow-[0_24px_70px_-42px_rgba(0,0,0,.9)] sm:rounded-[30px] sm:px-8 sm:py-8 lg:px-10 lg:py-9">
        <div className="kc-leaf-layer" aria-hidden="true">
          <i className="kc-leaf kc-leaf--a kc-leaf--one" />
          <i className="kc-leaf kc-leaf--c kc-leaf--two" />
          <i className="kc-leaf kc-leaf--f kc-leaf--three" />
          <i className="kc-leaf kc-leaf--g kc-leaf--four" />
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_14%_0%,rgba(255,255,255,.11),transparent_34%),radial-gradient(ellipse_at_85%_85%,rgba(0,190,105,.12),transparent_38%)]" />

        <div className="relative z-10 grid items-center gap-7 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[18px] border border-[#d9bb79]/45 bg-[#064a37] shadow-[0_8px_24px_-12px_rgba(0,0,0,.8)] sm:h-[68px] sm:w-[68px]">
                <Image src="/karbala-connect-logo.webp" alt="Karbala Connect logo" fill sizes="68px" className="scale-[1.12] object-cover" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-emerald-200">
                  <span>Karbala Connect</span>
                  <span className="inline-flex items-center gap-1.5 text-white/65"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.75)]" />Live on stores</span>
                </div>
                <p className="mt-1 text-lg font-semibold sm:text-xl">Islamic audio, together</p>
              </div>
            </div>

            <h2 id="karbala-connect-promo-title" className="mt-5 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-.045em] sm:text-4xl lg:text-[2.75rem]">
              The voices of Karbala, close at hand.
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/65 sm:text-base">
              Listen to Nauhe, Duas, Manqabat and Quran recitations, and stay connected with the community in one free app.
            </p>

            <StoreBadges className="mt-5" />

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-white/60 sm:text-[13px]">
              <span>Free forever</span><span>No subscription</span><span>Android &amp; iOS</span>
            </div>

            <Link href="/karbala-connect" className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#111713] transition-all hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white">
              Explore the app <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="relative grid gap-2.5" aria-label="Karbala Connect features">
            {features.map(({ label, icon: Icon }) => (
              <div key={label} className="flex min-h-[58px] items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.075] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.035)] backdrop-blur-sm sm:min-h-[62px] sm:px-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[.08] text-emerald-200"><Icon size={18} strokeWidth={1.8} aria-hidden="true" /></span>
                <span className="text-[13px] font-semibold sm:text-sm">{label}</span>
              </div>
            ))}
            <p className="mt-1 flex items-center gap-2 px-1 text-xs text-white/45 sm:text-sm"><WifiOff size={15} aria-hidden="true" />Made for the community, free to explore.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
