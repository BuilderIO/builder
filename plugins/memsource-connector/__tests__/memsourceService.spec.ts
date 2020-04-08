/* eslint-disable @typescript-eslint/no-explicit-any */
import { MemsourceService } from '../src/services/memsourceService'
import { when } from 'jest-when'
import axios from 'axios'
jest.mock('axios')

global.console.error = jest.fn()

import {
  PROJECT_CREATION_RESPONSE,
  JOB_CREATION_RESPONSE
} from './fixtures/memsource'

describe('MemsourceService', () => {
  const PAGE_NAME = 'PT/Flyers'
  const AUTHORIZATION_TOKEN = 'someNastyAuthorizationTokenHere'
  const PROJECT_UUID = 'vhbpcO1jF4OWni8mbsfCk5'
  const SOURCE_LOCALE = 'en-IE'
  const TARGET_LOCALES = ['es-ES', 'pt-PT']
  const TRANSLATION_PAYLOAD = {
    prop1: 'translateme'
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('When creating a new translation job', () => {
    it('should return the UUID of the created job', async () => {
      when(axios.post as any)
        .calledWith(
          'https://cloud.memsource.com/web/api2/v1/projects',
          expect.anything(),
          expect.anything()
        )
        .mockReturnValueOnce(PROJECT_CREATION_RESPONSE)

      when(axios.post as any)
        .calledWith(
          `https://cloud.memsource.com/web/api2/v1/projects/${PROJECT_UUID}/jobs`,
          expect.anything(),
          expect.anything()
        )
        .mockReturnValueOnce(JOB_CREATION_RESPONSE)

      const memsourceService = new MemsourceService(AUTHORIZATION_TOKEN)

      const jobUUID = await memsourceService.sendTranslationJob(
        PAGE_NAME,
        SOURCE_LOCALE,
        TARGET_LOCALES,
        TRANSLATION_PAYLOAD
      )

      expect(jobUUID).not.toBe('')
    })

    describe('when project creation is not successful', () => {
      it('should throw an error', async () => {
        when(axios.post as any)
          .calledWith(
            'https://cloud.memsource.com/web/api2/v1/projects',
            expect.anything(),
            expect.anything()
          )
          .mockImplementationOnce(() => {
            throw new Error()
          })
        const memsourceService = new MemsourceService(AUTHORIZATION_TOKEN)

        await expect(
          memsourceService.sendTranslationJob(
            PAGE_NAME,
            SOURCE_LOCALE,
            TARGET_LOCALES,
            TRANSLATION_PAYLOAD
          )
        ).rejects.toThrow()
      })
    })

    describe('when translation job creation is not successful', () => {
      it('should throw an error', async () => {
        when(axios.post as any)
          .calledWith(
            'https://cloud.memsource.com/web/api2/v1/projects',
            expect.anything(),
            expect.anything()
          )
          .mockReturnValueOnce(PROJECT_CREATION_RESPONSE)

        when(axios.post as any)
          .calledWith(
            `https://cloud.memsource.com/web/api2/v1/projects/${PROJECT_UUID}/jobs`,
            expect.anything(),
            expect.anything()
          )
          .mockImplementationOnce(() => {
            throw new Error()
          })

        const memsourceService = new MemsourceService(AUTHORIZATION_TOKEN)

        await expect(
          memsourceService.sendTranslationJob(
            PAGE_NAME,
            SOURCE_LOCALE,
            TARGET_LOCALES,
            TRANSLATION_PAYLOAD
          )
        ).rejects.toThrow()
      })
    })
  })
})
