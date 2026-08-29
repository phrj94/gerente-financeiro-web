<template>
  <v-app>
    <!-- Barra de navegação superior -->
    <v-app-bar app color="primary" dark v-if="!isAuthPage">
      <!-- Ícone de menu (mobile) -->
      <v-app-bar-nav-icon @click="drawer = !drawer" v-if="isMobile"></v-app-bar-nav-icon>

      <!-- Título -->
      <v-toolbar-title class="d-flex align-center">
        <span class="text-h6 font-weight-light">💰 Gerente Financeiro</span>
        <!-- <span class="text-h6 font-weight-bold">Financeiro</span> -->
      </v-toolbar-title>

      <!-- Links de navegação (desktop) -->
      <div class="nav-links ml-4" v-if="!isMobile">
        <v-btn variant="text" to="/" class="text-none">Dashboard</v-btn>
        <v-btn variant="text" to="/movimentacoes" class="text-none">Movimentações</v-btn>
        <v-btn variant="text" to="/bancos" class="text-none">Bancos</v-btn>
        <v-btn variant="text" to="/responsaveis" class="text-none">Responsáveis</v-btn>
        <v-btn variant="text" to="/rotulos" class="text-none">Rótulos</v-btn>
        <v-btn variant="text" to="/perfis-movimentacao" class="text-none">Perfis</v-btn>
        <v-btn variant="text" to="/perfil" class="text-none">Perfil</v-btn>
      </div>

      <v-spacer></v-spacer>

      <!-- Botões de ação (tema e logout) -->
      <v-btn icon @click="toggleTheme" title="Alternar tema">
        <v-icon>{{ themeIcon }}</v-icon>
      </v-btn>
      <v-btn icon @click="logout" title="Sair" v-if="isAuthenticated">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Menu lateral (drawer) – apenas em mobile -->
    <v-navigation-drawer v-model="drawer" app temporary v-if="isAuthenticated && isMobile">
      <v-list>
        <v-list-item to="/" prepend-icon="mdi-view-dashboard" title="Dashboard" />
        <v-list-item to="/movimentacoes" prepend-icon="mdi-swap-horizontal" title="Movimentações" />
        <v-list-item to="/bancos" prepend-icon="mdi-bank" title="Bancos" />
        <v-list-item to="/responsaveis" prepend-icon="mdi-account-group" title="Responsáveis" />
        <v-list-item to="/rotulos" prepend-icon="mdi-tag" title="Rótulos" />
        <v-list-item to="/perfis-movimentacao" prepend-icon="mdi-playlist-edit" title="Perfis" />
        <v-list-item to="/perfil" prepend-icon="mdi-account" title="Meu Perfil" />
      </v-list>
    </v-navigation-drawer>

    <!-- Conteúdo principal -->
    <v-main>
      <v-container fluid class="pa-3 pa-sm-4 pa-md-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme, useDisplay } from 'vuetify'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const theme = useTheme()
const display = useDisplay()

// Estado do menu lateral (mobile)
const drawer = ref(false)

// Detecta se é mobile (largura menor que 960px)
const isMobile = computed(() => display.mobile.value)

// Verifica se a página atual é de autenticação
const isAuthPage = computed(() => route.meta?.public === true)

// Verifica se o usuário está autenticado
const isAuthenticated = computed(() => authStore.isAuthenticated)

// Ícone do tema
const themeIcon = computed(() => {
  return theme.global.name.value === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-weather-night'
})

// Alterna entre tema claro e escuro
const toggleTheme = () => {
  const newTheme = theme.global.name.value === 'dark' ? 'light' : 'dark'
  theme.change(newTheme)
  localStorage.setItem('theme', newTheme)
}

// Recupera a preferência de tema
const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  theme.change(savedTheme)
}

// Logout
const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

// Fecha o drawer automaticamente ao navegar (mobile)
watch(() => route.path, () => {
  if (drawer.value && isMobile.value) {
    drawer.value = false
  }
})
</script>

<style scoped>
/* Ajustes para a barra de navegação */
.nav-links {
  display: flex;
  gap: 4px;
}

.nav-links .v-btn {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  text-transform: none;
  letter-spacing: 0.3px;
}

.nav-links .v-btn:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Em telas muito pequenas, reduzir o espaçamento */
@media (max-width: 600px) {
  .v-toolbar-title {
    font-size: 1rem !important;
  }

  .v-btn {
    min-width: 36px !important;
  }
}
</style>