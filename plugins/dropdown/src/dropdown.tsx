import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'

const extractFieldOption = (object: any, field: any) => {
  try {
    return { field: object[field] }
  } catch {
    throw new Error(`${field} not found`)
  }
}

const compare = (a: any, b: any) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

export const Dropdown = (props: any) => {
  const [url, mapper] = [
    extractFieldOption(props.field, 'url'),
    extractFieldOption(props.field, 'mapper')
  ]

  const [tenant, locale] = [
    props.context.designerState.editingContentModel.data.get('tenant'),
    props.context.designerState.editingContentModel.data.get('locale')
  ]

  const [selected, setSelected] = useState(props.value || '')
  const [selections, setSelections] = useState([])
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelected(event.target.value)
    props.onChange(event.target.value)
  }

  const getSelections = async (url: any) => {
    if (tenant && locale && url) {
      const response = await fetch(url)

      const data = await response.json()
      const mappedSelections = data.map((item: any) => ({
        name: item.name,
        key: item.mpvId
      }))
      mappedSelections.sort(compare)
      setSelections(mappedSelections)
    }
  }

  useEffect(() => {
    getSelections(url.replace('${tenant}', tenant).replace('${locale}', locale))
  }, [tenant, locale])

  return (
    <FormControl variant="outlined">
      <InputLabel id="demo-simple-select-outlined-label">Mpv Id</InputLabel>
      <Select
        id="demo-simple-select-outlined"
        value={selected}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {selections &&
          selections.map((selection: any) => (
            <MenuItem value={selection.key}>{selection.name}</MenuItem>
          ))}
      </Select>
    </FormControl>
  )
}

Builder.registerEditor({
  /**
   * @usage
   *
   * withBuilder(YourComponent, {
   *  inputs: [
   *     {
   *      name: 'whateverYouWant',
   *      type: 'dropdown',
   *      options: {
   *        url: '',
   *        mapper: 'responseData.someArray.map(item => ({ name: item.title, value: item.valueProperty }))'
   *      }
   *    }
   *  ]
   * })
   */
  name: 'dropdown',
  component: Dropdown
})
