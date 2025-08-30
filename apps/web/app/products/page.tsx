import { Suspense } from 'react'
import ProductsPage from './ProductsPage'

export default function Products() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPage />
    </Suspense>
  )
}
