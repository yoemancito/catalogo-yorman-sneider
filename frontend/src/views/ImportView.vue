<script setup>
import { onMounted, onUnmounted, ref } from "vue";

import EncabezadoPagina from "@/components/Encabezados/EncabezadoPagina.vue";
import TablaDatos from "@/components/Tables/TablaDatos.vue";

import { get, post } from "@/services/api.service";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { useConfirmar } from "@/composables/useConfirmar";

const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const columnas = [
  { name: "archivoNombre", label: "Archivo", field: "archivoNombre", align: "left", sortable: true },
  { name: "estado", label: "Estado", field: "estado", align: "center", sortable: true },
  { name: "total", label: "Total", field: "total", align: "right", sortable: true },
  { name: "exitosos", label: "Exitosos", field: "exitosos", align: "right", sortable: true },
  { name: "fallidos", label: "Fallidos", field: "fallidos", align: "right", sortable: true },
  { name: "createdAt", label: "Fecha", field: "createdAt", align: "left", sortable: true, format: (v) => new Date(v).toLocaleString() },
  { name: "acciones", label: "Detalles", field: "acciones", align: "center" },
];

const jobs = ref([]);
const cargando = ref(false);
const error = ref(null);
const pagina = ref(1);
const totalPaginas = ref(1);
const totalItems = ref(0);
const limite = 20;

let pollTimer = null;

const iniciarPolling = () => {
  detenerPolling();
  pollTimer = setInterval(async () => {
    const activos = jobs.value.filter((j) => j.estado === "pending" || j.estado === "processing");
    if (activos.length === 0) return;
    try {
      await cargar();
    } catch (_) {}
  }, 2000);
};

const detenerPolling = () => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
};

const cargar = async () => {
  cargando.value = true;
  error.value = null;
  try {
    const respuesta = await get(`/imports?page=${pagina.value}&limit=${limite}`);
    jobs.value = respuesta.data;
    totalPaginas.value = Math.ceil(respuesta.total / limite) || 1;
    totalItems.value = respuesta.total;
    general.marcarSincronizacion();

    const activos = jobs.value.filter((j) => j.estado === "pending" || j.estado === "processing");
    if (activos.length > 0) { iniciarPolling(); } else { detenerPolling(); }
  } catch (e) {
    error.value = e.mensaje;
    notificarError(e);
  } finally {
    cargando.value = false;
  }
};

onMounted(cargar);
onUnmounted(detenerPolling);

const dialogo = ref(false);
const subiendo = ref(false);
const archivo = ref(null);
const proveedorId = ref("");
const proveedores = ref([]);

const cargarProveedores = async () => {
  try {
    const resp = await get("/proveedores?limit=100");
    proveedores.value = resp.data || resp;
  } catch (e) {
    console.error(e);
  }
};

onMounted(cargarProveedores);

const archivoSeleccionado = (e) => {
  const files = e.target.files;
  if (files.length > 0) archivo.value = files[0];
};

const subirArchivo = async () => {
  if (!archivo.value || !proveedorId.value) {
    notificarError({ mensaje: "Selecciona un archivo y un proveedor" });
    return;
  }
  subiendo.value = true;
  try {
    const formData = new FormData();
    formData.append("archivo", archivo.value);
    formData.append("proveedorId", proveedorId.value);

    await post("/imports", formData);
    notificarOk("Archivo enviado. El procesamiento se ejecuta en background.");
    dialogo.value = false;
    archivo.value = null;
    proveedorId.value = "";
    await cargar();
  } catch (e) {
    notificarError(e);
  } finally {
    subiendo.value = false;
  }
};

const dialogoDetalle = ref(false);
const detalle = ref(null);
const cargandoDetalle = ref(false);

const verDetalle = async (job) => {
  cargandoDetalle.value = true;
  dialogoDetalle.value = true;
  try {
    detalle.value = await get(`/imports/${job._id}`);
  } catch (e) {
    notificarError(e);
  } finally {
    cargandoDetalle.value = false;
  }
};

