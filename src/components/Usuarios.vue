<script setup>
// ⚠️ DEV ONLY: este componente usa service_role desde el frontend.
import { ref, onMounted } from 'vue'
import { adminSupabase } from '../lib/supabaseClient'

const usuarios = ref([])
const email = ref('')
const password = ref('')
const nombre = ref('')
const plaza = ref('')

const editandoId = ref(null)
const nombreEdit = ref('')
const plazaEdit = ref('')

// Cargar usuarios desde tu tabla 'activadores'
const cargarUsuarios = async () => {
  const { data, error } = await adminSupabase
    .from('activadores')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) {
    console.error(error)
    return
  }
  usuarios.value = data ?? []
}

onMounted(cargarUsuarios)

// Registrar usuario: crea en Auth ya CONFIRMADO y upsert en 'activadores'
const registrarUsuario = async () => {
  if (!email.value || !password.value || !nombre.value) {
    alert('Completa todos los campos')
    return
  }

  const cleanedEmail = email.value.trim()

  // 1) Crear en Auth (confirmado sin correo)
  const { data: created, error: createErr } = await adminSupabase.auth.admin.createUser({
    email: cleanedEmail,
    password: password.value,
    email_confirm: true,
    user_metadata: { nombre: nombre.value, plaza: plaza.value || null }
  })
  if (createErr) {
    alert(createErr.message)
    return
  }

  // 2) Upsert en tu tabla
  const user = created.user
  const { error: upErr } = await adminSupabase.from('activadores').upsert({
    usuario_id: user.id,
    email: cleanedEmail,
    nombre: nombre.value,
    plaza: plaza.value || null
  })
  if (upErr) {
    alert(upErr.message)
    return
  }

  alert('Usuario registrado y confirmado')
  email.value = ''
  password.value = ''
  nombre.value = ''
  plaza.value = ''
  cargarUsuarios()
}

// Eliminar: borra en tabla y en Auth
const eliminarUsuario = async (usuario) => {
  const confirmar = confirm(`¿Eliminar usuario ${usuario.nombre}?`)
  if (!confirmar) return

  const { error: delTblErr } = await adminSupabase
    .from('activadores')
    .delete()
    .eq('usuario_id', usuario.usuario_id)
  if (delTblErr) {
    alert(delTblErr.message)
    return
  }

  const { error: delAuthErr } = await adminSupabase.auth.admin.deleteUser(usuario.usuario_id)
  if (delAuthErr) {
    alert(delAuthErr.message)
    return
  }

  alert('Usuario eliminado (tabla + Auth)')
  cargarUsuarios()
}

// Editar datos (tabla + metadata en Auth)
const editarUsuario = (usuario) => {
  editandoId.value = usuario.usuario_id
  nombreEdit.value = usuario.nombre
  plazaEdit.value = usuario.plaza || ''
}

const guardarEdicion = async () => {
  if (!editandoId.value) return

  // 1) Actualizar metadata en Auth
  const { error: updAuthErr } = await adminSupabase.auth.admin.updateUserById(editandoId.value, {
    user_metadata: { nombre: nombreEdit.value, plaza: plazaEdit.value }
  })
  if (updAuthErr) {
    alert(updAuthErr.message)
    return
  }

  // 2) Actualizar en tu tabla
  const { error: updTblErr } = await adminSupabase
    .from('activadores')
    .update({ nombre: nombreEdit.value, plaza: plazaEdit.value })
    .eq('usuario_id', editandoId.value)
  if (updTblErr) {
    alert(updTblErr.message)
    return
  }

  alert('Usuario actualizado')
  editandoId.value = null
  nombreEdit.value = ''
  plazaEdit.value = ''
  cargarUsuarios()
}

// (Opcional) Confirmar un usuario antiguo con un clic
const confirmarUsuario = async (usuario) => {
  const { error } = await adminSupabase.auth.admin.updateUserById(usuario.usuario_id, {
    email_confirmed: true
  })
  if (error) {
    alert(error.message)
  } else {
    alert('Usuario confirmado')
  }
}
</script>

<template>
  <div class="contenedor-usuarios">
    <h1 class="titulo-principal">Gestión de Usuarios (DEV)</h1>

    <div class="formulario-registro">
      <h2 class="subtitulo">Registrar Usuario</h2>
      <div class="formulario-campos">
        <input v-model="email" type="email" placeholder="Correo electrónico" class="input-texto" />
        <input v-model="password" type="password" placeholder="Contraseña" class="input-texto" />
        <input v-model="nombre" placeholder="Nombre completo" class="input-texto" />
        <input v-model="plaza" placeholder="Plaza (opcional)" class="input-texto" />
        <button @click="registrarUsuario" class="boton boton-primario">Registrar</button>
      </div>
    </div>

    <div class="tabla-contenedor">
      <h2 class="subtitulo">Usuarios Registrados</h2>
      <table class="tabla-usuarios">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Plaza</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.usuario_id">
            <td>{{ usuario.usuario_id }}</td>
            <td>
              <div v-if="editandoId === usuario.usuario_id">
                <input v-model="nombreEdit" class="input-editar" />
              </div>
              <div v-else>{{ usuario.nombre }}</div>
            </td>
            <td>{{ usuario.email }}</td>
            <td>
              <div v-if="editandoId === usuario.usuario_id">
                <input v-model="plazaEdit" class="input-editar" />
              </div>
              <div v-else>{{ usuario.plaza }}</div>
            </td>
            <td>
              <div v-if="editandoId === usuario.usuario_id" class="acciones">
                <button @click="guardarEdicion" class="boton boton-guardar">Guardar</button>
                <button @click="editandoId = null" class="boton boton-cancelar">Cancelar</button>
              </div>
              <div v-else class="acciones">
                <button @click="editarUsuario(usuario)" class="boton boton-editar">Editar</button>
                <button @click="() => confirmarUsuario(usuario)" class="boton">Confirmar</button>
                <button @click="eliminarUsuario(usuario)" class="boton boton-eliminar">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top:12px; font-size:12px; opacity:.7;">
        ⚠️ Solo desarrollo: este componente usa <code>service_role</code> en el cliente. Sácalo antes de producción.
      </p>
    </div>
  </div>
</template>
