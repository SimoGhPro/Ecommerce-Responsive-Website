import {defineConfig} from 'sanity'
import {schemaTypes} from './data/types'


import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

//Customized Pages
import { dashboardTool } from './pages/dashboard'


export default defineConfig({
  name: 'default',
  title: 'ecommercejolof_data',

  projectId: '8yq0hl58',
  dataset: 'jolof_data',

  plugins: [
    dashboardTool(), 
    structureTool(), 
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
