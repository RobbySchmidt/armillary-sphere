<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'Kontakt — rhowerk',
  meta: [
    { name: 'description', content: 'Erzählt uns von eurem Vorhaben. schmidt@rhowerk.de' },
  ],
})

// Rein visuell — kein Versand. Zeigt nur eine Bestätigung an.
const sent = ref(false)
const onSubmit = () => {
  sent.value = true
}
</script>

<template>
  <div class="rho">
    <section class="mx-auto grid max-w-6xl gap-12 px-6 pt-32 pb-24 lg:grid-cols-2">
      <div>
        <SiteSectionLabel text="Kontakt" />
        <h1
          class="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text"
        >
          Sagt uns, wohin die Reise geht.
        </h1>
        <p class="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
          Ob konkretes Projekt oder erste Idee — schreibt uns. Wir melden uns zügig zurück.
        </p>
        <dl class="mt-10 space-y-5 font-tel text-sm">
          <div>
            <dt class="text-[11px] uppercase tracking-widest-2 text-muted">E-Mail</dt>
            <dd class="mt-1">
              <a href="mailto:schmidt@rhowerk.de" class="text-text transition-colors hover:text-accent">
                schmidt@rhowerk.de
              </a>
            </dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-widest-2 text-muted">Web</dt>
            <dd class="mt-1 text-text">rhowerk.de</dd>
          </div>
          <div>
            <dt class="text-[11px] uppercase tracking-widest-2 text-muted">Studio</dt>
            <dd class="mt-1 text-text">Deutschland</dd>
          </div>
        </dl>
      </div>

      <form class="rounded-2xl border border-line bg-surface p-7" @submit.prevent="onSubmit">
        <div
          v-if="sent"
          class="mb-5 rounded-sm border border-accent/40 bg-accent/5 p-4 font-tel text-xs text-text"
        >
          Danke! (Dies ist eine visuelle Demo — es wurde nichts gesendet.)
        </div>
        <div class="grid gap-5">
          <label class="block">
            <span class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Name</span>
            <input
              type="text"
              class="mt-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-text outline-none transition-colors focus:border-accent"
            />
          </label>
          <label class="block">
            <span class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">E-Mail</span>
            <input
              type="email"
              class="mt-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-text outline-none transition-colors focus:border-accent"
            />
          </label>
          <label class="block">
            <span class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Nachricht</span>
            <textarea
              rows="5"
              class="mt-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-text outline-none transition-colors focus:border-accent"
            ></textarea>
          </label>
          <button
            type="submit"
            class="rounded-sm bg-accent px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-white transition-colors hover:bg-accent-bright"
          >
            Nachricht senden ↗
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
