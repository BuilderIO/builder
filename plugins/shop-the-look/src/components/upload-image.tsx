/** @jsx jsx */
import { jsx } from '@emotion/core'
import { Button } from '@material-ui/core'
import { useObserver } from 'mobx-react'
import { useState } from 'react'
import {
  getAllData,
  getByIdData,
  saveHotspots,
  saveImageToBuilder,
  updateHotspots
} from '../services'
interface Hotspot {
  id: number
  x: number
  y: number
  label: string
  fileName: string | null
  coordinates: string
}

export function UploadImagePage(props: any) {
  const { lookbook, onSave } = props
  const [formData, setFormData] = useState(lookbook || {})
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    lookbook?.data?.shopTheLookImage || null
  )
  const [hotspots, setHotspots] = useState<Hotspot[]>(
    lookbook?.data?.products.map((product: any) => ({
      id: Date.now() + Math.random(),
      x: parseFloat(product.coordinates.split(', ')[0].split(':')[1]),
      y: parseFloat(product.coordinates.split(', ')[1].split(':')[1]),
      label: product.productSku,
      fileName: lookbook.name,
      coordinates: product.coordinates
    })) || []
  )
  const [currentHotspot, setCurrentHotspot] = useState<Hotspot | null>(null)
  const [imageName, setImageName] = useState('')
  const [lookbookName, setLookbookName] = useState(lookbook?.name || '')
  const [showFileInput, setShowFileInput] = useState(false)
  const [isFileSaved, setIsFileSaved] = useState(
    !!lookbook?.data?.shopTheLookImage
  )
  const [data, setData] = useState<any>(null)
  const [recordId, setRecordId] = useState<string>(lookbook?.id || '')
  const [isVisible, setIsVisible] = useState(true)

  const handleNextLookbook = () => {
    if (lookbookName.trim()) setShowFileInput(true)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }
  const handleSaveFile = () => {
    if (selectedFile) {
      setIsFileSaved(true)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      const fetchMonthlyStatus = async () => {
        try {
          const data = await saveImageToBuilder(selectedFile, imageName)

          if (data.status === 200) {
            setData(data?.data)
            console.log('Image saved to builder Successfully ...!')
          } else {
            console.error(
              'Something went wrong during fetching attendance status..!'
            )
          }
        } catch (err) {
          console.error('Error fetching attendance Status...!')
        }
      }
      fetchMonthlyStatus()
    }
  }
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    setIsVisible(true)
    if (!isFileSaved) return

    const imgRect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - imgRect.left) / imgRect.width) * 100
    const y = ((event.clientY - imgRect.top) / imgRect.height) * 100

    if (x < 0 || x > 100 || y < 0 || y > 100) return

    const newHotspot: Hotspot = {
      id: Date.now(),
      x,
      y,
      coordinates: `x:${x}, y:${y}`,
      label: '',
      fileName: lookbookName || null
    }
    setCurrentHotspot(newHotspot)
    console.warn('Product data update detected ...!')
    console.info('Please update/save the products ...!')
  }

  const handleSaveHotspot = () => {
    if (currentHotspot?.label?.trim()) {
      if (hotspots.some(hotspot => hotspot.id === currentHotspot.id)) {
        setHotspots(prev =>
          prev.map(hotspot =>
            hotspot.id === currentHotspot.id
              ? { ...hotspot, label: currentHotspot.label }
              : hotspot
          )
        )
        console.warn('Product data udate detected ...!')
        console.info('Please update/save the products ...!')
      } else {
        setHotspots(prev => [...prev, currentHotspot])
        console.warn('Product data udate detected ...!')
        console.info('Please update/save the products ...!')
      }
      setCurrentHotspot(null)
    }
  }

  const handleDeleteHotspot = (id: number) => {
    setHotspots(prev => prev.filter(hotspot => hotspot.id !== id))
    console.warn('Product data udate detected ...!')
    console.info('Please update/save the products ...!')
  }

  const handleSaveAll = () => {
    console.log('hello')
    const formatedHotspots = hotspots.map((hotspot: Hotspot) => {
      return {
        productSku: hotspot.label,
        coordinates: hotspot.coordinates
      }
    })
    const payload = {
      name: lookbookName,
      data: {
        shopTheLookImage: data?.url,
        products: formatedHotspots
      }
    }
    if (recordId !== '') {
      const updateHotspotsData = async () => {
        try {
          const response = await updateHotspots({ ...payload, id: recordId })
          setRecordId(response.id)
          await getAllData()
          await getByIdData(recordId)
          if (response.status === 200) {
            console.log('products updated in builder successfully...!')
          }
        } catch (err) {
          console.error('Error updating products to builder...!')
        }
      }
      updateHotspotsData()
    } else {
      const saveHotspotsData = async () => {
        try {
          const response = await saveHotspots(payload)
          console.log(response)
          console.log('Products are saved to Builder Successfully ...!')
          setRecordId(response.id)
        } catch (err) {
          console.error('Error fetching attendance Status...!')
        }
      }
      saveHotspotsData()
    }
  }
  const handleImageInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageName(event.target.value)
  }

  return useObserver(() => (
    <div className="p-4" style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '10px' }}>
        <label
          style={{
            display: 'block',
            padding: '10px',
            color: 'whiteSmoke',
            marginRight: '5px',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Lookbook Name
        </label>
        <input
          className="py-2 px-2 mb-3 border border-black rounded-md w-80 cursor-pointer"
          value={lookbookName}
          onChange={e => setLookbookName(e.target.value)}
          placeholder="Please enter lookbook name..."
          style={{
            padding: '0.8rem',
            marginBottom: '0.75rem',
            border: '1px solid #e6e6e6',
            borderRadius: '0.25rem',
            width: '20rem',
            cursor: 'pointer',
            backgroundColor: '#f5f5f5',
            color: 'black',
            fontSize: '16px'
          }}
        />
        <Button
          onClick={handleNextLookbook}
          color="primary"
          variant="contained"
          disabled={!lookbookName.trim()}
          style={{
            paddingTop: '8px',
            paddingBottom: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            marginLeft: '1rem',
            borderRadius: '0.25rem',
            backgroundColor: lookbookName.trim() ? '#2196F3' : 'black',
            color: lookbookName.trim() ? 'white' : 'inherit'
          }}
        >
          Next
        </Button>
      </div>

      {showFileInput && (
        <div style={{ marginTop: '1rem' }}>
          <label
            style={{
              display: 'block',
              padding: '10px',
              color: 'whiteSmoke',
              marginRight: '5px',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Add File
          </label>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileInput}
            style={{
              display: 'none'
            }}
          />
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-block',
              width: '320px',
              padding: '0.7rem',
              border: '1px solid #ccc',
              borderRadius: '0.25rem',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              color: '#333',
              transition: 'background-color 0.3s, color 0.3s'
            }}
            onMouseEnter={e => {
              const target = e.target as HTMLElement
              target.style.backgroundColor = '#eee'
            }}
            onMouseLeave={e => {
              const target = e.target as HTMLElement
              target.style.backgroundColor = '#f9f9f9'
            }}
          >
            Choose File
          </label>
          <Button
            onClick={handleSaveFile}
            color="primary"
            variant="contained"
            disabled={!selectedFile}
            style={{
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              borderRadius: '0.25rem',
              marginLeft: '1rem',
              backgroundColor: selectedFile ? '#2196F3' : 'black',
              color: selectedFile ? 'white' : 'inherit'
            }}
          >
            Upload image
          </Button>
        </div>
      )}

      {isFileSaved && previewUrl && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '2rem',
            marginTop: '2rem'
          }}
        >
          <div
            style={{ position: 'relative', width: '65%', maxWidth: '768px' }}
          >
            <img
              src={previewUrl}
              alt="Preview"
              onClick={handleImageClick}
              style={{
                position: 'relative',
                width: '100%',
                height: 'auto',
                borderRadius: '10px'
              }}
            />
            {hotspots.map(hotspot => (
              <div
                key={hotspot.id}
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#B33951',
                  borderRadius: '100%',
                  position: 'absolute',
                  top: `${hotspot.y}%`,
                  left: `${hotspot.x}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setCurrentHotspot(hotspot)
                }}
              ></div>
            ))}
            {isVisible && currentHotspot && (
              <div
                style={{
                  position: 'absolute',
                  top: `${currentHotspot.y}%`,
                  left: `${currentHotspot.x}%`,
                  transform: 'translate(-00%, -100%)',
                  backgroundColor: 'white',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  width: '10rem'
                }}
              >
                <button
                  onClick={() => setIsVisible(false)}
                  style={{
                    position: 'absolute',
                    top: '-0.5rem',
                    right: '-0.5rem',
                    backgroundColor: 'whiteSmoke',

                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    color: 'black',
                    borderRadius: '100%',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  &times;
                </button>
                <input
                  type="text"
                  placeholder="Enter ProductSku"
                  style={{
                    border: '1px solid #e5e7eb',
                    width: '100%',
                    padding: '.5rem',
                    borderRadius: '0.25rem',
                    marginBottom: '0.5rem',
                    backgroundColor: 'whitesmoke',
                    color: 'black',
                    fontSize: '16px'
                  }}
                  value={currentHotspot.label}
                  onChange={e =>
                    setCurrentHotspot(prev =>
                      prev ? { ...prev, label: e.target.value } : null
                    )
                  }
                />
                <Button
                  onClick={handleSaveHotspot}
                  color="primary"
                  variant="contained"
                  disabled={!currentHotspot.label.trim()}
                  style={{
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    borderRadius: '0.25rem',
                    width: '100%',
                    backgroundColor: currentHotspot.label.trim()
                      ? '#4CAF50'
                      : '#7EE8C5',
                    color: currentHotspot.label.trim() ? 'white' : 'inherit'
                  }}
                >
                  Save
                </Button>
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            {hotspots.length > 0 && (
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
                  Hotspot table
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
                        Label
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          border: '1px solid #3A79AA'
                        }}
                      >
                        X (%)
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          border: '1px solid #3A79AA'
                        }}
                      >
                        Y (%)
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
                    {hotspots.map(hotspot => (
                      <tr key={hotspot.id} style={{ fontSize: '14px' }}>
                        <td
                          style={{
                            padding: '1rem',
                            border: '1px solid #3A79AA',
                            fontSize: '20px',
                            textAlign: 'center'
                          }}
                        >
                          {hotspot.label}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            border: '1px solid #3A79AA',
                            fontSize: '20px',
                            textAlign: 'center'
                          }}
                        >
                          {hotspot.x.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            border: '1px solid #3A79AA',
                            fontSize: '20px',
                            textAlign: 'center'
                          }}
                        >
                          {hotspot.y.toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: '1rem',
                            border: '1px solid #3A79AA',
                            textAlign: 'center'
                          }}
                        >
                          <button
                            onClick={() => handleDeleteHotspot(hotspot.id)}
                            style={{
                              padding: '0.8rem',
                              borderRadius: '0.5rem',
                              width: '100%',
                              backgroundColor: '#95190C',
                              color: 'white',
                              border: 'none',
                              fontSize: '1rem',
                              fontFamily: 'Inter'
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button
                  onClick={handleSaveAll}
                  color="primary"
                  variant="contained"
                  style={{
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                    paddingLeft: '0.5rem',
                    paddingRight: '0.5rem',
                    borderRadius: '0.25rem',
                    width: '20%',
                    fontSize: '16px',
                    marginTop: '20px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  Save All
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ))
}
