export function getProductName(item, products) {
    if (item.product && item.product.product_name) return item.product.product_name
    let id = ''
    if (typeof item.product === 'string') id = item.product
    else if (item.product && item.product.$oid) id = item.product.$oid
    else if (item.product && item.product._id) id = item.product._id
    const found = products.find(p => p._id === id)
    return found ? found.product_name : id
}

export function itemKey(item) {
    if (typeof item._id === 'string') return item._id
    if (item._id && item._id.$oid) return item._id.$oid
    return Math.random()
}

export function getProductInfo(product, products) {
    let id = ''
    if (typeof product === 'string') id = product
    else if (product && product.$oid) id = product.$oid
    else if (product && product._id) id = product._id
    
    if (product && product.product_name) {
        return { 
            id: product._id ? product._id : id, 
            name: product.product_name,
            product_name: product.product_name,
            img: product.img || null
        }
    }
    
    const found = products.find(p => p._id === id)
    return { 
        id, 
        name: found ? found.product_name : id,
        product_name: found ? found.product_name : id,
        img: found ? found.img : null
    }
}

export function getItemId(item) {
    if (typeof item._id === 'string') return item._id
    if (item._id && item._id.$oid) return item._id.$oid
    return Math.random()
}
