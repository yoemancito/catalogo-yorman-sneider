import { computed, ref } from "vue";
import { defineStore } from "pinia";

export const useAuthStore = defineStore(
  "auth",
  () => {
    // La sesion vive SOLO en memoria: no se persiste en localStorage.
    // Asi, al recargar o cerrar el navegador se pide login de nuevo.
    const token = ref(null);

    const estaAutenticado = computed(() => !!token.value);

    function guardarSesion(respuesta) {
      token.value = respuesta.token;
    }

    function cerrarSesion() {
      token.value = null;
    }

    return {
      token,
      estaAutenticado,
      guardarSesion,
      cerrarSesion,
    };
  }
);
