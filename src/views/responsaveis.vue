<template>
  <v-container fluid>
    <h1 class="text-h5 text-sm-h4 mb-4">👥 Responsáveis</h1>

    <!-- Botão para adicionar -->
    <v-row class="mb-4">
      <v-col>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirDialogCriar">
          Novo Responsável
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabela de responsáveis -->
    <v-card>
      <v-card-title class="bg-grey-lighten-4">
        Meus Responsáveis
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="responsaveis"
          :loading="loading"
          items-per-page="10"
          class="elevation-0"
        >
          <template v-slot:item.tipo="{ item }">
            {{ item.tipo === 'PESSOA_FISICA' ? 'Pessoa física' : 'Empresa' }}
          </template>
          <template v-slot:item.vinculo="{ item }">
            <v-chip :color="item.sistema ? 'blue' : 'green'" dark size="small">
              {{ !!item.sistema ? 'Sistema' : 'Usuário' }}
            </v-chip>
          </template>
          <template v-slot:item.acoes="{ item }">
            <v-btn
              icon
              variant="text"
              size="small"
              color="primary"
              @click="editarResponsavel(item)"
              :disabled="!!item.sistema"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="confirmarDelete(item)"
              :disabled="!!item.sistema"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="info" class="ma-4">Nenhum responsável encontrado.</v-alert>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Dialog de criação/edição -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editandoId ? 'Editar' : 'Novo' }} Responsável
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valido">
            <v-text-field
              v-model="formData.nome"
              label="Nome"
              required
              variant="outlined"
              :rules="[v => !!v || 'Nome é obrigatório']"
            />
            <v-select
              v-model="formData.tipo"
              :items="tipos"
              label="Tipo"
              required
              variant="outlined"
              :rules="[v => !!v || 'Tipo é obrigatório']"
            />
            <v-text-field
              v-model="formData.relacao"
              label="Relação"
              variant="outlined"
            />
            <v-text-field
              v-model="formData.email"
              label="E-mail"
              type="email"
              variant="outlined"
            />
            <v-text-field
              v-model="formData.telefone"
              label="Telefone"
              variant="outlined"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="salvar" :disabled="!valido">Salvar</v-btn>
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
  { title: 'Tipo', key: 'tipo' },
  { title: 'Vínculo', key: 'vinculo' },
  // { title: 'Relação', key: 'relacao' },
  { title: 'E-mail', key: 'email' },
  { title: 'Telefone', key: 'telefone' },
  { title: 'Ações', key: 'acoes', sortable: false }
]

const responsaveis = ref([])
const loading = ref(false)

// Dialog
const dialog = ref(false)
const valido = ref(false)
const form = ref(null)
const editandoId = ref(null)
const tipos = ['PESSOA_FISICA', 'PESSOA_JURIDICA']
const formData = ref({
  nome: '',
  tipo: '',
  relacao: '',
  email: '',
  telefone: ''
})

// Carregar responsáveis
const carregarResponsaveis = async () => {
  loading.value = true
  try {
    const res = await api.get('/responsaveis')
    responsaveis.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Abrir dialog de criação
const abrirDialogCriar = () => {
  editandoId.value = null
  formData.value = { nome: '', tipo: '', relacao: '', email: '', telefone: '' }
  dialog.value = true
}

// Editar
const editarResponsavel = (item) => {
  editandoId.value = item.id
  formData.value = {
    nome: item.nome,
    tipo: item.tipo,
    relacao: item.relacao || '',
    email: item.email || '',
    telefone: item.telefone || ''
  }
  dialog.value = true
}

// Salvar (criar ou editar)
const salvar = async () => {
  if (!valido.value) return

  try {
    if (editandoId.value) {
      await api.put(`/responsaveis/${editandoId.value}`, formData.value)
    } else {
      await api.post('/responsaveis', formData.value)
    }
    await carregarResponsaveis()
    dialog.value = false
  } catch (error) {
    if (error.response?.status === 409) {
      alert(error.response.data.erro || 'Já existe um responsável com este nome.')
    } else {
      alert('Erro ao salvar responsável')
    }
  }
}

// Deletar
const confirmarDelete = async (item) => {
  if (item.sistema) {
    alert('Não é possível excluir um responsável do sistema.')
    return
  }
  if (confirm(`Excluir "${item.nome}"?`)) {
    try {
      await api.delete(`/responsaveis/${item.id}`)
      await carregarResponsaveis()
    } catch (error) {
      alert('Erro ao excluir')
    }
  }
}

onMounted(() => {
  carregarResponsaveis()
})
</script>