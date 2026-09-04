const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'El slug es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
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
  },
  { timestamps: true }
);

categoriaSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Categoria', categoriaSchema);
