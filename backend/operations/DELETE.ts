import sanityClient from '@sanity/client'
import { client } from '../sanityClient'

async function deleteAllCategories() {
  const categories = await client.fetch('*[_type == "category"]{_id}')
  
  const transaction = client.transaction()
  categories.forEach((category:any) => {
    transaction.delete(category._id)
  })
  
  await transaction.commit()
  console.log(`Deleted ${categories.length} categories`)
}

deleteAllCategories().catch(console.error)