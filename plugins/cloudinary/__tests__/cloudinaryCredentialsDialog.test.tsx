/* tslint:disable:no-empty */
import 'jest'
import React from 'react'
import { mount } from 'enzyme'
import CloudinayCredentialsDialog from '../src/CloudinaryCredentialsDialog'
import { Button, TextField } from '@material-ui/core'
import TestConstants from './TestConstants'

describe('Cloudinary Credential dialog', () => {
  describe('when dialog is rendered', () => {
    it('should ask for cloudinary api key and cloud name', () => {
      const cloudinaryCredentialsDialog = mount(
        <CloudinayCredentialsDialog
          openDialog={true}
          closeDialog={() => {}}
          updateCloudinaryCredentials={(
            apiKey: string,
            cloudName: string
          ) => {}}
        />
      )

      const apiKeyField = cloudinaryCredentialsDialog.find(TextField).first()
      const cloudNameField = cloudinaryCredentialsDialog.find(TextField).last()

      expect(apiKeyField.exists()).toBe(true)
      expect(cloudNameField.exists()).toBe(true)
    })

    it('should set the state with the credentials provided', () => {
      const cloudinaryCredentialsDialog = mount(
        <CloudinayCredentialsDialog
          openDialog={true}
          closeDialog={() => {}}
          updateCloudinaryCredentials={(
            apiKey: string,
            cloudName: string
          ) => {}}
        />
      )

      const apiKeyField = cloudinaryCredentialsDialog.find(TextField).first()
      const cloudNameField = cloudinaryCredentialsDialog.find(TextField).last()

      apiKeyField.find('input').simulate('change', {
        target: { name: '', value: TestConstants.CLOUDINARY_API_KEY }
      })

      cloudNameField.find('input').simulate('change', {
        target: { name: '', value: TestConstants.CLOUDINARY_CLOUDNAME }
      })

      expect(cloudinaryCredentialsDialog.state('apiKey')).toBe(
        TestConstants.CLOUDINARY_API_KEY
      )
      expect(cloudinaryCredentialsDialog.state('cloudName')).toBe(
        TestConstants.CLOUDINARY_CLOUDNAME
      )
    })

    it('should call update cloudinary credentials callback when updating', () => {
      let callbackWasCalled = false
      const cloudinaryCredentialsDialog = mount(
        <CloudinayCredentialsDialog
          openDialog={true}
          closeDialog={() => {}}
          updateCloudinaryCredentials={(apiKey: string, cloudName: string) => {
            callbackWasCalled = true
          }}
        />
      )

      const updateCredentialsButton = cloudinaryCredentialsDialog
        .find(Button)
        .last()

      updateCredentialsButton.simulate('click')

      expect(callbackWasCalled).toBe(true)
    })

    it('should call close dialog callback when updating', () => {
      let callbackWasCalled = false
      const cloudinaryCredentialsDialog = mount(
        <CloudinayCredentialsDialog
          openDialog={true}
          closeDialog={() => {
            callbackWasCalled = true
          }}
          updateCloudinaryCredentials={(
            apiKey: string,
            cloudName: string
          ) => {}}
        />
      )

      const updateCredentialsButton = cloudinaryCredentialsDialog
        .find(Button)
        .last()

      updateCredentialsButton.simulate('click')

      expect(callbackWasCalled).toBe(true)
    })
  })
})
