/* tslint:disable:no-empty */
import 'jest'
import React from 'react'
import { mount } from 'enzyme'
import CloudinaryImageEditor from '../src/CloudinaryImageEditor'
import CloudinayCredentialsDialog from '../src/CloudinaryCredentialsDialog'
import {
  CloudinaryMediaLibraryDialog,
  CloudinaryImage
} from '../src/CloudinaryMediaLibraryDialog'
import { Button } from '@material-ui/core'

import TestConstants from './TestConstants'

describe('Builder cloudinary plugin', () => {
  const buildContextWithCloudinarySettings = (
    key: string | undefined,
    cloudName: string | undefined
  ) => {
    return {
      user: {
        organization: {
          value: {
            settings: {
              plugins: new Map([
                ['cloudinaryCloud', cloudName],
                ['cloudinaryKey', key]
              ])
            }
          },
          save: () => {}
        }
      }
    }
  }

  describe('when plugin is rendered with no cloudinary settings', () => {
    it('should ask for cloudinary credentials', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      )
      const pickUpImageButton = cloudinaryImageEditor.find(Button).first()

      pickUpImageButton.simulate('click')

      const cloudinaryCredentialsDialog = cloudinaryImageEditor.find(
        CloudinayCredentialsDialog
      )
      expect(cloudinaryCredentialsDialog).toBeDefined()
      expect(cloudinaryCredentialsDialog.exists()).toBe(true)
    })

    it('should set the credentials back from the CloudinayCredentialsDialog', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      )
      const credentialsDialog = cloudinaryImageEditor.find(
        CloudinayCredentialsDialog
      )

      credentialsDialog
        .props()
        .updateCloudinaryCredentials(
          TestConstants.CLOUDINARY_API_KEY,
          TestConstants.CLOUDINARY_CLOUDNAME
        )

      expect(cloudinaryImageEditor.state('apiKey')).toBe(
        TestConstants.CLOUDINARY_API_KEY
      )
      expect(cloudinaryImageEditor.state('cloudName')).toBe(
        TestConstants.CLOUDINARY_CLOUDNAME
      )
    })

    it('should close cloudinary settings dialog when user updates the credentials', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(undefined, undefined)}
          onChange={(image: CloudinaryImage) => {}}
        />
      )

      const pickUpImageButton = cloudinaryImageEditor.find(Button).first()
      pickUpImageButton.simulate('click')
      const credentialsDialog = cloudinaryImageEditor.find(
        CloudinayCredentialsDialog
      )

      const closeCredentialsButton = credentialsDialog.find(Button).first()
      closeCredentialsButton.simulate('click')

      expect(cloudinaryImageEditor.state('showDialog')).toBe(false)
    })
  })

  describe('when plugin is rendered with cloudinary settings', () => {
    it('should render the cloudinary media library widget', () => {
      const cloudinaryImageEditor = mount(
        <CloudinaryImageEditor
          context={buildContextWithCloudinarySettings(
            TestConstants.CLOUDINARY_API_KEY,
            TestConstants.CLOUDINARY_CLOUDNAME
          )}
          onChange={(image: CloudinaryImage) => {
            console.log('image changed')
          }}
        />
      )

      expect(
        cloudinaryImageEditor.find(CloudinaryMediaLibraryDialog)
      ).toBeDefined()
    })

    describe('when clicking on set credentials button', () => {
      it('should show set credentials dialog', () => {
        const cloudinaryImageEditor = mount(
          <CloudinaryImageEditor
            context={buildContextWithCloudinarySettings(
              TestConstants.CLOUDINARY_API_KEY,
              TestConstants.CLOUDINARY_CLOUDNAME
            )}
            onChange={(image: CloudinaryImage) => {}}
          />
        )
        const setCredentialsButton = cloudinaryImageEditor.find(Button).last()
        setCredentialsButton.simulate('click')

        const cloudinaryCredentialsDialog = cloudinaryImageEditor.find(
          CloudinayCredentialsDialog
        )
        expect(cloudinaryCredentialsDialog).toBeDefined()
        expect(cloudinaryCredentialsDialog.exists()).toBe(true)
      })
    })
  })

  it('should pass the image to onChange when user selects from the cloudinary media widget', () => {
    let selectedImage = {}
    const cloudinaryImageEditor = mount(
      <CloudinaryImageEditor
        context={buildContextWithCloudinarySettings(
          TestConstants.CLOUDINARY_API_KEY,
          TestConstants.CLOUDINARY_CLOUDNAME
        )}
        onChange={(image: CloudinaryImage) => {
          selectedImage = image
        }}
      />
    )

    const pickUpImageButton = cloudinaryImageEditor.find(Button).first()
    pickUpImageButton.simulate('click')
    const mediaLibraryDialog = cloudinaryImageEditor.find(
      CloudinaryMediaLibraryDialog
    )

    mediaLibraryDialog
      .props()
      .selectImage(TestConstants.CLOUDINARY_DATA.assets[0])

    expect(selectedImage).toBe(TestConstants.CLOUDINARY_DATA.assets[0])
  })
})
