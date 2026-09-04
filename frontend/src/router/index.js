import { createRouter, createWebHashHistory } from "vue-router";
import { Notify } from "quasar";

import { useAuthStore } from "@/store/Auth";

import AdminLayout from "@/layouts/AdminLayout.vue";

import CatalogoView from "@/views/CatalogoView.vue";
import LoginView from "@/views/LoginView.vue";
import DashboardView from "@/views/DashboardView.vue";
import ProductosView from "@/views/ProductosView.vue";
import ProveedoresView from "@/views/ProveedoresView.vue";
import CategoriasView from "@/views/CategoriasView.vue";
import UsuariosView from "@/views/UsuariosView.vue";
import ImportView from "@/views/ImportView.vue";
import NotFoundView from "@/views/NotFoundView.vue";

const routes = [
  {
    path: "/",
    name: "catalogo",
    component: CatalogoView,
    meta: { titulo: "Catalogo" },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { titulo: "Iniciar sesion", soloInvitados: true },
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiereAuth: true },
    children: [
      {
        path: "",
        name: "admin",
        component: DashboardView,
        meta: { titulo: "Admin" },
      },
      {
        path: "productos",
        name: "productos",
        component: ProductosView,
        meta: { titulo: "Productos" },
      },
      {
        path: "proveedores",
        name: "proveedores",
        component: ProveedoresView,
        meta: { titulo: "Proveedores" },
      },
      {
        path: "categorias",
        name: "categorias",
        component: CategoriasView,
        meta: { titulo: "Categorias" },
      },
      {
        path: "usuarios",
        name: "usuarios",
        component: UsuariosView,
        meta: { titulo: "Usuarios" },
      },
      {
        path: "imports",
        name: "imports",
        component: ImportView,
        meta: { titulo: "Importaciones" },
      },
      {
        path: ":pathMatch(.*)*",
        name: "no-encontrado",
        component: NotFoundView,
        meta: { titulo: "Pagina no encontrada" },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

function protegerRutas(to) {
  const auth = useAuthStore();

  if (to.meta.requiereAuth === true && !auth.estaAutenticado) {
    Notify.create({
      type: "negative",
      message: "Debes iniciar sesion para entrar a esa pagina",
      icon: "lock",
      position: "top-right",
    });
    return { name: "login" };
  }

  if (to.meta.soloInvitados === true && auth.estaAutenticado) {
    return { name: "admin" };
  }

  return true;
}

router.beforeEach(protegerRutas);

router.afterEach((to) => {
  const base = import.meta.env.VITE_APP_TITULO || "Catalogo Yorman & Sneider";
  document.title = to.meta.titulo ? `${to.meta.titulo} | ${base}` : base;
});
