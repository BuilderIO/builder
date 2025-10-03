import React, { useState } from 'react'
const context = require('@builder.io/app-context').default
import { Builder } from '@builder.io/react'
import './style.css'

function TranslateTab() {
	const {
		globalState,
		dialogs: { prompt },
		designerState: { _selectedElements, editingContentModel },
		user: { organizations, currentOrganization }
	} = context
	
	const organization = organizations.find(({ value }) => value.id === currentOrganization).toJSON()
	const locales = organization.value.customTargetingAttributes.locale.enum

	const pluginSettings = organization.value.settings.plugins["@builder.io/plugin-google-translate"]
	const apiKey = pluginSettings['apiKey']

	const [blocksToTranslate, setBlocksToTranslate] = useState('all')
	const [localesToTranslate, setLocalesToTranslate] = useState('all')

	const translateApiAsync = async (q, target) => {
		const data = {
			q,
			target,
		}

		const options = {
			method: 'post',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		}

		const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, options)
		const result = await response.json()

		return result.data.translations[0].translatedText
	}

	const handleSubmit = async () => {
		try{
			globalState.showGlobalBlockingLoadingIndicator = true

			const blocks = blocksToTranslate === 'all' ? editingContentModel.allBlocks : [editingContentModel.allBlocks.find(block => block.id === _selectedElements.toJSON()[0]?.id)]

			await Promise.all(blocks.map(async block => {
				const { component: { name, options } } = block
				if(name !== 'Text') return

				const { text } = options.toJSON()

				const result = typeof text === 'string' ?
				{
					"@type": "@builder.io/core:LocalizedValue",
					Default: text
				}
				:
				Object.assign({}, text)

				const languageCodes = localesToTranslate === 'all' ? locales : [localesToTranslate]

				await Promise.all(languageCodes.map(async languageCode => {
					result[languageCode] = await translateApiAsync(result.Default, languageCode)
				}))
				
				await block.set('meta', {
					...block.meta.toJSON(),
					"bindingActions": {
						"component": {
							"options": {
								"text": []
							}
						}
					},
					"eventActions": {
						"": []
					},
					"localizedTextInputs": [ "text" ],
					"transformed.text": "localized"
				})
				
				await options.set('text', result)
			}))
		} catch (e) {
			console.error(e)
		} finally {
			globalState.showGlobalBlockingLoadingIndicator = false
		}
	}

	return <div id='builder-io-plugin-google-translate'>
		<p>
			I want to translate&nbsp;
			<select onChange={e => setBlocksToTranslate(e.target.value)}>
				<option value='all'>all text blocks</option>
				<option value=''>this text block</option>
			</select>
			&nbsp;to&nbsp;
			<select onChange={e => setLocalesToTranslate(e.target.value)}>
				<option value='all'>all locales</option>
				{locales.map(language => <option value={language}>{language}</option>)}
			</select>.
		</p>
		<button onClick={handleSubmit}>Submit</button>
	</div>
}

Builder.register('editor.editTab', {
	icon: 'https://i.imgur.com/pN9hHSn.png',
	name: 'Translate',
	component: TranslateTab,
})

Builder.register('plugin', {
	id: "@builder.io/plugin-google-translate",
	name: 'GoogleTranslate',
	settings: [
		{
			name: 'apiKey',
			type: 'text',
			defaultValue: true,
		},
	],
})