const mongoose = require('mongoose');
const env = require('../../config/env');

const importJobSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: true,
    },
    archivoNombre: {
      type: String,
      required: true,
    },
    archivoRuta: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    total: {
      type: Number,
      default: null,
    },
    procesados: {
      type: Number,
      default: 0,
    },
    exitosos: {
      type: Number,
      default: 0,
    },
    fallidos: {
      type: Number,
      default: 0,
    },
    errores: {
      type: [
        {
          fila: Number,
          sku: { type: String, default: null },
          motivo: String,
          _id: false,
        },
      ],
      default: [],
    },
    bullJobId: {
      type: String,
      default: null,
    },
    motivoFallo: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

importJobSchema.pre('save', function limiteErrores() {
  if (this.errores && this.errores.length > env.IMPORT_ERRORS_CAP) {
    this.errores = this.errores.slice(-env.IMPORT_ERRORS_CAP);
  }
});

importJobSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('ImportJob', importJobSchema);
