<script setup lang="ts">
// Closing call — keep the bearing metaphor; quiet around the one bright line.
</script>

<template>
  <section id="course" class="relative overflow-hidden bg-void py-28 sm:py-36">
    <div class="pointer-events-none absolute inset-0 graticule opacity-30" aria-hidden="true" />
    <div
      class="pointer-events-none absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-50 blur-3xl"
      style="background: radial-gradient(circle, rgba(231,198,107,0.2), transparent 65%)"
      aria-hidden="true"
    />

    <div class="relative z-10 mx-auto max-w-3xl px-6 text-center">
      <p class="font-tel text-[11px] uppercase tracking-widest-2 text-brass">Plot a course</p>
      <h2 class="mt-5 font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[1.05] text-bone engrave">
        Stop guessing which way is up.
      </h2>
      <p class="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-haze">
        Point Lodestar at your systems and get a single fixed bearing in minutes. Your
        first ground station is free — no card, no orbit lock-in.
      </p>

      <div class="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#top"
          class="rounded-sm bg-brass px-7 py-3.5 font-tel text-xs uppercase tracking-widest-2 text-ink transition-colors hover:bg-brass-bright"
        >
          Set your course
        </a>
        <a
          href="#catalog"
          class="rounded-sm border border-hairline px-7 py-3.5 font-tel text-xs uppercase tracking-widest-2 text-bone transition-colors hover:border-brass"
        >
          Talk to an engineer
        </a>
      </div>
    </div>
  </section>
</template>
