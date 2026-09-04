<script setup>
import { computed, onMounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, post, put } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";
import { requerido, minimo, enteroMayorA } from "@/utils/reglas";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();
const { confirmar } = useConfirmar();

const columnas = [
  { name: "sku", label: "SKU", field: "sku", align: "left", sortable: true },
  { name: "nombre", label: "Nombre", field: "nombre", align: "left", sortable: true },
  { name: "precio", label: "Precio", field: "precio", align: "right", sortable: true, format: (v) => `$${Number(v).toFixed(2)}` },
  { name: "stock", label: "Stock", field: "stock", align: "right", sortable: true },
  { name: "categoria", label: "Categoria", field: "categoria", align: "left", sortable: true },
  { name: "disponible", label: "Estado", field: "disponible", align: "center", sortable: true },
  { name: "acciones", label: "Acciones", field: "acciones", align: "right" },
];

const productos = ref([]);
const cargando = ref(false);
const error = ref(null);
const pagina = ref(1);
const totalPaginas = ref(1);
const totalItems = ref(0);
const limite = 20;

const filtroCategoria = ref("");
const filtroDisponible = ref("");

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    let url = `/productos?page=${pagina.value}&limit=${limite}`;
    if (filtroCategoria.value) url += `&categoria=${filtroCategoria.value}`;
    if (filtroDisponible.value) url += `&disponible=${filtroDisponible.value}`;
    const respuesta = await get(url);
    productos.value = respuesta.data;
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
const productoEditando = ref(null);
const formularioRef = ref(null);
const formulario = ref({ sku: "", nombre: "", precio: null, stock: null, categoria: "", proveedorId: "", descripcion: "", imagenUrl: "" });
const esEdicion = computed(() => productoEditando.value !== null);
const formularioVacio = () => ({ sku: "", nombre: "", precio: null, stock: null, categoria: "", proveedorId: "", descripcion: "", imagenUrl: "" });

const abrirCreacion = () => {
  productoEditando.value = null;
  formulario.value = formularioVacio();
  dialogo.value = true;
};

const abrirEdicion = (producto) => {
  productoEditando.value = producto;
  formulario.value = {
    sku: producto.sku,
    nombre: producto.nombre,
    precio: producto.precio,
    stock: producto.stock,
    categoria: producto.categoria,
    proveedorId: producto.proveedorId?._id || producto.proveedorId || "",
    descripcion: producto.descripcion || "",
    imagenUrl: producto.imagenUrl || "",
  };
  dialogo.value = true;
};

const guardar = async () => {
  guardando.value = true;
  try {
    const datos = {
      sku: formulario.value.sku.trim(),
      nombre: formulario.value.nombre.trim(),
      precio: Number(formulario.value.precio),
      stock: Number(formulario.value.stock),
      categoria: formulario.value.categoria.trim(),
      proveedorId: formulario.value.proveedorId.trim(),
      descripcion: formulario.value.descripcion.trim() || undefined,
      imagenUrl: formulario.value.imagenUrl.trim() || undefined,
    };
    const respuesta = esEdicion.value
      ? await put(`/productos/${productoEditando.value._id}`, datos)
      : await post("/productos", datos);
    notificarOk(esEdicion.value ? "Producto actualizado" : "Producto creado");
    dialogo.value = false;
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    guardando.value = false;
  }
};

const desactivar = async (producto) => {
  const aceptado = await confirmar({
    titulo: "Desactivar producto",
    mensaje: `¿Desactivar el producto ${producto.sku}? Dejara de aparecer en el catalogo publico.`,
    textoOk: "Desactivar",
    color: "warning",
  });
  if (!aceptado) return;
  try {
    await put(`/productos/${producto._id}`, { activo: false });
    notificarOk("Producto desactivado");
    await cargar();
  } catch (e) {
    notificarError(e);
  }
};

const activar = async (producto) => {
  try {
    await put(`/productos/${producto._id}`, { activo: true });
    notificarOk("Producto activado");
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
        titulo="Productos"
        subtitulo="Catalogo de productos"
        icono="inventory_2"
      >
        <template #acciones>
          <q-btn unelevated no-caps color="primary" icon="add" label="Nuevo producto" @click="abrirCreacion" />
        </template>
      </EncabezadoPagina>

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
        <template #action><q-btn flat dense no-caps label="Reintentar" @click="cargar" /></template>
      </q-banner>

      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-md-4">
          <q-input v-model="filtroCategoria" outlined dense label="Filtrar por categoria" clearable @clear="filtroCategoria = ''; cargar()" @keyup.enter="pagina = 1; cargar()">
            <template #append><q-btn flat dense icon="search" @click="pagina = 1; cargar()" /></template>
          </q-input>
        </div>
        <div class="col-12 col-md-3">
          <q-select v-model="filtroDisponible" outlined dense label="Disponible" :options="[{ label: 'Si', value: 'true' }, { label: 'No', value: 'false' }]" emit-value map-options clearable @update:model-value="pagina = 1; cargar()" />
        </div>
        <div class="col-12 col-md-3 flex items-center">
          <span class="text-caption text-grey-7">{{ totalItems }} productos</span>
        </div>
      </div>

      <TablaDatos :filas="productos" :columnas="columnas" :cargando="cargando" mensaje-vacio="Aun no hay productos">
        <template #body-cell-disponible="celda">
          <q-td :props="celda" class="text-center">
            <q-badge v-if="celda.row.activo === false" color="grey-6" label="Desactivado" />
            <q-badge v-else-if="celda.row.disponible" color="positive" label="Activo" />
            <q-badge v-else color="amber-8" label="Sin stock" />
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
          <q-icon :name="esEdicion ? 'edit' : 'add'" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">{{ esEdicion ? "Editar producto" : "Nuevo producto" }}</div>
            <div class="text-caption text-purple-3">{{ esEdicion ? "Actualizar datos" : "Agregar al catalogo" }}</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-form ref="formularioRef" greedy @submit="guardar">
          <q-card-section class="q-gutter-md">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input v-model="formulario.sku" outlined dense label="SKU *" :rules="[requerido('El SKU'), minimo(3, 'El SKU')]" lazy-rules />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="formulario.nombre" outlined dense label="Nombre *" :rules="[requerido('El nombre'), minimo(3, 'El nombre')]" lazy-rules />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input v-model.number="formulario.precio" outlined dense type="number" step="0.01" label="Precio *" :rules="[requerido('El precio')]" lazy-rules />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="formulario.stock" outlined dense type="number" label="Stock *" :rules="[requerido('El stock'), enteroMayorA(-1, 'El stock')]" lazy-rules />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="formulario.categoria" outlined dense label="Categoria *" :rules="[requerido('La categoria')]" lazy-rules />
              </div>
            </div>
            <q-input v-model="formulario.proveedorId" outlined dense label="Proveedor ID *" :rules="[requerido('El proveedor')]" lazy-rules />
            <q-input v-model="formulario.descripcion" outlined dense label="Descripcion (opcional)" />
            <q-input v-model="formulario.imagenUrl" outlined dense label="URL de imagen (opcional)" />
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
            <q-btn unelevated no-caps type="submit" color="primary" class="btn-ok" :label="esEdicion ? 'Guardar cambios' : 'Crear producto'" :loading="guardando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>
