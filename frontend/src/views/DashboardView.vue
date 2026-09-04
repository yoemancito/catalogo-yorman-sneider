<script setup>
import { useRouter } from "vue-router";

import { useGeneralStore } from "@/store/General";
import logo from "@/assets/logo.svg";

const router = useRouter();
const general = useGeneralStore();

const opciones = [
  {
    titulo: "Productos",
    subtitulo: "Gestionar el catalogo de productos",
    icono: "inventory_2",
    ruta: "productos",
    grad: "linear-gradient(135deg,#6a1b9a,#9c27b0)",
  },
  {
    titulo: "Categorias",
    subtitulo: "Administrar las categorias",
    icono: "category",
    ruta: "categorias",
    grad: "linear-gradient(135deg,#d81b60,#f06292)",
  },
  {
    titulo: "Proveedores",
    subtitulo: "Distribuidores y proveedores",
    icono: "local_shipping",
    ruta: "proveedores",
    grad: "linear-gradient(135deg,#4527a0,#7c4dff)",
  },
  {
    titulo: "Usuarios",
    subtitulo: "Administrar usuarios del sistema",
    icono: "people",
    ruta: "usuarios",
    grad: "linear-gradient(135deg,#8e24aa,#ba68c8)",
  },
  {
    titulo: "Importaciones",
    subtitulo: "Importar catalogo desde Excel",
    icono: "upload_file",
    ruta: "imports",
    grad: "linear-gradient(135deg,#6a1b9a,#d81b60)",
  },
];
</script>

<template>
  <div class="ys-admin">
    <header class="ys-admin__header">
      <div class="ys-admin__header-inner">
        <div class="ys-admin__titulo-grupo">
          <img :src="logo" alt="Logo" class="ys-admin__logo" />
          <div>
            <h1 class="ys-admin__titulo">Panel de administración</h1>
            <p class="ys-admin__subtitulo">Gestiona el catálogo de {{ general.titulo }}</p>
          </div>
        </div>
        <div class="ys-admin__acciones">
          <button class="ys-admin__boton" @click="router.push({ name: 'catalogo' })">
            Ver catálogo
          </button>
        </div>
      </div>
    </header>

    <main class="ys-admin__main">
      <p class="ys-admin__seccion">Selecciona una sección para comenzar</p>

      <div class="ys-admin__grid">
        <button
          v-for="opcion in opciones"
          :key="opcion.ruta"
          class="ys-tarjeta-admin"
          :style="{ background: opcion.grad }"
          @click="router.push({ name: opcion.ruta })"
        >
          <div class="ys-tarjeta-admin__icono">
            <q-icon :name="opcion.icono" size="34px" color="white" />
          </div>
          <div class="ys-tarjeta-admin__texto">
            <h3>{{ opcion.titulo }}</h3>
            <p>{{ opcion.subtitulo }}</p>
          </div>
          <div class="ys-tarjeta-admin__flecha">→</div>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ys-admin {
  min-height: 100vh;
  background: #f6f4fb;
  font-family: "Roboto", sans-serif;
}

.ys-admin__header {
  background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 55%, #d81b60 120%);
  color: #fff;
  padding: 34px 28px;
}
.ys-admin__header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.ys-admin__titulo-grupo {
  display: flex;
  align-items: center;
  gap: 16px;
}
.ys-admin__logo {
  width: 46px;
  height: 46px;
  border-radius: 12px;
}
.ys-admin__titulo {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
}
.ys-admin__subtitulo {
  margin: 4px 0 0;
  opacity: 0.9;
  font-size: 14px;
}
.ys-admin__boton {
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s;
}
.ys-admin__boton:hover {
  background: rgba(255, 255, 255, 0.28);
}

.ys-admin__main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 28px 60px;
}
.ys-admin__seccion {
  color: #9e9ab1;
  font-size: 14px;
  margin: 0 0 20px;
}

.ys-admin__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.ys-tarjeta-admin {
  border: none;
  border-radius: 18px;
  padding: 24px;
  color: #fff;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  box-shadow: 0 8px 24px rgba(74, 20, 140, 0.18);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  min-height: 160px;
}
.ys-tarjeta-admin:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(74, 20, 140, 0.28);
}
.ys-tarjeta-admin__icono {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.ys-tarjeta-admin__texto h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
}
.ys-tarjeta-admin__texto p {
  margin: 6px 0 0;
  font-size: 13px;
  opacity: 0.92;
}
.ys-tarjeta-admin__flecha {
  position: absolute;
  top: 22px;
  right: 22px;
  font-size: 20px;
  opacity: 0.8;
}
</style>
