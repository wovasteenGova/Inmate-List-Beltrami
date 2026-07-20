// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@nuxt/ui"],

  css: ["~/assets/css/main.css", "~/assets/css/inmate.css"],

  ui: {
    colorMode: false,
  },

  vite: {
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },

  nitro: {
    preset: "netlify",
  },

  runtimeConfig: {
    public: {
      // Same-origin Nitro routes under /api/beltrami. Override only if hosting API elsewhere.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api/beltrami",
    },
  },

  app: {
    head: {
      title: "Inmate List Beltrami",
      htmlAttrs: { lang: "en" },
      meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Newsreader:ital,opsz,wght@0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&display=swap",
        },
      ],
    },
  },
});
