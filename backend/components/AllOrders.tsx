// components/AllOrders.tsx
import {Card, Text, Button, Flex, Spinner, useToast, Grid, Box, Stack, Heading} from '@sanity/ui'
import {useClient} from 'sanity'
import {useEffect, useState} from 'react'
import {Order} from '../data/model/modelTypes'

export function AllOrders() {
  const client = useClient({apiVersion: '2023-05-01'})
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const orders = await client.fetch(`
          *[_type == "order"] | order(_createdAt desc) {
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
        setOrders(orders)
      } catch (error) {
        toast.push({
          status: 'error',
          title: 'Failed to load orders',
          description: error instanceof Error ? error.message : 'Unknown error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
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
      <Flex align="center" justify="space-between" marginBottom={4}>
        <Heading size={3}>All Orders</Heading>
        <Button 
          as="a" 
          href="/desk/order;create" 
          text="Create New Order" 
          tone="primary"
          padding={3}
          fontSize={1}
        />
      </Flex>

      {orders.length > 0 ? (
        <Card padding={3} radius={2} shadow={1}>
          <Stack space={3}>
            {orders.map(order => (
              <OrderCardWithDetails key={order._id} order={order} />
            ))}
          </Stack>
        </Card>
      ) : (
        <Card padding={4} radius={2} shadow={1} tone="caution">
          <Text align="center" muted>No orders found</Text>
        </Card>
      )}
    </Box>
  )
}

function OrderCardWithDetails({order}: {order: Order}) {
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
            style={{textTransform: 'capitalize', marginBottom: '4px'}}
          >
            {order.status}
          </Text>
        </Box>
        <Box marginLeft={3}>
          <Button 
            as="a" 
            href={`/desk/order;${order._id}`}
            text="View Details" 
            mode="bleed" 
            fontSize={1}
            padding={2}
          />
        </Box>
      </Flex>
    </Card>
  )
}