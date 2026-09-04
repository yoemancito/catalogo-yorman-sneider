<script setup>
import { onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { requerido } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const columnas = [
  { name: "slug", label: "Slug", field: "slug", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "descripcion", label: "Descripcion", field: "descripcion", align: "left" },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const categorias = ref([]);
const cargando = ref(false);
const error = ref(null);

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    categorias.value = await get("/categorias");
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
const categoriaEditando = ref(null);
const formularioRef = ref(null);
const formulario = ref({ nombre: "", descripcion: "", imagenUrl: "" });

const abrirEdicion = (categoria) => {
  categoriaEditando.value = categoria;
  formulario.value = {
    nombre: categoria.nombre || "",
    descripcion: categoria.descripcion || "",
    imagenUrl: categoria.imagenUrl || "",
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const datos = {};
    if (formulario.value.nombre.trim()) datos.nombre = formulario.value.nombre.trim();
    if (formulario.value.descripcion.trim()) datos.descripcion = formulario.value.descripcion.trim();
    if (formulario.value.imagenUrl.trim()) datos.imagenUrl = formulario.value.imagenUrl.trim();

    await put(`/categorias/${categoriaEditando.value._id}`, datos);
    notificarOk("Categoria actualizada");
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Categorias"
        subtitulo="Metadata de las categorias del catalogo"
        icono="category"
      />

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
        <template #action><q-btn flat dense no-caps label="Reintentar" @click="cargar" /></template>
      </q-banner>

      <q-banner dense class="bg-purple-1 text-purple-9 q-mb-md rounded-borders">
        <template #avatar><q-icon name="info" /></template>
        Las categorias se crean automaticamente durante la importacion de catalogos. Aqui solo puedes editar su nombre, descripcion e imagen.
      </q-banner>

      <TablaDatos :filas="categorias" :columnas="columnas" :cargando="cargando" mensaje-vacio="Aun no hay categorias (se crean al importar)">
        <template #body-cell-acciones="celda">
          <q-td :props="celda" class="text-right">
            <q-btn flat dense round size="sm" icon="edit" color="primary" class="action-secondary" @click="abrirEdicion(celda.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </TablaDatos>
    </div>

    <q-dialog v-model="dialogo" persistent @show="formularioRef?.resetValidation()">
      <q-card class="dialog-card">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon name="edit" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">Editar categoria</div>
            <div class="text-caption text-purple-3">{{ categoriaEditando?.slug }}</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <q-input v-model="formulario.nombre" outlined dense label="Nombre" />
            <q-input v-model="formulario.descripcion" outlined dense label="Descripcion" type="textarea" rows="3" />
            <q-input v-model="formulario.imagenUrl" outlined dense label="URL de imagen" />
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
