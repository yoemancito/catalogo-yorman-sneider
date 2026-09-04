<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { requerido, esEmail, minimo } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: "email", label: "Email", field: "email", align: "left", sortable: true },
  { name: "rol", label: "Rol", field: "rol", align: "center", sortable: true },
  { name: "activo", label: "Estado", field: "activo", align: "center", sortable: true },
  { name: "createdAt", label: "Creado", field: "createdAt", align: "left", sortable: true, format: (v) => new Date(v).toLocaleDateString() },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const usuarios = ref([]);
const cargando = ref(false);
const error = ref(null);
const pagina = ref(1);
const totalPaginas = ref(1);
const totalItems = ref(0);
const limite = 20;
const filtroRol = ref("");
const busqueda = ref("");

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    let url = `/usuarios?page=${pagina.value}&limit=${limite}`;
    if (filtroRol.value) url += `&rol=${filtroRol.value}`;
    if (busqueda.value) url += `&busqueda=${encodeURIComponent(busqueda.value)}`;
    const respuesta = await get(url);
    usuarios.value = respuesta.data;
    totalPaginas.value = Math.ceil(respuesta.total / limite) || 1;
    totalItems.value = respuesta.total;
    general.marcarSincronizacion();
  } catch (e) {
    error.value = e.mensaje;
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);

const dialogo = ref(false);
const guardando = ref(false);
const usuarioEditando = ref(null);
const formularioRef = ref(null);
const formulario = ref({ email: "", rol: "user", password: "" });
const esEdicion = computed(() => usuarioEditando.value !== null);

const abrirEdicion = (usuario) => {
  usuarioEditando.value = usuario;
  formulario.value = { email: usuario.email, rol: usuario.rol, password: "" };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const datos = { email: formulario.value.email.trim(), rol: formulario.value.rol };
    if (formulario.value.password) datos.password = formulario.value.password;
    await put(`/usuarios/${usuarioEditando.value._id}`, datos);
    notificarOk("Usuario actualizado");
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (usuario) => {
  const aceptado = await confirmar({
    titulo: "Desactivar usuario",
    mensaje: `¿Desactivar ${usuario.email}? No podra iniciar sesion.`,
    textoOk: "Desactivar",
    color: "warning",
  });
  if (!aceptado) return;
  try {
    await put(`/usuarios/${usuario._id}`, { activo: false });
    notificarOk("Usuario desactivado");
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};

const activar = async (usuario) => {
  try {
    await put(`/usuarios/${usuario._id}`, { activo: true });
    notificarOk("Usuario activado");
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};

const cambiarPagina = (nuevaPagina) => {
  pagina.value = nuevaPagina;
  cargar();
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Usuarios"
        subtitulo="Gestionar usuarios del sistema"
        icono="people"
      />

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
        <template #action><q-btn flat dense no-caps label="Reintentar" @click="cargar" /></template>
      </q-banner>

      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-md-4">
          <q-input
            v-model="busqueda"
            outlined dense
            label="Buscar por email"
            clearable
            @clear="busqueda = ''; pagina = 1; cargar()"
            @keyup.enter="pagina = 1; cargar()"
          >
            <template #append><q-btn flat dense icon="search" @click="pagina = 1; cargar()" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="filtroRol"
            outlined dense
            label="Filtrar por rol"
            :options="[{ label: 'Admin', value: 'admin' }, { label: 'Usuario', value: 'user' }]"
            emit-value map-options
            clearable
            @update:model-value="pagina = 1; cargar()"
          />
        </div>
        <div class="col-12 col-md-3 flex items-center">
          <span class="text-caption text-grey-7">{{ totalItems }} usuarios</span>
        </div>
      </div>

      <TablaDatos :filas="usuarios" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay usuarios registrados">
        <template #body-cell-rol="celda">
          <q-td :props="celda" class="text-center">
            <q-badge :color="celda.row.rol === 'admin' ? 'primary' : 'grey-6'" :label="celda.row.rol" />
          </q-td>
        </template>

        <template #body-cell-activo="celda">
          <q-td :props="celda" class="text-center">
            <q-badge :color="celda.row.activo ? 'positive' : 'grey-6'" :label="celda.row.activo ? 'Activo' : 'Desactivado'" />
          </q-td>
        </template>

        <template #body-cell-acciones="celda">
          <q-td :props="celda" class="text-right">
            <q-btn flat dense round size="sm" icon="edit" color="primary" class="action-secondary" @click="abrirEdicion(celda.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn
              v-if="celda.row.activo !== false"
              flat dense round size="sm"
              icon="toggle_off"
              color="warning"
              class="action-secondary"
              @click="desactivar(celda.row)"
            >
              <q-tooltip>Desactivar</q-tooltip>
            </q-btn>
            <q-btn
              v-else
              flat dense round size="sm"
              icon="toggle_on"
              color="positive"
              class="action-secondary"
              @click="activar(celda.row)"
            >
              <q-tooltip>Activar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </TablaDatos>

      <div class="row justify-center q-mt-md">
        <q-pagination v-model="pagina" :max="totalPaginas" color="primary" flat @update:model-value="cambiarPagina" />
      </div>
    </div>

    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon name="edit" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">Editar usuario</div>
            <div class="text-caption text-purple-3">{{ usuarioEditando?.email }}</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <q-input
              v-model="formulario.email"
              outlined dense
              type="email"
              label="Email *"
              :rules="[requerido('El email'), esEmail()]"
              lazy-rules
            />
            <q-select
              v-model="formulario.rol"
              outlined dense
              label="Rol *"
              :options="[{ label: 'Admin', value: 'admin' }, { label: 'Usuario', value: 'user' }]"
              emit-value map-options
              :rules="[requerido('El rol')]"
            />
            <q-input
              v-model="formulario.password"
              outlined dense
              type="password"
              label="Nueva contraseña (dejar vacio para no cambiar)"
              hint="Minimo 6 caracteres"
            />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn unelevated no-caps type="submit" color="primary" class="btn-ok" label="Guardar cambios" :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
