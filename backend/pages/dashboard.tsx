// components/Dashboard.tsx
import {Card, Text, Button, Flex, Spinner, useToast, Grid, Box, Stack, Heading} from '@sanity/ui'
import {definePlugin, useClient} from 'sanity'
import {useEffect, useState} from 'react'
import {Order, Product } from '../data/model/modelTypes'

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
    <Box padding={4}>
      <Heading size={3} marginBottom={4}>Dashboard Overview</Heading>
      
      {stats && (
        <Grid columns={[1, 1, 2, 4]} gap={4} marginBottom={5}>
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

      <Grid columns={[1, 1, 2]} gap={4} marginBottom={5}>
        <Card padding={3} shadow={1} radius={2}>
          <Heading size={2} marginBottom={3}>Recent Orders</Heading>
          {recentOrders.length > 0 ? (
            <Stack space={3}>
              {recentOrders.map(order => (
                <OrderCard key={order._id} order={order} />
              ))}
            </Stack>
          ) : (
            <Text>No recent orders</Text>
          )}
        </Card>

        <Card padding={3} shadow={1} radius={2}>
          <Heading size={2} marginBottom={3}>Low Stock Products</Heading>
          {lowStockProducts.length > 0 ? (
            <Stack space={3}>
              {lowStockProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </Stack>
          ) : (
            <Text>All products have sufficient stock</Text>
          )}
        </Card>
      </Grid>

      {/* Quick Actions */}
      <Card padding={4} radius={2} shadow={1} marginBottom={5}>
        <Heading size={2} marginBottom={3}>Quick Actions</Heading>
        <Grid columns={[2, 2, 4]} gap={3}>
          <Button 
            as="a" 
            href="/desk/product;create" 
            text="Add Product" 
            mode="ghost" 
            tone="primary"
            padding={4}
            fontSize={2}
          />
          <Button 
            as="a" 
            href="/desk/order;create" 
            text="Create Order" 
            mode="ghost" 
            tone="positive"
            padding={4}
            fontSize={2}
          />
          <Button 
            as="a" 
            href="/desk/category;create" 
            text="Add Category" 
            mode="ghost" 
            tone="caution"
            padding={4}
            fontSize={2}
          />
          <Button 
            as="a" 
            href="/desk/brand;create" 
            text="Add Brand" 
            mode="ghost" 
            tone="critical"
            padding={4}
            fontSize={2}
          />
        </Grid>
      </Card>
    </Box>
  )
}

// Helper components
function StatCard({title, value, trend, icon}: {title: string, value: number, trend: 'up' | 'down' | 'stable' | 'attention', icon: string}) {
  const trendColors = {
    up: 'success',
    down: 'danger',
    stable: 'default',
    attention: 'warning'
  }

  return (
    <Card padding={3} shadow={1} radius={2}>
      <Flex align="center" justify="space-between">
        <Box>
          <Text size={1} muted>{title}</Text>
          <Heading size={3}>{value}</Heading>
        </Box>
        <Box>
          <Text size={4}>{icon}</Text>
        </Box>
      </Flex>
      <Box marginTop={2}>
        <Text size={1} accent={trendColors[trend]}>
          {trend === 'up' && '↑ Increased'}
          {trend === 'down' && '↓ Decreased'}
          {trend === 'attention' && '⚠ Needs attention'}
          {trend === 'stable' && '→ Stable'}
        </Text>
      </Box>
    </Card>
  )
}

function OrderCard({order}: {order: Order}) {
  return (
    <Card padding={3} shadow={1} radius={1}>
      <Flex align="center" justify="space-between">
        <Box>
          <Text weight="bold">#{order.orderNumber}</Text>
          <Text size={1}>{order.user?.firstName} {order.user?.lastName}</Text>
        </Box>
        <Box>
          <Text size={1}>
            {order.totalAmount} {order.currency}
          </Text>
          <Text size={1} accent={order.status === 'pending' ? 'warning' : 'success'}>
            {order.status}
          </Text>
        </Box>
      </Flex>
    </Card>
  )
}

function ProductCard({product}: {product: Product}) {
  return (
    <Card padding={3} shadow={1} radius={1}>
      <Flex align="center" justify="space-between">
        <Box>
          <Text weight="bold">{product.name}</Text>
          <Text size={1}>SKU: {product.sku}</Text>
        </Box>
        <Box>
          <Text size={1} accent={product.inventory?.quantity === 0 ? 'danger' : 'warning'}>
            Stock: {product.inventory?.quantity || 0}
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
      icon: () => '📊', // You can use a custom icon component here
    }
  ]
})