<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "@/store/Auth";
import { useGeneralStore } from "@/store/General";

const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();

const menuItems = [
  { label: "Panel", icon: "dashboard", route: "admin" },
  { label: "Productos", icon: "inventory_2", route: "productos" },
  { label: "Proveedores", icon: "local_shipping", route: "proveedores" },
  { label: "Categorias", icon: "category", route: "categorias" },
  { label: "Usuarios", icon: "people", route: "usuarios" },
  { label: "Importaciones", icon: "upload_file", route: "imports" },
];

const rutaActual = computed(() => router.currentRoute.value.name);

const cerrarSesion = () => {
  auth.cerrarSesion();
  router.push({ name: "login" });
};
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="ys-admin-header text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="general.alternarMenu" />
        <q-toolbar-title class="text-weight-bold">
          <q-icon name="inventory_2" class="q-mr-sm" />
          {{ general.titulo }}
        </q-toolbar-title>
        <div class="text-caption q-mr-md">Admin</div>
        <q-btn flat dense no-caps icon="storefront" :to="{ name: 'catalogo' }">
          <q-tooltip>Catalogo publico</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="logout" @click="cerrarSesion">
          <q-tooltip>Cerrar sesion</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="general.menuAbierto" bordered :width="220">
      <q-list class="q-pa-md">
        <q-item-label header class="text-grey-7 text-weight-bold text-uppercase text-caption">
          Menu
        </q-item-label>

        <q-item
          v-for="item in menuItems"
          :key="item.route"
          clickable
          v-ripple
          :to="{ name: item.route }"
          :active="rutaActual === item.route"
          active-class="bg-primary text-white"
          class="enlace-menu"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" />
          </q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.ys-admin-header {
  background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 55%, #d81b60 120%) !important;
}
</style>
