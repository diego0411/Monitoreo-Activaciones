<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const usuarios = ref([])
const email = ref('')
const password = ref('')
const nombre = ref('')
const plaza = ref('')

const editandoId = ref(null)
const nombreEdit = ref('')
const plazaEdit = ref('')

const cargarUsuarios = async () => {
  const { data, error } = await supabase.from('activadores').select('*')
  if (error) {
    console.error(error)
    return
  }
  usuarios.value = data
}

onMounted(() => {
  cargarUsuarios()
})

const registrarUsuario = async () => {
  if (!email.value || !password.value || !nombre.value) {
    alert('Completa todos los campos')
    return
  }

  const cleanedEmail = email.value.trim()
  const { data, error } = await supabase.auth.signUp({
    email: cleanedEmail,
    password: password.value,
    options: { data: { nombre: nombre.value } }
  })

  if (error) {
    alert(error.message)
    return
  }

  if (data.user) {
    await supabase.from('activadores').upsert({
      usuario_id: data.user.id,
      email: cleanedEmail,
      nombre: nombre.value,
      plaza: plaza.value,
    })
    alert('Usuario registrado correctamente')
    email.value = ''
    password.value = ''
    nombre.value = ''
    plaza.value = ''
    cargarUsuarios()
  }
}

const eliminarUsuario = async (usuario) => {
  const confirmar = confirm(`¿Eliminar usuario ${usuario.nombre}?`)
  if (!confirmar) return

  const { error } = await supabase
    .from('activadores')
    .delete()
    .eq('usuario_id', usuario.usuario_id)

  if (error) {
    alert(error.message)
    return
  }

  alert('Usuario eliminado')
  cargarUsuarios()
}

const editarUsuario = (usuario) => {
  editandoId.value = usuario.usuario_id
  nombreEdit.value = usuario.nombre
  plazaEdit.value = usuario.plaza || ''
}

const guardarEdicion = async () => {
  if (!editandoId.value) return
  const { error } = await supabase
    .from('activadores')
    .update({
      nombre: nombreEdit.value,
      plaza: plazaEdit.value,
    })
    .eq('usuario_id', editandoId.value)

  if (error) {
    alert(error.message)
    return
  }

  alert('Usuario actualizado')
  editandoId.value = null
  nombreEdit.value = ''
  plazaEdit.value = ''
  cargarUsuarios()
}
</script>

<template>
  <div class="contenedor-usuarios">
    <h1 class="titulo-principal">Gestión de Usuarios</h1>

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
                <button @click="eliminarUsuario(usuario)" class="boton boton-eliminar">Eliminar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
