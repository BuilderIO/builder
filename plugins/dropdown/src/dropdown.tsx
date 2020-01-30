import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'

const Dropdown = (props: any) => {
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

  const compare = (a: any, b: any) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  }

  const getSelections = async () => {
    if (tenant && locale) {
      const response = await fetch(
        'https://merchandising-product-service.cdn.vpsvc.com/api/v3/MerchandisingProductViewAll/vistaprint/en-IE?requestor=asier'
      )

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
    getSelections()
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
   * Here we override the built-in "file" type editor. You can also create your own
   * type instead - e.g. name: 'ExampleImage' and that can be set as input field "types"
   * in the Builder.io webapp or in custom components
   */
  name: 'dropdown',
  component: Dropdown
})
