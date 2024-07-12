// TODO: put all memsource requests logic into this file

export async function createJob(projectUid: string, token: string, headers: HeadersInit | undefined, content: any) {
  const jobsUrl = `https://cloud.memsource.com/web/api2/v1/projects/${projectUid}/jobs`
  const baseJobsUrl = `https://cdn.builder.io/api/v1/proxy-api?url=${encodeURIComponent(jobsUrl)}`
  const fileName = `${content?.name}.json`

  const job = await fetch(baseJobsUrl, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Disposition': `filename*=UTF-8''${fileName}`,
      Memsource: '{"targetLangs":["es"]}',
      'Content-Type': 'application/octet-stream',
      Authorization: `ApiToken ${token}`
    },
    body: JSON.stringify(content)
  }).then((res) => res.json())
  return job

}