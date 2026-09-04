const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'El sku es obligatorio'],
      unique: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      minlength: 1,
    },
    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'El stock no puede ser negativo'],
      validate: {
        validator: Number.isInteger,
        message: 'El stock debe ser un número entero',
      },
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      minlength: 1,
      index: true,
    },
    descripcion: {
      type: String,
      default: null,
    },
    imagenUrl: {
      type: String,
      default: null,
      validate: {
        validator(v) {
          if (v == null || v === '') return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'imagenUrl debe ser una URL http(s) válida',
      },
    },
    proveedorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proveedor',
      required: [true, 'El proveedor es obligatorio'],
      index: true,
    },
    disponible: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productoSchema.pre('save', async function calcularDisponible() {
  this.disponible = this.stock > 0;
});

productoSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Producto', productoSchema);
