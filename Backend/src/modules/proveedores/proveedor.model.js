const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug debe ir en minúsculas y sin espacios'],
    },
    contactoEmail: {
      type: String,
      default: null,
      validate: {
        validator(v) {
          if (v == null || v === '') return true;
          return /.+@.+\..+/.test(v);
        },
        message: 'contactoEmail con formato inválido',
      },
    },
    logoUrl: {
      type: String,
      default: null,
      validate: {
        validator(v) {
          if (v == null || v === '') return true;
          return /^https?:\/\/.+/.test(v);
        },
        message: 'logoUrl debe ser una URL http(s) válida',
      },
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

proveedorSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Proveedor', proveedorSchema);
