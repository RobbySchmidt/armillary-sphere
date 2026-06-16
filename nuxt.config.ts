// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/tailwind.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      script: [
        {
          // Set the theme class before first paint to avoid a flash (FOUC).
          innerHTML:
            "(function(){try{var t=localStorage.getItem('rho-theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();",
          tagPosition: 'head',
        },
      ],
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/leistungen',
        '/projekte',
        '/projekte/hygieia',
        '/projekte/mzla',
        '/projekte/ergovision',
        '/agentur',
        '/kontakt',
      ],
    },
  },

  modules: ['shadcn-nuxt'],

  shadcn: {
    /**
     * Prefix for all the imported component.
     * @default "Ui"
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * Will respect the Nuxt aliases.
     * @link https://nuxt.com/docs/api/nuxt-config#alias
     * @default "@/components/ui"
     */
    componentDir: '@/components/ui'
  }
})