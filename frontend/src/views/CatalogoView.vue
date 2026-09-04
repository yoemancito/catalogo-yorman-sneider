<script setup>
import { onMounted, ref } from "vue";

import { get } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import logo from "@/assets/logo.svg";

const general = useGeneralStore();

const productos = ref([]);
const cargando = ref(false);
const pagina = ref(1);
const totalPaginas = ref(1);
const filtroCategoria = ref("");

const cargar = async () => {
  cargando.value = true;
  try {
    let url = `/catalogo?page=${pagina.value}&limit=12`;
    if (filtroCategoria.value) url += `&categoria=${filtroCategoria.value}`;
    const respuesta = await get(url);
    productos.value = respuesta.data;
    totalPaginas.value = Math.ceil(respuesta.total / 12) || 1;
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

const formatoPrecio = (n) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

onMounted(cargar);
</script>

<template>
  <div class="ys-app">
    <header class="ys-navbar">
      <div class="ys-navbar__inner">
        <div class="ys-brand">
          <img :src="logo" alt="Logo" class="ys-brand__logo" />
          <span class="ys-brand__nombre">{{ general.titulo }}</span>
        </div>
        <div class="ys-navbar__links">
          <span class="ys-link ys-link--activo">Catálogo</span>
        </div>
      </div>
    </header>

    <section class="ys-hero">
      <div class="ys-hero__glow ys-hero__glow--1"></div>
      <div class="ys-hero__glow ys-hero__glow--2"></div>
      <div class="ys-hero__contenido">
        <span class="ys-hero__badge">Catálogo en línea</span>
        <h1 class="ys-hero__titulo">Productos para tu proyecto</h1>
        <p class="ys-hero__subtitulo">
          Explora nuestra colección seleccionada y encuentra lo que necesitas.
        </p>
        <div class="ys-buscador">
          <svg viewBox="0 0 24 24" class="ys-buscador__icono" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            v-model="filtroCategoria"
            class="ys-buscador__input"
            placeholder="Buscar por categoría (ej. laptops, audio)"
            @keyup.enter="pagina = 1; cargar()"
          />
          <button class="ys-buscador__boton" @click="pagina = 1; cargar()">Buscar</button>
        </div>
      </div>
    </section>

    <main class="ys-main">
      <div v-if="cargando" class="ys-grid">
        <div v-for="n in 8" :key="n" class="ys-tarjeta ys-tarjeta--carga">
          <div class="ys-tarjeta__img ys-tarjeta__img--skeleton"></div>
          <div class="ys-tarjeta__cuerpo">
            <div class="ys-skeleton ys-skeleton--titulo"></div>
            <div class="ys-skeleton ys-skeleton--texto"></div>
          </div>
        </div>
      </div>

      <div v-else-if="productos.length === 0" class="ys-vacio">
        <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#bdbdbd" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 7h18M7 3v4M17 3v4" />
        </svg>
        <p>No hay productos disponibles</p>
      </div>

      <div v-else class="ys-grid">
        <article v-for="p in productos" :key="p._id" class="ys-tarjeta">
          <div class="ys-tarjeta__img-wrap">
            <img
              v-if="p.imagenUrl"
              :src="p.imagenUrl"
              :alt="p.nombre"
              class="ys-tarjeta__img"
              loading="lazy"
            />
            <div v-else class="ys-tarjeta__img ys-tarjeta__img--sin">
              <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#bbb" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <span class="ys-tarjeta__stock" :class="p.stock > 0 ? 'ys-tarjeta__stock--ok' : 'ys-tarjeta__stock--no'">
              {{ p.stock > 0 ? `${p.stock} en stock` : "Sin stock" }}
            </span>
          </div>
          <div class="ys-tarjeta__cuerpo">
            <span class="ys-tarjeta__categoria">{{ p.categoria }}</span>
            <h3 class="ys-tarjeta__nombre">{{ p.nombre }}</h3>
            <span class="ys-tarjeta__sku">SKU: {{ p.sku }}</span>
            <div class="ys-tarjeta__precio">{{ formatoPrecio(p.precio) }}</div>
          </div>
        </article>
      </div>

      <div v-if="totalPaginas > 1" class="ys-paginacion">
        <button
          v-for="n in totalPaginas"
          :key="n"
          class="ys-paginacion__boton"
          :class="n === pagina ? 'ys-paginacion__boton--activo' : ''"
          @click="pagina = n; cargar()"
        >
          {{ n }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ys-app {
  min-height: 100vh;
  background: #f6f4fb;
  font-family: "Roboto", sans-serif;
  color: #2a2440;
}

/* ---------- Navbar ---------- */
.ys-navbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #eceaf5;
  position: sticky;
  top: 0;
  z-index: 20;
}
.ys-navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.ys-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ys-brand__logo {
  width: 34px;
  height: 34px;
}
.ys-brand__nombre {
  font-weight: 800;
  font-size: 18px;
  background: linear-gradient(135deg, #6a1b9a, #d81b60);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ys-navbar__links {
  display: flex;
  gap: 8px;
}
.ys-link {
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  color: #6a1b9a;
}
.ys-link--activo {
  background: #f3e5f5;
}

/* ---------- Hero ---------- */
.ys-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 55%, #d81b60 120%);
  color: #fff;
  padding: 72px 24px 84px;
  text-align: center;
}
.ys-hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}
.ys-hero__glow--1 {
  width: 300px;
  height: 300px;
  background: #d81b60;
  top: -80px;
  left: -60px;
}
.ys-hero__glow--2 {
  width: 260px;
  height: 260px;
  background: #7c4dff;
  bottom: -100px;
  right: -40px;
}
.ys-hero__contenido {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}
.ys-hero__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 13px;
  letter-spacing: 0.5px;
  margin-bottom: 18px;
}
.ys-hero__titulo {
  font-size: 42px;
  line-height: 1.1;
  margin: 0 0 14px;
  font-weight: 800;
}
.ys-hero__subtitulo {
  font-size: 17px;
  opacity: 0.9;
  margin: 0 0 28px;
}

