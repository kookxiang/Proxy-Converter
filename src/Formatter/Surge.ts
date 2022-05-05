import { ConvertError } from '../Error'
import { ProxyServer } from '../ProxyServer'

export default function FormatProxyForSurge(ProxyList: ProxyServer[]): string {
    let result: string[] = []
    for (let proxy of ProxyList) {
        let row: string[] = []
        if (proxy.Type === 'vmess') {
            row.push(`${proxy.Name} = vmess`)
            row.push(proxy.ServerAddress)
            row.push(`${proxy.ServerPort}`)
            row.push(proxy.ClientID)
            if (proxy.Cipher !== "auto") {
                row.push(`encrypt-method=${proxy.Cipher}`)
            }
            if (proxy.TransportSecurity === 'tls') {
                row.push('tls=true')
            }
            if (proxy.Transport === 'ws') {
                row.push('ws=true')
            } else if (proxy.Transport !== 'tcp') {
                console.warn(`${proxy.Transport} is not supported in surge`)
                continue
            }
            if (proxy.Transport === 'ws' && proxy.WebSocketPath) {
                row.push(`ws-path=${encodeURI(proxy.WebSocketPath)}`)
            }
            if (proxy.Transport === 'ws' && proxy.WebSocketHost) {
                row.push(`ws-headers=host:${JSON.stringify(proxy.WebSocketHost)}`)
            }
        } else if (proxy.Type === 'ss') {
            row.push(`${proxy.Name} = ss`)
            row.push(proxy.ServerAddress)
            row.push(`${proxy.ServerPort}`)
            row.push(`encrypt-method=${proxy.Cipher}`)
            row.push(`password=${proxy.Password}`)
            if (proxy.SupportUDP) {
                row.push(`udp-relay=true`)
            }
        } else if (proxy.Type === 'trojan') {
            row.push(`${proxy.Name} = trojan`)
            row.push(proxy.ServerAddress)
            row.push(`${proxy.ServerPort}`)
            row.push(`password=${proxy.Password}`)
            if (proxy.ServerName) {
                row.push(`sni=${proxy.ServerName}`)
            }
            if (proxy.AllowInsecure) {
                row.push(`skip-cert-verify=${proxy.AllowInsecure}`)
            }
        } else {
            throw new ConvertError(`unknown type: ${proxy.Type}`).WithTarget('surge').WithData(proxy)
        }
        result.push(row.join(', '))
    }
    return result.join('\n')
}
