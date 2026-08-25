<template>
  <v-app>
    <!-- Barra de navegação superior (mobile) -->
    <v-app-bar app color="primary" dark v-if="usuarioLogado">
      <v-app-bar-nav-icon @click="drawer = !drawer" ></v-app-bar-nav-icon>
      <v-toolbar-title>💰 Gerente Financeiro</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="logout" v-if="usuarioLogado">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Drawer (menu lateral) para mobile e desktop -->
    <v-navigation-drawer v-model="drawer" app temporary v-if="usuarioLogado">
      <v-list>
        <v-list-item to="/perfil" prepend-icon="mdi-account-circle">
          <v-list-item-title>Perfil</v-list-item-title>
        </v-list-item>
        <v-list-item to="/dashboard" prepend-icon="mdi-view-dashboard">
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item to="/movimentacoes" prepend-icon="mdi-swap-horizontal">
          <v-list-item-title>Movimentações</v-list-item-title>
        </v-list-item>
        <v-list-item to="/rotulos" prepend-icon="mdi-tag">
          <v-list-item-title>Rótulos</v-list-item-title>
        </v-list-item>
        <v-list-item to="/responsaveis" prepend-icon="mdi-account-group">
          <v-list-item-title>Responsáveis</v-list-item-title>
        </v-list-item>
        <v-list-item to="/bancos" prepend-icon="mdi-bank">
          <v-list-item-title>Bancos</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Conteúdo principal -->
    <v-main>
      <v-container fluid class="pa-4 pa-sm-6">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(false)

const usuarioLogado = computed(() => !!localStorage.getItem('token'))

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  router.push('/login')
}
</script>

<style>
/* Ajustes globais mobile-first */
.v-container {
  padding: 12px;
}

@media (min-width: 600px) {
  .v-container {
    padding: 24px;
  }
}
</style>