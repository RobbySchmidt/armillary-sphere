<script setup lang="ts">
// Hero — opens on the lodestar itself (Polaris, α UMi) and the armillary sphere.
</script>

<template>
  <section id="top" class="relative overflow-hidden bg-ink">
    <!-- faint star-chart graticule -->
    <div class="pointer-events-none absolute inset-0 graticule opacity-50" aria-hidden="true" />
    <!-- warm core glow behind the instrument -->
    <div
      class="pointer-events-none absolute right-[8%] top-1/2 hidden size-[34rem] -translate-y-1/2 rounded-full opacity-60 blur-3xl lg:block"
      style="background: radial-gradient(circle, rgba(231,198,107,0.18), transparent 65%)"
      aria-hidden="true"
    />

    <div
      class="relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-24 pb-16 lg:grid-cols-[1.05fr_0.95fr]"
    >
      <!-- Copy -->
      <div>
        <p class="rise rise-1 font-tel text-[11px] uppercase tracking-widest-2 text-brass">
          α&nbsp;UMi &nbsp;·&nbsp; RA 02ʰ&nbsp;31ᵐ&nbsp;49ˢ &nbsp;·&nbsp; DEC +89°&nbsp;15′&nbsp;51″
        </p>

        <h1
          class="rise rise-2 engrave mt-5 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-normal leading-[1.04] text-bone"
        >
          Find true north for
          <span class="italic text-brass-bright">everything</span>
          you ship.
        </h1>

        <p class="rise rise-3 mt-6 max-w-md text-[15px] leading-relaxed text-haze">
          Lodestar is the observability platform that gives your distributed systems a
          single fixed reference point. Plot every metric, log, and trace against one
          chart — and always know which way is up.
        </p>

        <div class="rise rise-4 mt-9 flex flex-wrap items-center gap-4">
          <a
            href="#course"
            class="font-tel text-xs uppercase tracking-widest-2 text-ink bg-brass hover:bg-brass-bright transition-colors rounded-sm px-6 py-3"
          >
            Set your course
          </a>
          <a
            href="#catalog"
            class="font-tel text-xs uppercase tracking-widest-2 text-bone border border-hairline hover:border-brass transition-colors rounded-sm px-6 py-3"
          >
            Read the atlas →
          </a>
        </div>

        <div class="rise rise-4 mt-12 h-px w-40 origin-left brass-rule draw-rule" aria-hidden="true" />
        <p class="rise rise-4 mt-4 font-tel text-[11px] text-haze/70">
          Trusted at 40 ground stations · OpenTelemetry-native
        </p>
      </div>

      <!-- Instrument -->
      <div class="relative h-[340px] w-full sm:h-[440px] lg:h-[560px]">
        <ClientOnly>
          <CelestialArmillary3D class="absolute inset-0" />
          <template #fallback>
            <div class="absolute inset-0 grid place-items-center" aria-hidden="true">
              <div class="size-48 rounded-full border border-brass/40" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </div>
  </section>
</template>
