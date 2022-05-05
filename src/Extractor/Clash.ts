import YAML from 'yaml'
import { ConvertError } from '../Error'
import { ProxyServer, ShadowsocksProxyServer, ShadowsocksRProxyServer, TrojanProxyServer, VmessProxyServer } from "../ProxyServer"

const PossibleKeys = ['proxies', 'Proxies', 'proxy', 'Proxy']

export default function GetProxyListFromClash(content: string): ProxyServer[] {
    content = content.split('\n').filter(x => !x.match(/^\s*#/)).join('\n')
    const data = YAML.parse(content, { prettyErrors: true })
    if (!data) {
        throw new ConvertError('parse yaml failed').WithSource('clash').WithContent(content)
    }
    let dataList = []
    for (const key of PossibleKeys) {
        if (Array.isArray(data[key])) {
            dataList = data[key]
            break
        }
    }
    if (!dataList.length) {
        throw new ConvertError('cannot find proxy list').WithSource('clash').WithContent(content)
    }
    return dataList.map((config: any) => {
        if (config.type === 'vmess') {
            const proxy: VmessProxyServer = {
                Cipher: config.cipher || 'auto',
                ClientAlterID: config.alterId || 0,
                ClientID: config.uuid,
                Name: config.name,
                ServerAddress: config.server,
                ServerPort: config.port,
                SupportUDP: config.udp,
                Transport: config.network || 'tcp',
                TransportSecurity: config.tls ? 'tls' : 'none',
                Type: 'vmess',
            }
            if (proxy.Transport === 'ws' && config['ws-path']) {
                proxy.WebSocketPath = config['ws-path']
            }
            if (proxy.Transport === 'ws' && config['ws-headers']) {
                proxy.WebSocketHost = config['ws-headers']?.Host ?? config['ws-headers']?.host
            }
            return proxy
        } else if (config.type === 'ss') {
            const proxy: ShadowsocksProxyServer = {
                Cipher: config.cipher,
                Name: config.name,
                Password: config.password,
                ServerAddress: config.server,
                ServerPort: config.port,
                Type: 'ss',
                SupportUDP: config.udp,
            }
            return proxy
        } else if (config.type === 'ssr') {
            const proxy: ShadowsocksRProxyServer = {
                Cipher: config.cipher,
                Name: config.name,
                Obfs: config.obfs,
                ObfsParams: config['obfs-param'],
                Password: config.password,
                Protocol: config.protocol,
                ProtocolParams: config['protocol-param'],
                ServerAddress: config.server,
                ServerPort: config.port,
                SupportUDP: config.udp,
                Type: 'ssr',
            }
            return proxy
        } else if (config.type === 'trojan') {
            const proxy: TrojanProxyServer = {
                AllowInsecure: config['skip-cert-verify'],
                Name: config.name,
                Password: config.password,
                ServerAddress: config.server,
                ServerName: config.sni,
                ServerPort: config.port,
                SupportUDP: config.udp,
                Type: 'trojan',
            }
            return proxy
        } else {
            throw new ConvertError(`unknown type: ${config.type}`).WithSource('clash').WithData(config)
        }
    })
}
