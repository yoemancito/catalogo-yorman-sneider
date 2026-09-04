<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, post, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { requerido, esEmail } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "slug", label: "Slug", field: "slug", align: "left", sortable: true },
  { name: "contactoEmail", label: "Contacto", field: "contactoEmail", align: "left" },
  { name: "activo", label: "Estado", field: "activo", align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const proveedores = ref([]);
const cargando = ref(false);
const error = ref(null);
const pagina = ref(1);
const totalPaginas = ref(1);
const limite = 20;

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const respuesta = await get(`/proveedores?page=${pagina.value}&limit=${limite}`);
    proveedores.value = respuesta.data || respuesta;
    totalPaginas.value = Math.ceil((respuesta.total || proveedores.value.length) / limite) || 1;
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
const proveedorEditando = ref(null);
const formularioRef = ref(null);
const formulario = ref({ nombre: "", slug: "", contactoEmail: "", logoUrl: "" });
const esEdicion = computed(() => proveedorEditando.value !== null);
const formularioVacio = () => ({ nombre: "", slug: "", contactoEmail: "", logoUrl: "" });

const abrirCreacion = () => {
  proveedorEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (proveedor) => {
  proveedorEditando.value = proveedor;
  formulario.value = {
    nombre: proveedor.nombre,
    slug: proveedor.slug,
    contactoEmail: proveedor.contactoEmail || "",
    logoUrl: proveedor.logoUrl || "",
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const datos = {
      nombre: formulario.value.nombre.trim(),
      slug: formulario.value.slug.trim(),
      contactoEmail: formulario.value.contactoEmail.trim() || undefined,
      logoUrl: formulario.value.logoUrl.trim() || undefined,
    };
    if (esEdicion.value) {
      await put(`/proveedores/${proveedorEditando.value._id}`, datos);
      notificarOk("Proveedor actualizado");
    } else {
      await post("/proveedores", datos);
      notificarOk("Proveedor creado");
    }
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const toggleActivo = async (proveedor) => {
  try {
    await put(`/proveedores/${proveedor._id}`, { activo: !proveedor.activo });
    notificarOk(proveedor.activo ? "Proveedor desactivado" : "Proveedor activado");
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Proveedores"
        subtitulo="Distribuidores del catalogo"
        icono="local_shipping"
      >
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo proveedor" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
        <template #action><q-btn flat dense no-caps label="Reintentar" @click="cargar" /></template>
      </q-banner>

      <TablaDatos :filas="proveedores" :columnas="columnas" :cargando="cargando" mensaje-vacio="Aun no hay proveedores">
        <template #body-cell-activo="celda">
          <q-td :props="celda" class="text-center">
            <q-badge :color="celda.row.activo ? 'positive' : 'grey-6'" :label="celda.row.activo ? 'Activo' : 'Inactivo'" />
          </q-td>
        </template>

        <template #body-cell-acciones="celda">
          <q-td :props="celda" class="text-right">
            <q-btn flat dense round size="sm" icon="edit" color="primary" class="action-secondary" @click="abrirEdicion(celda.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense round size="sm" :icon="celda.row.activo ? 'toggle_on' : 'toggle_off'" :color="celda.row.activo ? 'negative' : 'positive'" class="action-secondary" @click="toggleActivo(celda.row)">
              <q-tooltip>{{ celda.row.activo ? "Desactivar" : "Activar" }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </TablaDatos>

      <div class="row justify-center q-mt-md">
        <q-pagination v-model="pagina" :max="totalPaginas" color="primary" flat @update:model-value="cargar" />
      </div>
    </div>

    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon :name="esEdicion ? 'edit' : 'add'" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">{{ esEdicion ? "Editar proveedor" : "Nuevo proveedor" }}</div>
            <div class="text-caption text-purple-3">Datos del distribuidor</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <q-input v-model="formulario.nombre" outlined dense label="Nombre *" :rules="[requerido('El nombre')]" lazy-rules />
            <q-input v-model="formulario.slug" outlined dense label="Slug *" hint="Identificador URL (ej: acme-corp)" :rules="[requerido('El slug')]" lazy-rules :disable="esEdicion" />
            <q-input v-model="formulario.contactoEmail" outlined dense type="email" label="Email de contacto" lazy-rules />
            <q-input v-model="formulario.logoUrl" outlined dense label="URL del logo" />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn unelevated no-caps type="submit" color="primary" class="btn-ok" :label="esEdicion ? 'Guardar cambios' : 'Crear proveedor'" :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
