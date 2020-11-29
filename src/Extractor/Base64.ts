import { URL, URLSearchParams } from "url"
import { ProxyServer, ShadowsocksProxyServer, ShadowsocksRProxyServer, VmessProxyServer } from "../ProxyServer"

export default function GetProxyListFromBase64(content: string): ProxyServer[] {
    const data = Buffer.from(content, 'base64').toString().split('\n')
    if (!data?.length) {
        throw new Error('cannot find proxy list.')
    }
    return data.filter(Boolean).map((line: string) => {
        const url = new URL(line.trim())
        const protocol = url.protocol.replace(/:$/, '')
        if (protocol === 'vmess') {
            return GetProxyFromVmessURL(url)
        } else if (protocol === 'ss') {
            return GetProxyFromShadowsocksURL(url)
        } else if (protocol === 'ssr') {
            return GetProxyFromShadowsocksRURL(url)
        } else {
            throw new Error(`unsupported protocol: ${protocol}`)
        }
    })
}

function GetProxyFromVmessURL(url: URL): VmessProxyServer {
    const config = JSON.parse(Buffer.from(url.host, 'base64').toString())
    if (+config.v !== 2) {
        throw new Error(`unsupported vmess version: ${config.v}`)
    }
    const result: VmessProxyServer = {
        Cipher: config.type || 'auto',
        ClientAlterID: config.aid ? +config.aid : 0,
        ClientID: config.id,
        Name: config.ps,
        ServerAddress: config.add,
        ServerPort: config.port,
        SupportUDP: true,
        Transport: config.net || 'tcp',
        TransportSecurity: config.tls ? 'tls' : 'none',
        Type: "vmess",
    }
    if (result.Transport === 'ws' && 'ws-path' in config) {
        result.WebSocketPath = config['ws-path'] || '/'
    }
    if (result.Transport === 'ws' && config.host) {
        result.WebSocketHost = config.host
    }
    return result
}

function GetProxyFromShadowsocksURL(url: URL): ShadowsocksProxyServer {
    if (url.username && url.password) {
        const result: ShadowsocksProxyServer = {
            Cipher: url.username,
            Name: url.hash?.replace(/^#/, '') || url.host,
            Password: url.password,
            ServerAddress: url.hostname,
            ServerPort: +url.port,
            Type: 'ss',
        }
        return result
    } else {
        const decoded = Buffer.from(url.host, 'base64').toString()
        if (decoded.match(/:/g)?.length === 5) {
            return GetProxyFromShadowsocksRURL(url)
        }
        const raw = new URL(`ss://${decoded}`)
        const result: ShadowsocksProxyServer = {
            Cipher: raw.username,
            Name: url.hash?.replace(/^#/, '') || raw.host,
            Password: raw.password,
            ServerAddress: raw.hostname,
            ServerPort: +raw.port,
            Type: 'ss',
        }
        return result
    }
}

function GetProxyFromShadowsocksRURL(url: URL): ShadowsocksRProxyServer {
    const decoded = Buffer.from(url.host, 'base64').toString()
    const [prefix, suffix] = decoded.split('/')
    const [host, port, protocol, method, obfs, password] = prefix.split(':')
    const params = new URLSearchParams(suffix)
    const result: ShadowsocksRProxyServer = {
        Cipher: method,
        Name: params.get('remarks') ?? `${host}:${port}`,
        Obfs: obfs,
        Password: Buffer.from(password, 'base64').toString(),
        Protocol: protocol,
        ServerAddress: host,
        ServerPort: +port,
        Type: 'ssr',
    }
    if (params.has('obfsparam')) {
        result.ObfsParams = params.get('obfsparam') as string
    }
    if (params.has('protoparam')) {
        result.ProtocolParams = params.get('protoparam') as string
    }
    return result
}
