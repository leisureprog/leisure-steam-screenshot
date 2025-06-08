async function newRequests(href: string, module: 'screenshot' | 'video'): Promise<string | { error: string }> {
  try {
    const response = await fetch(`https://requests.cs2inspects.com/newrequests`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        module,
        method: 'inspectlink',
        inspectlink: href,
        steamid: '',
        sessionid: '7b60cfa1-236e-499d-b65e-36912c6b51f2',
        map: 'default',
        view: 'default',
      }),
    })

    const responseJson = await response.json()

    if (responseJson.id) {
      console.log('Request processed, starting polling...', responseJson)

      return await pollRequestStatus()
    }

    return { error: 'Unexpected response status' }
  } catch (error: any) {
    return { error: error.message }
  }
}

async function pollRequestStatus(): Promise<string | { error: string }> {
  const sessionId = '7b60cfa1-236e-499d-b65e-36912c6b51f2'
  let attempts = 0
  const maxAttempts = 30 // Максимальное количество попыток
  const delayBetweenAttempts = 2000 // 2 секунды между попытками

  while (attempts < maxAttempts) {
    attempts++
    console.log(`Polling attempt ${attempts}`)

    try {
      const statusResponse = await fetch(`https://requests.cs2inspects.com/requestlist2?sessionid=${sessionId}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      const statusJson = await statusResponse.json()

      if (statusJson.requestlist && statusJson.requestlist.length > 0) {
        const request = statusJson.requestlist[0]

        if ([3, 15].includes(request.status_id)) {
          console.log('Request completed successfully', request)
          return request.file // Возвращаем file когда статус 3
        } else if (request.status_id === 2) {
          console.log('Request still in progress', request)
        } else {
          console.log('Unexpected status', request)
        }
      }

      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts))
    } catch (error) {
      console.error('Polling error:', error)
      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts))
    }
  }

  return { error: 'Max polling attempts reached without completion' }
}

export function startExtension() {
  chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
    if (message.type === 'newRequests') {
      newRequests(message.href, message.module)
        .then(data => sendResponse({ status: 'success', data }))
        .catch(error => {
          sendResponse({ status: 'error', error: error.message })
        })
      return true
    }
  })
}
