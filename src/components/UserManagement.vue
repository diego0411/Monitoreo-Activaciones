<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient' // ajusta la ruta según tu proyecto

const usuarios = ref([])
const email = ref('')
const password = ref('')
const nombre = ref('')
const plaza = ref('')

// Para edición
const editandoId = ref(null)
const nombreEdit = ref('')
const plazaEdit = ref('')

// Cargar todos los usuarios desde la tabla activadores
const cargarUsuarios = async () => {
  const { data, error } = await supabase
    .from('activadores')
    .select('*')

  if (error) {
    console.error(error)
    return
  }
  usuarios.value = data
}

onMounted(() => {
  cargarUsuarios()
})

// Registrar usuario (crea usuario en auth y luego en activadores)
const registrarUsuario = async () => {
  if (!email.value || !password.value || !nombre.value) {
    alert('Completa todos los campos')
    return
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.value,
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

// Eliminar usuario
const eliminarUsuario = async (usuario) => {
  const confirmar = confirm(`¿Eliminar usuario ${usuario.nombre}?`)
  if (!confirmar) return

  // OJO: esto solo borra en la tabla activadores, no en auth
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

// Iniciar edición
const editarUsuario = (usuario) => {
  editandoId.value = usuario.usuario_id
  nombreEdit.value = usuario.nombre
  plazaEdit.value = usuario.plaza || ''
}

// Guardar edición
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
  <div class="p-4 max-w-2xl mx-auto">
    <h1 class="text-xl font-bold mb-4">Gestión de Usuarios</h1>

    <div class="border p-4 rounded shadow mb-6">
      <h2 class="text-lg font-semibold mb-2">Registrar Usuario</h2>
      <div class="space-y-2">
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          class="border p-2 rounded w-full"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="border p-2 rounded w-full"
        />
        <input
          v-model="nombre"
          placeholder="Nombre completo"
          class="border p-2 rounded w-full"
        />
        <input
          v-model="plaza"
          placeholder="Plaza (opcional)"
          class="border p-2 rounded w-full"
        />
        <button
          @click="registrarUsuario"
          class="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Registrar
        </button>
      </div>
    </div>

    <div>
      <h2 class="text-lg font-semibold mb-2">Usuarios Registrados</h2>
      <table class="w-full border-collapse border text-sm">
        <thead>
          <tr class="bg-gray-100">
            <th class="border p-2">ID</th>
            <th class="border p-2">Nombre</th>
            <th class="border p-2">Email</th>
            <th class="border p-2">Plaza</th>
            <th class="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.usuario_id">
            <td class="border p-2">{{ usuario.usuario_id }}</td>
            <td class="border p-2">
              <div v-if="editandoId === usuario.usuario_id">
                <input v-model="nombreEdit" class="border p-1 rounded" />
              </div>
              <div v-else>
                {{ usuario.nombre }}
              </div>
            </td>
            <td class="border p-2">{{ usuario.email }}</td>
            <td class="border p-2">
              <div v-if="editandoId === usuario.usuario_id">
                <input v-model="plazaEdit" class="border p-1 rounded" />
              </div>
              <div v-else>
                {{ usuario.plaza }}
              </div>
            </td>
            <td class="border p-2 space-x-2">
              <div v-if="editandoId === usuario.usuario_id">
                <button
                  @click="guardarEdicion"
                  class="bg-green-600 text-white px-2 py-1 rounded"
                >
                  Guardar
                </button>
                <button
                  @click="editandoId = null"
                  class="bg-gray-400 text-white px-2 py-1 rounded"
                >
                  Cancelar
                </button>
              </div>
              <div v-else>
                <button
                  @click="editarUsuario(usuario)"
                  class="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Editar
                </button>
                <button
                  @click="eliminarUsuario(usuario)"
                  class="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* puedes colocar estilos personalizados aquí si gustas */
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  margin-top: 1rem;
}
th,
td {
  border: 1px solid #ccc;
  padding: 4px;
  text-align: left;
  vertical-align: top;
}
th {
  background-color: #f5f5f5;
}
tr:nth-child(even) {
  background-color: #fafafa;
}
a {
  color: #007bff;
}
input,
select {
  padding: 4px;
  font-size: 13px;
  margin-left: 5px;
}
</style>
