<template>
  <v-container fluid>
    <h1 class="text-h5 text-sm-h4 mb-4">🏷️ Rótulos</h1>

    <!-- Botão para criar novo rótulo -->
    <v-btn color="primary" prepend-icon="mdi-tag-plus" @click="abrirDialogRotulo">
      Novo Rótulo
    </v-btn>

    <!-- Tabela de rótulos -->
    <v-card class="mt-4">
      <v-data-table
        :headers="headers"
        :items="rotulos"
        :loading="loading"
        items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.cor="{ item }">
          <v-chip :color="item.cor || '#9E9E9E'" size="small" label dark>
            <span class="text-white">{{ item.cor || 'Sem cor' }}</span>
          </v-chip>
        </template>
        <template v-slot:item.icone="{ item }">
          <v-icon v-if="item.icone">{{ item.icone }}</v-icon>
          <span v-else class="text-grey">—</span>
        </template>
        <template v-slot:item.acoes="{ item }">
          <v-btn
            v-if="!item.sistema"
            icon
            variant="text"
            size="small"
            color="primary"
            @click="editarRotulo(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            v-if="!item.sistema"
            icon
            variant="text"
            size="small"
            color="error"
            @click="confirmarExcluir(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <span v-else class="text-grey text-caption">Sistema</span>
        </template>
        <template v-slot:no-data>
          <v-alert type="info" class="ma-4">Nenhum rótulo encontrado.</v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="dialogRotulo" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editando ? 'Editar' : 'Novo' }} Rótulo</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="formRotulo" v-model="formValido">
            <v-text-field
              v-model="rotuloForm.nome"
              label="Nome do rótulo"
              required
              variant="outlined"
              :rules="[v => !!v || 'Nome é obrigatório']"
            />
            <v-text-field
              v-model="rotuloForm.cor"
              label="Cor (código hexadecimal, ex: #FF5733)"
              variant="outlined"
              placeholder="#FFFFFF"
            />
            <v-text-field
              v-model="rotuloForm.icone"
              label="Ícone (nome do ícone Material Design, ex: mdi-home)"
              variant="outlined"
              placeholder="mdi-tag"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogRotulo = false">Cancelar</v-btn>
          <v-btn color="primary" @click="salvarRotulo" :disabled="!formValido">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const headers = [
  { title: 'Nome', key: 'nome' },
//   { title: 'Cor', key: 'cor' },
//   { title: 'Ícone', key: 'icone' },
  { title: 'Tipo', key: 'sistema', value: item => item.sistema ? 'Sistema' : 'Usuário' },
  { title: 'Ações', key: 'acoes', sortable: false, align: 'center' }
]

const rotulos = ref([])
const loading = ref(false)
const dialogRotulo = ref(false)
const formValido = ref(false)
const formRotulo = ref(null)
const editando = ref(false)
const rotuloForm = ref({
  id: null,
  nome: '',
  cor: '',
  icone: ''
})

const carregarRotulos = async () => {
  loading.value = true
  try {
    const res = await api.get('/rotulos')
    rotulos.value = res.data
  } catch (error) {
    console.error('Erro ao carregar rótulos:', error)
  } finally {
    loading.value = false
  }
}

const abrirDialogRotulo = () => {
  editando.value = false
  rotuloForm.value = { id: null, nome: '', cor: '', icone: '' }
  dialogRotulo.value = true
}

const editarRotulo = (rotulo) => {
  editando.value = true
  rotuloForm.value = { ...rotulo }
  dialogRotulo.value = true
}

const salvarRotulo = async () => {
  if (!formValido.value) return
  try {
    if (editando.value) {
      await api.put(`/rotulos/${rotuloForm.value.id}`, {
        nome: rotuloForm.value.nome,
        cor: rotuloForm.value.cor || null,
        icone: rotuloForm.value.icone || null
      })
    } else {
      await api.post('/rotulos', {
        nome: rotuloForm.value.nome,
        cor: rotuloForm.value.cor || null,
        icone: rotuloForm.value.icone || null
      })
    }
    dialogRotulo.value = false
    await carregarRotulos()
  } catch (error) {
    alert(error.response?.data?.erro || 'Erro ao salvar rótulo')
  }
}

const confirmarExcluir = async (rotulo) => {
  if (confirm(`Excluir o rótulo "${rotulo.nome}"?`)) {
    try {
      await api.delete(`/rotulos/${rotulo.id}`)
      await carregarRotulos()
    } catch (error) {
      alert('Erro ao excluir rótulo')
    }
  }
}

onMounted(() => {
  carregarRotulos()
})
</script>

<style scoped>
/* Ajustes opcionais */
</style>