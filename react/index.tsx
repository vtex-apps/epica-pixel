import { canUseDOM } from 'vtex.render-runtime'
import { ProductOrder, Impression, PixelMessage } from './typings/events'

export function handleEvents(e: PixelMessage) {
  switch (e.data.eventName) {
    case 'vtex:userData': {
      const {
        isAuthenticated,
        firstName,
        lastName,
        document,
        id,
        email,
        phone,
      } = e.data
      if (!isAuthenticated) {
        return
      }      
      epica('identify', id, {
        isAuthenticated,
        firstName,
        lastName,
        document,
        id,
        email,
        phone      
      })
      break
    }    
    case 'vtex:pageView': {
      epica('track', 'Page Viewed', {
        title: e.data.pageTitle,
        url: e.data.pageUrl,
        referrer: e.data.referrer        
      })
      break
    }
    case 'vtex:addToCart': {
      const { items } = e.data
      epica('track', 'Product Added', {
        product_id: items[0].productRefId,
        sku: items[0].skuId,
        category: items[0].category,
        name: items[0].name,
        brand: items[0].brand,
        variant: items[0].variant,
        price: items[0].price,
        quantity: items[0].quantity    
      })
      break
    }
    case 'vtex:removeFromCart': {
      const { items } = e.data
      epica('track', 'Product Removed', {
        product_id: items[0].productRefId,
        sku: items[0].skuId,
        category: items[0].category,
        name: items[0].name,
        brand: items[0].brand,
        variant: items[0].variant,
        price: items[0].price,
        quantity: items[0].quantity     
      })
      break
    }
    case 'vtex:orderPlaced': {
      const { transactionProducts } = e.data
      epica('track','Order Completed', {
        checkout_id: e.data.transactionId,
        order_id: e.data.orderGroup,
        affiliation: e.data.transactionAffiliation,
        total: e.data.transactionTotal,
        revenue: e.data.transactionSubtotal,
        shipping: e.data.transactionShipping,
        tax: e.data.transactionTax,
        discount: e.data.transactionDiscounts,
        currency: e.data.currency,
        products: transactionProducts.map(
          (product: ProductOrder) => ({
            product_id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            category: product.category            
          })
        )
      })
      break
    }
    case 'vtex:productView': {     
      const { product, currency } = e.data
      epica('track', 'Product Viewed', {
        product_id: product.productId,
        sku: product.selectedSku.itemId,
        category: getCategory(product.categories),
        name: product.productName,
        brand: product.brand,
        variant: product.selectedSku.name,
        price: product.selectedSku.sellers[0].commertialOffer.Price,
        currency    
      })
      break
    }
    case 'vtex:productClick': {
      const { product } = e.data
      epica('track', 'Product Clicked', {
        product_id: product.productId,
        sku: product.sku.itemId,
        category: getCategory(product.categories),
        name: product.productName,
        brand: product.brand,
        variant: product.sku.name,
        price: product.sku.seller?.commertialOffer.Price,
        url: product.linkText,
        image_url: product.sku.image.imageUrl
      })
      break
    }
    case 'vtex:productImpression': {
      const { impressions, list, position, product } = e.data

      let oldImpresionFormat: Record<string, any> | null = null
      if (product != null && position != null) {
        oldImpresionFormat = [
          getProductImpressionObjectData(list)({
            product,
            position,
          }),
        ]
      }

      const parsedImpressions = (impressions || []).map(
        getProductImpressionObjectData(list)
      )      

      epica('track','Product List Viewed', {
        list_id: list,
        products: oldImpresionFormat || parsedImpressions
      })
      break
    }
    default: {
      break
    }
  }
}

function removeStartAndEndSlash(category: string) {
  return category && category.replace(/^\/|\/$/g, '')
}

function getCategory(rawCategories: string[]) {
  if (!rawCategories || !rawCategories.length) {
    return
  }

  return removeStartAndEndSlash(rawCategories[0])
}

const getProductImpressionObjectData = (list: string) => ({
  product,
  position,
}: Impression) => ({
  brand: product.brand,
  category: getCategory(product.categories),
  product_id: product.sku.itemId,
  list,
  name: product.productName,
  position,
  price: `${product.sku.seller!.commertialOffer.Price}`,
  variant: product.sku.name,
})

if (canUseDOM) {
  window.addEventListener('message', handleEvents)
}
