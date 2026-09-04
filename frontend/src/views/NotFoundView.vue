<script setup>
/**
 * /views/NotFoundView.vue
 * Vista para la ruta comodin "/:pathMatch(.*)*" de /router/index.js.
 * Toda aplicacion con router necesita una: sin ella, una URL mal escrita deja
 * la pantalla en blanco y parece que la app se rompio.
 */
</script>

<template>
  <q-page class="flex flex-center">
    <div class="text-center q-pa-xl">
      <q-icon name="travel_explore" size="72px" color="grey-5" />

      <h1 class="text-h4 text-weight-bold q-mt-md q-mb-xs">404</h1>
      <p class="texto-suave q-mb-lg">
        La ruta que intentas abrir no existe en el router.
      </p>

      <q-btn
        unelevated
        no-caps
        color="primary"
        icon="home"
        label="Volver al inicio"
        :to="{ name: 'home' }"
      />
    </div>
  </q-page>
</template>
