import YAML from 'yaml'
import { ConvertError } from '../Error'
import { ProxyServer } from '../ProxyServer'

export default function FormatProxyForClash(ProxyList: ProxyServer[]): string {
    const proxies: any[] = []
    for (let rawProxy of ProxyList) {
        const config: any = {}
        if (rawProxy.Type === 'vmess') {
            let proxy = rawProxy
            config.name = proxy.Name
            config.type = 'vmess'
            config.server = proxy.ServerAddress
            config.port = proxy.ServerPort
            config.cipher = proxy.Cipher
            config.uuid = proxy.ClientID
            config.alterId = proxy.ClientAlterID
            if (proxy.SupportUDP) {
                config.udp = true
            }
            if (proxy.Transport !== 'tcp') {
                config.network = proxy.Transport
            }
            if (proxy.TransportSecurity === 'tls') {
                config.tls = true
            }
            if (proxy.Transport === 'ws' && proxy.WebSocketPath) {
                config['ws-path'] = proxy.WebSocketPath
            }
            if (proxy.Transport === 'ws' && proxy.WebSocketHost) {
                config['ws-headers'] = { Host: proxy.WebSocketHost }
            }
        } else if (rawProxy.Type === 'ss') {
            let proxy = rawProxy
            config.name = proxy.Name
            config.type = 'ss'
            config.server = proxy.ServerAddress
            config.port = proxy.ServerPort
            config.cipher = proxy.Cipher
            config.password = proxy.Password
            if (proxy.SupportUDP) {
                config.udp = true
            }
        } else if (rawProxy.Type === 'ssr') {
            let proxy = rawProxy
            config.cipher = proxy.Cipher
            config.name = proxy.Name
            config.obfs = proxy.Obfs
            if (proxy.ObfsParams) {
                config['obfs-param'] = proxy.ObfsParams
            }
            config.password = proxy.Password
            config.port = proxy.ServerPort
            config.protocol = proxy.Protocol
            if (proxy.ProtocolParams) {
                config['protocol-param'] = proxy.ProtocolParams
            }
            config.server = proxy.ServerAddress
            config.type = 'ssr'
            if (proxy.SupportUDP) {
                config.udp = true
            }
        } else if (rawProxy.Type === 'trojan') {
            let proxy = rawProxy
            config.name = proxy.Name
            config.password = proxy.Password
            config.port = proxy.ServerPort
            config.server = proxy.ServerAddress
            config.type = 'trojan'
            if (proxy.SupportUDP) {
                config.udp = proxy.SupportUDP
            }
            if (proxy.ServerName) {
                config.sni = proxy.ServerName
            }
            if (proxy.AllowInsecure) {
                config['skip-cert-verify'] = proxy.AllowInsecure
            }
        } else {
            throw new ConvertError(`unknown type: ${(rawProxy as any)?.Type}`).WithTarget('clash').WithData(rawProxy)
        }
        proxies.push(config)
    }
    return YAML.stringify({ proxies })
}
