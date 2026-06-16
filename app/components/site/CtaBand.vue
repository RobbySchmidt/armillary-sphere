<template>
  <section class="border-y border-line bg-surface">
    <div class="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-semibold text-text sm:text-3xl">Lasst uns euren wahren Norden finden.</h2>
        <p class="mt-2 text-sm text-muted">Erzählt uns von eurem Vorhaben — wir melden uns.</p>
      </div>
      <NuxtLink
        to="/kontakt"
        class="shrink-0 rounded-sm bg-accent px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-white transition-colors hover:bg-accent-bright"
      >
        Kontakt aufnehmen ↗
      </NuxtLink>
    </div>
  </section>
</template>
