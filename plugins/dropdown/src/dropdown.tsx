import { Builder } from '@builder.io/sdk'
import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, FormControl, Select } from '@material-ui/core'
// @ts-ignore
import * as SES from 'ses'

/**
 * Evaluate foreign code safely using SES https://github.com/Agoric/SES
 */
export function safeEvaluate(code: string, context: any = {}) {
  const realm = SES.makeSESRootRealm({
    consoleMode: 'allow'
  })
  const result = realm.evaluate(code, context)
  return result
}

export const Dropdown = (props: any) => {
  const { url, mapper } = props.field.options
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
      const response = await fetch(url)

      const data = await response.json()
      const mappedSelections = safeEvaluate(mapper, { responseData: data })

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
   * @usage
   *
   * withBuilder(YourComponent, {
   *  inputs: [
   *     {
   *      name: 'whateverYouWant',
   *      type: 'dropdown',
   *      options: {
   *        url: 'https://merchandising-product-service.cdn.vpsvc.com/api/v3/MerchandisingProductViewAll/vistaprint/en-IE?requestor=asier',
   *        mapper: 'responseData.someArray.map(item => ({ name: item.title, value: item.valueProperty }))'
   *      }
   *    }
   *  ]
   * })
   */
  name: 'dropdown',
  component: Dropdown
})