const refrescar = async () => {
  await cargar();
  notificarOk("Lista actualizada");
};

const estadoColor = (estado) => {
  const colores = { pending: "warning", processing: "info", completed: "positive", failed: "negative" };
  return colores[estado] || "grey";
};

const estadoLabel = (estado) => {
  const labels = { pending: "Pendiente", processing: "Procesando", completed: "Completado", failed: "Fallido" };
  return labels[estado] || estado;
};
</script>

<template>
  <q-page>
    <div class="contenedor-app">
      <EncabezadoPagina
        titulo="Importaciones"
        subtitulo="Importar catalogo de productos desde Excel"
        icono="upload_file"
      >
        <template #acciones>
          <q-btn flat dense no-caps icon="refresh" label="Actualizar" class="q-mr-sm" @click="refrescar" />
          <q-btn unelevated no-caps color="primary" icon="upload" label="Nuevo import" @click="dialogo = true" />
        </template>
      </EncabezadoPagina>

      <q-banner v-if="error" dense class="bg-red-1 text-negative q-mb-md rounded-borders">
        <template #avatar><q-icon name="error_outline" /></template>
        {{ error }}
        <template #action><q-btn flat dense no-caps label="Reintentar" @click="cargar" /></template>
      </q-banner>

      <q-banner dense class="bg-purple-1 text-purple-9 q-mb-md rounded-borders">
        <template #avatar><q-icon name="info" /></template>
        <div>
          <div class="text-weight-bold">Formato del archivo Excel</div>
          <div class="text-caption">Columnas requeridas: <strong>sku, nombre, precio, stock</strong>. Opcionales: <strong>categoria, descripcion, imagenUrl</strong>.</div>
        </div>
      </q-banner>

      <TablaDatos :filas="jobs" :columnas="columnas" :cargando="cargando" mensaje-vacio="No hay importaciones registradas">
        <template #body-cell-estado="celda">
          <q-td :props="celda" class="text-center">
            <q-badge :color="estadoColor(celda.row.estado)" :label="estadoLabel(celda.row.estado)" />
            <div v-if="celda.row.estado === 'processing' && celda.row.total > 0" class="q-mt-xs">
              <q-linear-progress
                :value="celda.row.procesados / celda.row.total"
                color="primary" size="4px" rounded
              />
              <div class="text-caption text-grey-7">{{ celda.row.procesados }}/{{ celda.row.total }}</div>
            </div>
          </q-td>
        </template>

        <template #body-cell-total="celda">
          <q-td :props="celda" class="text-right">
            {{ celda.row.total ?? '—' }}
          </q-td>
        </template>

        <template #body-cell-exitosos="celda">
          <q-td :props="celda" class="text-right">
            <span :class="celda.row.exitosos > 0 ? 'text-positive' : ''">{{ celda.row.exitosos }}</span>
          </q-td>
        </template>

        <template #body-cell-fallidos="celda">
          <q-td :props="celda" class="text-right">
            <span :class="celda.row.fallidos > 0 ? 'text-negative' : ''">{{ celda.row.fallidos }}</span>
          </q-td>
        </template>

        <template #body-cell-acciones="celda">
          <q-td :props="celda" class="text-center">
            <q-btn flat dense round size="sm" icon="visibility" color="primary" @click="verDetalle(celda.row)">
              <q-tooltip>Ver detalle</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </TablaDatos>

      <div class="row justify-center q-mt-md">
        <q-pagination v-model="pagina" :max="totalPaginas" color="primary" flat @update:model-value="cargar" />
      </div>
    </div>

    <!-- Dialogo nuevo import -->
    <q-dialog v-model="dialogo" persistent>
      <q-card class="dialog-card">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon name="upload_file" size="28px" class="q-mr-md" />
          <div>
            <div class="dialog-title">Importar catalogo</div>
            <div class="text-caption text-purple-3">Sube un archivo Excel o CSV</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="proveedorId"
            outlined dense
            label="Proveedor *"
            :options="proveedores.map(p => ({ label: p.nombre, value: p._id }))"
            emit-value map-options
          />

          <div>
            <q-file
              outlined dense
              :model-value="archivo"
              @update:model-value="archivo = $event"
              label="Archivo Excel o CSV *"
              accept=".xlsx,.xls,.csv"
              use-chips
              counter
            >
              <template #prepend><q-icon name="attach_file" /></template>
            </q-file>
          </div>

          <q-banner v-if="archivo" dense class="bg-green-1 text-green-9 rounded-borders">
            <template #avatar><q-icon name="check_circle" /></template>
            {{ archivo.name }} ({{ (archivo.size / 1024).toFixed(1) }} KB)
          </q-banner>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn v-close-popup flat no-caps label="Cancelar" color="dark" class="btn-cancel" />
          <q-btn unelevated no-caps color="primary" class="btn-ok" label="Subir e importar" :loading="subiendo" :disable="!archivo || !proveedorId" @click="subirArchivo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialogo detalle -->
    <q-dialog v-model="dialogoDetalle">
      <q-card class="dialog-card" style="min-width:400px">
        <q-card-section class="bg-primary text-white row items-center no-wrap q-px-lg q-py-md">
          <q-icon name="info" size="28px" class="q-mr-md" />
          <div class="dialog-title">Detalle de importacion</div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" color="white" />
        </q-card-section>

        <q-card-section v-if="cargandoDetalle" class="text-center q-pa-lg">
          <q-spinner color="primary" size="40px" />
        </q-card-section>

        <q-card-section v-else-if="detalle">
          <div v-if="detalle.estado === 'processing' && detalle.total > 0" class="q-mb-md">
            <div class="text-caption text-grey-7 q-mb-xs">Procesando {{ detalle.procesados }} de {{ detalle.total }}...</div>
            <q-linear-progress :value="detalle.procesados / detalle.total" color="primary" size="8px" rounded />
          </div>
          <div class="q-gutter-sm">
            <div class="row">
              <div class="col-6 text-grey-7">Archivo:</div>
              <div class="col-6 text-weight-bold">{{ detalle.archivoNombre }}</div>
            </div>
            <div class="row">
              <div class="col-6 text-grey-7">Estado:</div>
              <div class="col-6"><q-badge :color="estadoColor(detalle.estado)" :label="estadoLabel(detalle.estado)" /></div>
            </div>
            <div class="row">
              <div class="col-6 text-grey-7">Total filas:</div>
              <div class="col-6">{{ detalle.total ?? '—' }}</div>
            </div>
            <div class="row">
              <div class="col-6 text-grey-7">Exitosos:</div>
              <div class="col-6 text-positive text-weight-bold">{{ detalle.exitosos }}</div>
            </div>
            <div class="row">
              <div class="col-6 text-grey-7">Fallidos:</div>
              <div class="col-6 text-negative text-weight-bold">{{ detalle.fallidos }}</div>
            </div>
            <div v-if="detalle.motivoFallo" class="row">
              <div class="col-6 text-grey-7">Motivo fallo:</div>
              <div class="col-6 text-negative">{{ detalle.motivoFallo }}</div>
            </div>

            <q-separator class="q-my-sm" />

            <div v-if="detalle.errores && detalle.errores.length > 0">
              <div class="text-weight-bold text-negative q-mb-sm">Errores ({{ detalle.errores.length }})</div>
              <q-list dense>
                <q-item v-for="(err, i) in detalle.errores.slice(0, 20)" :key="i">
                  <q-item-section>
                    <q-item-label caption>Fila {{ err.fila }} — SKU: {{ err.sku || '—' }}</q-item-label>
                    <q-item-label>{{ err.motivo }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-if="detalle.errores.length > 20" class="text-caption text-grey-7 q-mt-xs">
                ... y {{ detalle.errores.length - 20 }} errores mas
              </div>
            </div>

            <div v-if="detalle.estado === 'completed'" class="text-positive text-weight-bold text-center q-mt-sm">
              Importacion completada
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>
