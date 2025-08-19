// components/Dashboard.tsx
import {Card, Text, Button, Flex, Spinner, useToast, Grid, Box, Stack, Heading, Inline} from '@sanity/ui'
import {definePlugin, useClient} from 'sanity'
import {useEffect, useState} from 'react'
import {Order, Product } from '../data/model/modelTypes'
import { AllOrders } from '../components/AllOrders'

function Dashboard() {
  const client = useClient({apiVersion: '2023-05-01'})
  const [stats, setStats] = useState<{
    orders: number
    products: number
    categories: number
    brands: number
    pendingOrders: number
  } | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch counts
        const counts = await Promise.all([
          client.fetch(`count(*[_type == "order"])`),
          client.fetch(`count(*[_type == "product"])`),
          client.fetch(`count(*[_type == "category"])`),
          client.fetch(`count(*[_type == "brand"])`),
          client.fetch(`count(*[_type == "order" && status == "pending"])`),
        ])
        
        setStats({
          orders: counts[0],
          products: counts[1],
          categories: counts[2],
          brands: counts[3],
          pendingOrders: counts[4],
        })

        // Fetch recent orders
        const orders = await client.fetch(`
          *[_type == "order"] | order(_createdAt desc)[0..4] {
            _id,
            orderNumber,
            user,
            status,
            totalAmount,
            currency,
            _createdAt,
            items[] {
              product->{name},
              quantity
            }
          }
        `)
        setRecentOrders(orders)

        // Fetch low stock products
        const products = await client.fetch(`
          *[_type == "product" && inventory.quantity < 10] | order(inventory.quantity asc)[0..4] {
            _id,
            name,
            sku,
            inventory {
              quantity,
              ourInventory
            },
            price {
              priceExclVAT,
              currency
            }
          }
        `)
        setLowStockProducts(products)

      } catch (error) {
        toast.push({
          status: 'error',
          title: 'Failed to load dashboard data',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [client, toast])

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{height: '100%'}}>
        <Spinner size={4} />
      </Flex>
    )
  }

  return (
    <Box padding={4} style={{minHeight: '100%'}}>      
      {/* Stats Grid */}
      {stats && (
        <Grid columns={[1, 2, 2, 4]} gap={3} marginBottom={4}>
          <StatCard 
            title="Total Orders" 
            value={stats.orders} 
            trend="up" 
            icon="📦"
          />
          <StatCard 
            title="Products" 
            value={stats.products} 
            trend="stable" 
            icon="🛍️"
          />
          <StatCard 
            title="Categories" 
            value={stats.categories} 
            trend="stable" 
            icon="🏷️"
          />
          <StatCard 
            title="Pending Orders" 
            value={stats.pendingOrders} 
            trend="attention" 
            icon="⏳"
          />
        </Grid>
      )}

      {/* Main Content */}
      <Grid columns={[1, 1, 2]} gap={3} marginBottom={4}>
<Card padding={3} radius={2} shadow={1} style={{minHeight: '300px'}}>
  <Flex align="center" justify="space-between" marginBottom={3}>
    <Heading size={2}>Recent Orders</Heading>
    <Button 
      as="a" 
      href="/desk/order;all" // Changed this to link to our new view
      text="View All" 
      mode="bleed" 
      fontSize={1}
      padding={2}
    />
  </Flex>
  
  {recentOrders.length > 0 ? (
    <Stack space={2}>
      {recentOrders.map(order => (
        <OrderCard key={order._id} order={order} />
      ))}
    </Stack>
  ) : (
    <Flex align="center" justify="center" style={{height: '100%'}}>
      <Text muted>No recent orders</Text>
    </Flex>
  )}
</Card>

        <Card padding={3} radius={2} shadow={1} style={{minHeight: '300px'}}>
          <Flex align="center" justify="space-between" marginBottom={3}>
            <Heading size={2}>Low Stock Products</Heading>
            <Button 
              as="a" 
              href="/desk/product" 
              text="View All" 
              mode="bleed" 
              fontSize={1}
              padding={2}
            />
          </Flex>
          
          {lowStockProducts.length > 0 ? (
            <Stack space={2}>
              {lowStockProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </Stack>
          ) : (
            <Flex align="center" justify="center" style={{height: '100%'}}>
              <Text muted>All products have sufficient stock</Text>
            </Flex>
          )}
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Card padding={3} radius={2} shadow={1}>
      <Flex align="center" justify="space-between" marginBottom={4}>
          <Heading size={2}>Quick Actions</Heading>
      </Flex>
        
        <Grid columns={[2, 2, 4]} gap={3}>
          <Button 
            as="a" 
            href="/desk/product;create" 
            text="Add Product" 
            mode="ghost" 
            tone="primary"
            padding={3}
            fontSize={1}
          />
          <Button 
            as="a" 
            href="/desk/order;create" 
            text="Create Order" 
            mode="ghost" 
            tone="positive"
            padding={3}
            fontSize={1}
          />
          <Button 
            as="a" 
            href="/desk/category;create" 
            text="Add Category" 
            mode="ghost" 
            tone="caution"
            padding={3}
            fontSize={1}
          />
          <Button 
            as="a" 
            href="/desk/brand;create" 
            text="Add Brand" 
            mode="ghost" 
            tone="critical"
            padding={3}
            fontSize={1}
          />
        </Grid>
      </Card>
    </Box>
  )
}