/* ---------- Buscador ---------- */
.ys-buscador {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border-radius: 14px;
  padding: 6px 6px 6px 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  max-width: 520px;
  margin: 0 auto;
}
.ys-buscador__icono {
  width: 20px;
  height: 20px;
  color: #8e8aa0;
  flex-shrink: 0;
}
.ys-buscador__input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #2a2440;
  padding: 10px 0;
  background: transparent;
}
.ys-buscador__boton {
  border: none;
  background: linear-gradient(135deg, #6a1b9a, #d81b60);
  color: #fff;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 10px;
  cursor: pointer;
}

/* ---------- Grid ---------- */
.ys-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 60px;
}
.ys-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 22px;
}

/* ---------- Tarjeta ---------- */
.ys-tarjeta {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(74, 20, 140, 0.08);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
  display: flex;
  flex-direction: column;
}
.ys-tarjeta:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 36px rgba(74, 20, 140, 0.16);
}
.ys-tarjeta__img-wrap {
  position: relative;
  aspect-ratio: 4 / 3;
  background: #f0eef7;
  overflow: hidden;
}
.ys-tarjeta__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ys-tarjeta__img--sin {
  display: flex;
  align-items: center;
  justify-content: center;
}
.ys-tarjeta__img--skeleton {
  background: linear-gradient(90deg, #eee, #f6f4fb, #eee);
  background-size: 200% 100%;
  animation: ys-shimmer 1.2s infinite;
}
.ys-tarjeta__stock {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 999px;
  color: #fff;
}
.ys-tarjeta__stock--ok {
  background: #21ba45;
}
.ys-tarjeta__stock--no {
  background: #c10015;
}
.ys-tarjeta__cuerpo {
  padding: 16px 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ys-tarjeta__categoria {
  align-self: flex-start;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #6a1b9a;
  background: #f3e5f5;
  padding: 4px 10px;
  border-radius: 999px;
}
.ys-tarjeta__nombre {
  font-size: 16px;
  font-weight: 700;
  margin: 4px 0 0;
  line-height: 1.3;
}
.ys-tarjeta__sku {
  font-size: 12px;
  color: #9e9ab1;
}
.ys-tarjeta__precio {
  margin-top: 8px;
  font-size: 19px;
  font-weight: 800;
  background: linear-gradient(135deg, #6a1b9a, #d81b60);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* ---------- Skeleton ---------- */
.ys-skeleton {
  border-radius: 8px;
  background: linear-gradient(90deg, #eee, #f6f4fb, #eee);
  background-size: 200% 100%;
  animation: ys-shimmer 1.2s infinite;
}
.ys-skeleton--titulo {
  height: 16px;
  width: 70%;
}
.ys-skeleton--texto {
  height: 12px;
  width: 45%;
}
@keyframes ys-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ---------- Vacío ---------- */
.ys-vacio {
  text-align: center;
  padding: 70px 0;
  color: #9e9ab1;
}
.ys-vacio p {
  margin-top: 14px;
  font-size: 18px;
}

/* ---------- Paginación ---------- */
.ys-paginacion {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
  flex-wrap: wrap;
}
.ys-paginacion__boton {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e0dcef;
  background: #fff;
  color: #6a1b9a;
  font-weight: 700;
  cursor: pointer;
}
.ys-paginacion__boton--activo {
  background: linear-gradient(135deg, #6a1b9a, #d81b60);
  color: #fff;
  border-color: transparent;
}
</style>
