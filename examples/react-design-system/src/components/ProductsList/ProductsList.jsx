import React, { useState, useEffect} from 'react'
import ReactJson from 'react-json-view'
import queryString from 'query-string'

const defaultParams = {
    abbreviatedCategoryHistogram: true,
    limit: 20,
    cat: 'mens',
    view: 'web',
    useElasticsearch: true,
    sorts: 'PriceHiLo',
    pid: 'shopstyle'
}

export const ProductsList = (props) => {
    const { url, limit, category } = props
    const [data, setData] = useState({ products: [] });
    useEffect(() => {
        async function fetchProducts() {
            const qs = queryString.stringify({
                limit,
                cat: category,
                ...defaultParams,
            })
            const result = await fetch(`${url}?${qs}`).then((res) => res.json())
            setData(result);      
        }
        fetchProducts()
    }, [limit, category, url]);
  
    return (
        <>
            <ReactJson src={data.products} />
        </>
    )
}

