// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Definição do tema claro e escuro
const lightTheme = {
    dark: false,
    colors: {
        primary: '#0D47A1',
        secondary: '#00BFA5',
        accent: '#FF9800',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FFC107',
        info: '#2196F3',
        background: '#F5F7FA',
        surface: '#FFFFFF',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-background': '#212121',
    },
}

const darkTheme = {
    dark: true,
    colors: {
        primary: '#1565C0',
        secondary: '#00BFA5',
        accent: '#FFA726',
        success: '#66BB6A',
        error: '#EF5350',
        warning: '#FFCA28',
        info: '#42A5F5',
        background: '#121212',
        surface: '#1E1E1E',
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-background': '#E0E0E0',
    },
}

export default createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: lightTheme,
            dark: darkTheme,
        },
    },
    icons: {
        defaultSet: 'mdi',
    },
    breakpoint: {
        thresholds: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
})