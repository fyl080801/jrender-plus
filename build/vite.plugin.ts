import Vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'

export const windicss = WindiCSS()

export const vue = Vue()

export const plugins = [windicss, vue]
