<script setup lang="ts">
const tiers = [
  {
    name: 'Cadet',
    price: 'Free',
    sub: 'forever',
    desc: 'For solo navigators charting their first systems.',
    includes: ['1 ground station', '5-day retention', 'Community support', 'Up to 3 services'],
    cta: 'Start charting',
    featured: false,
  },
  {
    name: 'Navigator',
    price: '$60',
    sub: 'per month',
    desc: 'For teams flying production workloads.',
    includes: ['Unlimited stations', '30-day retention', 'Wandering-star detection', 'Quiet-sky alerting', 'Priority support'],
    cta: 'Set your course',
    featured: true,
  },
  {
    name: 'Observatory',
    price: 'Custom',
    sub: 'let’s talk',
    desc: 'For fleets operating at planetary scale.',
    includes: ['Dedicated capacity', 'Unlimited retention', 'SSO & audit logs', '24/7 white-glove support'],
    cta: 'Contact the observatory',
    featured: false,
  },
]
</script>

<template>
  <section id="tiers" class="relative bg-ink py-24 sm:py-32">
    <div class="mx-auto max-w-6xl px-6">
      <header class="max-w-xl">
        <p class="font-tel text-[11px] uppercase tracking-widest-2 text-brass">Mission tiers</p>
        <h2 class="mt-3 font-display text-4xl leading-tight text-bone sm:text-5xl">
          Chart free. Scale when you’re ready for orbit.
        </h2>
      </header>

      <div class="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline lg:grid-cols-3">
        <div
          v-for="t in tiers"
          :key="t.name"
          :class="[
            'relative flex flex-col bg-ink p-8 sm:p-10',
            t.featured ? 'lg:bg-void' : '',
          ]"
        >
          <span
            v-if="t.featured"
            class="absolute right-6 top-8 font-tel text-[10px] uppercase tracking-widest-2 text-brass"
          >
            most chosen
          </span>

          <h3 class="font-display text-2xl text-bone">{{ t.name }}</h3>
          <p class="mt-2 text-sm text-haze">{{ t.desc }}</p>

          <div class="mt-7 flex items-baseline gap-2">
            <span class="font-display text-5xl text-bone">{{ t.price }}</span>
            <span class="font-tel text-[11px] uppercase tracking-wider text-haze">{{ t.sub }}</span>
          </div>

          <ul class="mt-8 space-y-3 border-t border-hairline/60 pt-7">
            <li v-for="inc in t.includes" :key="inc" class="flex items-start gap-3 text-sm text-haze">
              <span class="mt-1 text-brass">✦</span>
              <span class="text-bone/90">{{ inc }}</span>
            </li>
          </ul>

          <a
            href="#course"
            :class="[
              'mt-9 inline-block rounded-sm px-5 py-3 text-center font-tel text-xs uppercase tracking-widest-2 transition-colors',
              t.featured
                ? 'bg-brass text-ink hover:bg-brass-bright'
                : 'border border-hairline text-bone hover:border-brass',
            ]"
          >
            {{ t.cta }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
