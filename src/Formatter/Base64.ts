import * as Base64 from 'js-base64'
import { ConvertError } from '../Error'
import { ProxyServer } from '../ProxyServer'

export default function FormatProxyToBase64(ProxyList: ProxyServer[]): string {
    const proxies: string[] = []
    for (let rawProxy of ProxyList) {
        let url = new URL(`${rawProxy.Type}://${rawProxy.ServerAddress}:${rawProxy.ServerPort}`)
        if (rawProxy.Type === 'vmess') {
            let proxy = rawProxy
            const config: any = {}
            config.add = proxy.ServerAddress
            config.port = proxy.ServerPort
            config.type = proxy.Cipher
            config.id = proxy.ClientID
            config.aid = `${proxy.ClientAlterID}`
            config.ps = proxy.Name
            config.type = 'none'
            if (proxy.Transport !== 'tcp') {
                config.net = proxy.Transport
            }
            if (proxy.TransportSecurity === 'tls') {
                config.tls = 'tls'
            }
            if (proxy.Transport === 'ws' && proxy.WebSocketPath) {
                config.path = proxy.WebSocketPath
            }
            if (proxy.Transport === 'ws' && proxy.WebSocketHost) {
                config.host = proxy.WebSocketHost
            }
            proxies.push(`vmess://${Base64.encode(JSON.stringify(config))}`)
            continue
        } else if (rawProxy.Type === 'ss') {
            let proxy = rawProxy
            url.username = proxy.Cipher
            url.password = proxy.Password
            url.hash = `#${proxy.Name}`
        } else if (rawProxy.Type === 'ssr') {
            let proxy = rawProxy
            const config = [
                proxy.ServerAddress,
                proxy.ServerPort,
                proxy.Protocol,
                proxy.Cipher,
                proxy.Obfs,
                Base64.encode(proxy.Password),
            ]
            const params = new URLSearchParams()
            params.set('remarks', Base64.encode(proxy.Name))
            if (proxy.ObfsParams) {
                params.set('obfsparam', proxy.ObfsParams)
            }
            if (proxy.ProtocolParams) {
                params.set('protoparam', proxy.ProtocolParams)
            }
            proxies.push(`vmess://${Base64.encode(`${config.join(':')}/?${params.toString()}`)}`)
            continue
        } else if (rawProxy.Type === 'trojan') {
            let proxy = rawProxy
            url.username = proxy.Password
            url.hash = `#${proxy.Name}`
            if (proxy.ServerName) {
                url.searchParams.set('sni', proxy.ServerName)
            }
            if (proxy.AllowInsecure) {
                url.searchParams.set('allowInsecure', proxy.AllowInsecure.toString())
            }
        } else {
            throw new ConvertError(`unknown type: ${(rawProxy as any)?.Type}`).WithTarget('base64').WithData(rawProxy)
        }
        proxies.push(url.toString())
    }
    return Base64.encode(proxies.join('\n'))
}
