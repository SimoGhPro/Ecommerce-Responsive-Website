// components/Dashboard.tsx
import {Card, Text, Button, Flex, Spinner, useToast} from '@sanity/ui'
import {definePlugin} from 'sanity'

function Dashboard() {
  
  return (
    <Card>
      <Text>Page</Text>
    </Card>
  )
}



export const dashboardTool = definePlugin({
  name: 'dashboard',
  tools: [
    {
      name: 'dashboard',
      title: 'Dashboard',
      component: Dashboard,
    }
  ]
})