import React, { useEffect, useState } from 'react'
import { deleteLookbookData, getAllData } from '../services'

interface LookbookItemProps {
  id: string
  name: string
  data: {
    products: { id: string; name: string }[]
  }
}
const LookbookPage = ({ onEditClick }: any) => {
  const [lookbookData, setLookbookData] = useState<LookbookItemProps[]>()
  useEffect(() => {
    const data = async () => {
      const response = await getAllData()
      const data = response.results
      setLookbookData(data)
      return data
    }

    console.log(data())
  }, [])

  if (lookbookData?.length === undefined) {
    return <div>There are no lookbooks currently!</div>
  }

  const handleDelete = async (id: string) => {
    const response = await deleteLookbookData(id)

    console.log('Lookboook deleted successfully')
    return response
  }
  return (
    <div style={{ flex: 1, padding: '20px' }}>
      {lookbookData?.length > 0 && (
        <div className="mt-4">
          <span
            style={{
              marginBottom: '20px',
              display: 'block',
              color: 'whiteSmoke',
              marginRight: '5px',
              fontSize: '18px',
              fontWeight: 'bold',
              textDecoration: 'underline'
            }}
          >
            Lookbook table
          </span>
          <table
            style={{
              tableLayout: 'auto',
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #3A79AA',
              borderRadius: '0.25rem'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#063D68', color: 'white' }}>
                <th
                  style={{
                    padding: '1rem',
                    border: '1px solid #3A79AA'
                  }}
                >
                  Lookbook Name
                </th>
                <th
                  style={{
                    padding: '1rem',
                    border: '1px solid #3A79AA'
                  }}
                >
                  Hotspot Count
                </th>
                <th
                  style={{
                    padding: '1rem',
                    border: '1px solid #3A79AA'
                  }}
                >
                  Edit
                </th>
                <th
                  style={{
                    padding: '1rem',
                    border: '1px solid #3A79AA'
                  }}
                >
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {lookbookData?.map(item => (
                <tr key={item?.id} style={{ fontSize: '14px' }}>
                  <td
                    style={{
                      padding: '1rem',
                      border: '1px solid #3A79AA',
                      fontSize: '20px',
                      textAlign: 'center'
                    }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      border: '1px solid #3A79AA',
                      fontSize: '20px',
                      textAlign: 'center'
                    }}
                  >
                    {item.data.products.length}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      border: '1px solid #3A79AA',
                      fontSize: '20px',
                      textAlign: 'center'
                    }}
                  >
                    <button
                      onClick={() => onEditClick(item)}
                      style={{
                        padding: '0.8rem',
                        borderRadius: '0.5rem',
                        width: '50%',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        fontSize: '1rem',
                        fontFamily: 'Inter',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      border: '1px solid #3A79AA',
                      textAlign: 'center'
                    }}
                  >
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{
                        padding: '0.8rem',
                        borderRadius: '0.5rem',
                        width: '40%',
                        backgroundColor: '#95190C',
                        color: 'white',
                        border: 'none',
                        fontSize: '1rem',
                        fontFamily: 'Inter',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default LookbookPage
