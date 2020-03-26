import { MemsourceClient } from '../clients/memsourceClient'

export class MemsourceService {
  private memsourceClient: MemsourceClient
  constructor(authorizationToken: string) {
    this.memsourceClient = new MemsourceClient(authorizationToken)
  }

  sendTranslationJob = async (
    projectName: string,
    sourceLocale: string,
    targetLocales: string[],
    payload: object
  ): Promise<string> => {
    const projectUUID = await this.memsourceClient.createProject(
      projectName,
      sourceLocale,
      targetLocales
    )

    return await this.memsourceClient.createJob(
      projectUUID,
      targetLocales,
      payload
    )
  }
}
