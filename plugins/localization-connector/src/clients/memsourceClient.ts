/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosRequestConfig } from 'axios'

interface CreateProjectPayload {
  name: string
  sourceLang: string
  targetLangs: string[]
}

interface CreateProjectParameters {
  payload: CreateProjectPayload
  config: AxiosRequestConfig
}

export class MemsourceClient {
  private authorizationToken: string

  constructor(authorizationToken: string) {
    this.authorizationToken = authorizationToken
  }

  public createProject = async (
    name: string,
    sourceLocale: string,
    targetLocales: string[]
  ): Promise<string> => {
    const { payload, config } = this.getCreateProjectParameters(
      name,
      sourceLocale,
      targetLocales
    )

    try {
      const result = await axios.post(
        'https://cloud.memsource.com/web/api2/v1/projects',
        payload,
        config
      )

      return result.data.uid
    } catch (error) {
      throw error
    }
  }

  public createJob = async (
    projectUUID: string,
    targetLocales: string[],
    jsonToTranslate: object,
    inputSettings: string | undefined
  ): Promise<string> => {
    try {
      const result = await axios.post(
        `https://cloud.memsource.com/web/api2/v1/projects/${projectUUID}/jobs`,
        jsonToTranslate,
        this.getCreateJobConfig(targetLocales, inputSettings)
      )

      return result.data.uid
    } catch (error) {
      throw error
    }
  }

  private getCreateJobConfig = (
    targetLocales: string[],
    inputSettings: string | undefined
  ): AxiosRequestConfig => {
    const Memsource: any = {
      targetLangs: targetLocales.map(this.convertToMemsourceLocale)
    }

    if (inputSettings !== undefined) {
      Memsource['uid'] = inputSettings
    }

    const jobConfig = {
      headers: {
        Authorization: `Bearer ${this.authorizationToken}`,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'filename=file.json',
        Memsource: JSON.stringify(Memsource)
      }
    }
    return jobConfig
  }

  private getCreateProjectParameters = (
    name: string,
    sourceLocale: string,
    targetLocales: string[]
  ): CreateProjectParameters => {
    const config = this.getCreateProjectConfig()
    const payload = this.getCreateProjectPayload(
      name,
      sourceLocale,
      targetLocales
    )
    return { payload, config }
  }

  private getCreateProjectPayload = (
    name: string,
    sourceLocale: string,
    targetLocales: string[]
  ): CreateProjectPayload => {
    return {
      name,
      sourceLang: this.convertToMemsourceLocale(sourceLocale),
      targetLangs: targetLocales.map(this.convertToMemsourceLocale)
    }
  }

  private getCreateProjectConfig = (): AxiosRequestConfig => {
    return {
      headers: {
        Authorization: `Bearer ${this.authorizationToken}`,
        'Content-Type': 'application/json'
      }
    }
  }

  private convertToMemsourceLocale = (locale: string): string => {
    const memsourceLocale = locale
      .split('-')
      .map(item => item.toLowerCase())
      .join('_')
    return memsourceLocale
  }
}
