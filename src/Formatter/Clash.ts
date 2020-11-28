import YAML from 'yaml'
import { ProxyServer, ShadowsocksProxyServer, VmessProxyServer } from '../ProxyServer'

export default function FormatProxyForClash(ProxyList: ProxyServer[]): string {
    const proxies: any[] = [];
    for (let proxy of ProxyList) {
        const config: any = {};
        if (proxy.Type === 'vmess') {
            proxy = proxy as VmessProxyServer
            config.name = proxy.Name
            config.type = 'vmess'
            config.server = proxy.ServerAddress
            config.port = proxy.ServerPort
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
        } else if (proxy.Type === 'ss') {
            proxy = proxy as ShadowsocksProxyServer
            config.name = proxy.Name
            config.type = 'ss'
            config.server = proxy.ServerAddress
            config.port = proxy.ServerPort
            config.cipher = proxy.Cipher
            config.password = proxy.Password
            config.udp = proxy.SupportUDP
        } else {
            throw new Error(`unknown type: ${proxy.Type}`)
        }
        proxies.push(config);
    }
    return YAML.stringify({ proxies })
}
