export default function GetProxyListFromBase64(content: string): any[] {
  const realContent = Buffer.from(content, 'base64').toString()
  const proxies = realContent
    .replace(/\r/g, '')
    .split('\n')
    .filter(v => !!v)
    .map(v => {
    switch (true) {
      case v.startsWith('vmess://'):
        const proxy = JSON.parse(Buffer.from(v.slice(8), 'base64').toString())
        return {
          name: proxy.ps,
          type: 'vmess',
          server: proxy.add,
          port: proxy.port,
          uuid: proxy.id,
          alterId: proxy.aid,
          udp: true,
          cipher: 'auto',
          network: proxy.net,
          'ws-path': proxy.path,
          'ws-headers': {
            Host: proxy.host
          },
        }
    
      default:
        throw new Error("Unsupported proxy type.")
    }
  })
  return proxies
}