// Enhanced StatCard with better spacing
function StatCard({title, value, trend, icon}: {title: string, value: number, trend: 'up' | 'down' | 'stable' | 'attention', icon: string}) {
  const trendColors = {
    up: 'success',
    down: 'danger',
    stable: 'default',
    attention: 'warning'
  }

  return (
    <Card padding={3} radius={2} shadow={1}>
      <Flex align="flex-start">
        <Box flex={1}>
          <Text size={1} muted style={{marginBottom: '8px'}}>{title}</Text>
          <Heading size={4} style={{marginBottom: '4px'}}>{value}</Heading>
          <Text size={1} accent={trendColors[trend]}>
            {trend === 'up' && '↑ Increased'}
            {trend === 'down' && '↓ Decreased'}
            {trend === 'attention' && '⚠ Needs attention'}
            {trend === 'stable' && '→ Stable'}
          </Text>
        </Box>
        <Box marginLeft={2}>
          <Text size={4} style={{lineHeight: 1}}>{icon}</Text>
        </Box>
      </Flex>
    </Card>
  )
}

// Enhanced OrderCard with better spacing
function OrderCard({order}: {order: Order}) {
  return (
    <Card padding={3} radius={1} shadow={1} tone="transparent">
      <Flex align="center" justify="space-between" gap={3}>
        <Box flex={1}>
          <Text weight="semibold" size={1} style={{marginBottom: '4px'}}>
            #{order.orderNumber}
          </Text>
          <Text size={1} muted style={{marginBottom: '4px'}}>
            {order.user?.firstName} {order.user?.lastName}
          </Text>
          <Text size={1} muted>
            {new Date(order._createdAt).toLocaleDateString()}
          </Text>
        </Box>
        <Box>
          <Text size={1} weight="semibold" style={{marginBottom: '4px'}}>
            {order.totalAmount} {order.currency}
          </Text>
          <Text 
            size={1} 
            accent={order.status === 'pending' ? 'warning' : 'success'}
            style={{textTransform: 'capitalize'}}
          >
            {order.status}
          </Text>
        </Box>
      </Flex>
    </Card>
  )
}

// Enhanced ProductCard with better spacing
function ProductCard({product}: {product: Product}) {
  const stockLevel = product.inventory?.quantity || 0
  const stockColor = stockLevel === 0 ? 'danger' : stockLevel < 5 ? 'warning' : 'caution'

  return (
    <Card padding={3} radius={1} shadow={1} tone="transparent">
      <Flex align="center" justify="space-between" gap={3}>
        <Box flex={1}>
          <Text weight="semibold" size={1} style={{marginBottom: '4px'}}>
            {product.name}
          </Text>
          <Text size={1} muted style={{marginBottom: '4px'}}>
            SKU: {product.sku}
          </Text>
        </Box>
        <Box>
          <Text 
            size={1} 
            accent={stockColor}
            weight="semibold"
            style={{marginBottom: '4px'}}
          >
            Stock: {stockLevel}
          </Text>
          <Text size={1}>
            {product.price?.priceExclVAT} {product.price?.currency}
          </Text>
        </Box>
      </Flex>
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
      icon: () => '📊',
    },
    {
      name: 'all-orders',
      title: 'All Orders',
      component: AllOrders,
      icon: () => '📋',
    },
  ]
})