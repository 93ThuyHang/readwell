export default defineNuxtConfig({
  devtools: { enabled: false },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'trang. — Nhật ký đọc sách',
      meta: [
        { name: 'description', content: 'Nhật ký đọc sách — những trang sách làm mình dừng lại.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&family=Nunito:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400;1,600;1,700&display=swap',
        },
      ],
    },
  },

  routeRules: {
    '/api/**': {
      proxy: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/**`,
    },
  },

  compatibilityDate: '2024-04-03',
})
