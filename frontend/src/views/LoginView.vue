<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { post } from "@/services/api.service";
import { useAuthStore } from "@/store/Auth";
import { useGeneralStore } from "@/store/General";
import { useNotificar } from "@/composables/useNotificar";
import { requerido, esEmail, minimo } from "@/utils/reglas";
import logo from "@/assets/logo.svg";

const router = useRouter();
const auth = useAuthStore();
const general = useGeneralStore();
const { notificarOk, notificarError } = useNotificar();

const formulario = ref({ email: "", password: "" });
const verPassword = ref(false);
const enviando = ref(false);

const iniciarSesion = async () => {
  enviando.value = true;

  try {
    const respuesta = await post("/auth/login", {
      email: formulario.value.email.trim(),
      password: formulario.value.password,
    });

    auth.guardarSesion(respuesta);
    notificarOk(`Bienvenido`);
    router.push({ name: "admin" });
  } catch (e) {
    notificarError(e);
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <div class="ys-login">
    <div class="ys-login__panel">
      <div class="ys-login__marca">
        <img :src="logo" alt="Logo" class="ys-login__logo" />
        <div class="ys-login__titulo">{{ general.titulo }}</div>
        <p class="ys-login__subtitulo">Accede al panel de administración</p>
      </div>

      <form class="ys-login__form" @submit.prevent="iniciarSesion">
        <label class="ys-campo">
          <span class="ys-campo__label">Email</span>
          <div class="ys-campo__input-wrap">
            <svg class="ys-campo__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16v12H4z" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              v-model="formulario.email"
              type="email"
              class="ys-campo__input"
              placeholder="tucorreo@ejemplo.com"
              autocomplete="email"
              autofocus
              required
            />
          </div>
        </label>

        <label class="ys-campo">
          <span class="ys-campo__label">Contraseña</span>
          <div class="ys-campo__input-wrap">
            <svg class="ys-campo__icono" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <input
              v-model="formulario.password"
              :type="verPassword ? 'text' : 'password'"
              class="ys-campo__input"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="ys-campo__ojo"
              @click="verPassword = !verPassword"
              :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg v-if="!verPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                <path d="M9.9 4.6A9.6 9.6 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-3.1 4.5M6.6 6.5A16 16 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5-1.4" />
              </svg>
            </button>
          </div>
        </label>

        <button type="submit" class="ys-login__boton" :disabled="enviando">
          <span v-if="enviando" class="ys-login__spinner"></span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <div class="ys-login__nota">
        Usuario de prueba: <strong>admin@catalogoys.com</strong> / <strong>123456</strong>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ys-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #4a148c 0%, #6a1b9a 55%, #d81b60 120%);
  position: relative;
  overflow: hidden;
  font-family: "Roboto", sans-serif;
}
.ys-login::before {
  content: "";
  position: absolute;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  filter: blur(60px);
  top: -120px;
  right: -80px;
}
.ys-login::after {
  content: "";
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: rgba(124, 77, 255, 0.35);
  filter: blur(70px);
  bottom: -130px;
  left: -60px;
}

.ys-login__panel {
  position: relative;
  z-index: 1;
  width: 420px;
  max-width: 100%;
  background: #fff;
  border-radius: 22px;
  padding: 40px 36px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35);
}

.ys-login__marca {
  text-align: center;
  margin-bottom: 30px;
}
.ys-login__logo {
  width: 58px;
  height: 58px;
  margin-bottom: 14px;
}
.ys-login__titulo {
  font-size: 22px;
  font-weight: 800;
  background: linear-gradient(135deg, #6a1b9a, #d81b60);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ys-login__subtitulo {
  color: #9e9ab1;
  font-size: 14px;
  margin: 6px 0 0;
}

.ys-login__form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.ys-campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ys-campo__label {
  font-size: 13px;
  font-weight: 700;
  color: #4a4458;
}
.ys-campo__input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f3fa;
  border: 1.5px solid #e6e2f1;
  border-radius: 12px;
  padding: 0 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ys-campo__input-wrap:focus-within {
  border-color: #6a1b9a;
  box-shadow: 0 0 0 3px rgba(106, 27, 154, 0.12);
}
.ys-campo__icono {
  width: 19px;
  height: 19px;
  color: #9e9ab1;
  flex-shrink: 0;
}
.ys-campo__input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  padding: 13px 0;
  font-size: 15px;
  color: #2a2440;
}
.ys-campo__ojo {
  border: none;
  background: transparent;
  color: #9e9ab1;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
}

.ys-login__boton {
  margin-top: 6px;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #6a1b9a, #d81b60);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, box-shadow 0.15s;
}
.ys-login__boton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(106, 27, 154, 0.3);
}
.ys-login__boton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.ys-login__spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ys-giro 0.7s linear infinite;
}
@keyframes ys-giro {
  to { transform: rotate(360deg); }
}

.ys-login__nota {
  margin-top: 24px;
  text-align: center;
  font-size: 12.5px;
  color: #9e9ab1;
  background: #f8f7fc;
  border: 1px dashed #e0dcef;
  border-radius: 10px;
  padding: 10px;
}
.ys-login__nota strong {
  color: #6a1b9a;
}
</style>
