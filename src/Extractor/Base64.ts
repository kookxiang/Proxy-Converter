import * as Base64 from 'js-base64'
import { ConvertError } from '../Error'
import { ProxyServer, ShadowsocksProxyServer, ShadowsocksRProxyServer, TrojanProxyServer, VmessProxyServer } from "../ProxyServer"

export default function GetProxyListFromBase64(content: string): ProxyServer[] {
    const data = Base64.decode(content).split('\n')
    if (!data?.length) {
        throw new ConvertError('cannot find proxy list.').WithSource('base64').WithContent(content)
    }
    return data.map(x => x.trim()).filter(Boolean).map((line: string) => {
        if (line.startsWith('vmess://')) {
            return GetProxyFromVmessURL(line.replace('vmess://', ''))
        }
        const url = new URL(line)
        const protocol = line.split('://')[0]
        if (protocol === 'ss') {
            return GetProxyFromShadowsocksURL(line.replace('ss://', ''))
        } else if (protocol === 'ssr') {
            return GetProxyFromShadowsocksRURL(line.replace('ssr://', ''))
        } else if (protocol === 'trojan') {
            return GetProxyFromTrojanURL(url)
        } else {
            throw new ConvertError(`unsupported protocol: ${protocol}`).WithSource('base64').WithData(line)
        }
    })
}

function GetProxyFromVmessURL(data: string): VmessProxyServer {
    const config = JSON.parse(Base64.decode(data))
    if (+config.v !== 2) {
        throw new ConvertError(`unsupported vmess version: ${config.v}`).WithSource('base64').WithData(data)
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
    if (result.Transport === 'ws') {
        result.WebSocketPath = config['ws-path'] || config['path'] || '/'
    }
    if (result.Transport === 'ws' && config.host) {
        result.WebSocketHost = config.host
    }
    return result
}

function GetProxyFromShadowsocksURL(data: string): ShadowsocksProxyServer | ShadowsocksRProxyServer {
    const url = new URL(`ss://${data}`)
    if (url.username && url.password) {
        const result: ShadowsocksProxyServer = {
            Cipher: url.username,
            Name: decodeURIComponent(url.hash?.replace(/^#/, '')) || url.host,
            Password: url.password,
            ServerAddress: url.hostname,
            ServerPort: +url.port,
            SupportUDP: true,
            Type: 'ss',
        }
        return result
    } if (url.username) {
        return GetProxyFromShadowsocksURL(data.replace(url.username, Base64.decode(url.username)))
    } else {
        let decoded: string;
        if (data.includes('#')) {
            const [dataWithoutRemarks, remarks] = data.split('#')
            decoded = `${Base64.decode(dataWithoutRemarks)}#${remarks}`
        } else {
            decoded = Base64.decode(data)
        }
        if (decoded.match(/:/g)?.length === 5) {
            return GetProxyFromShadowsocksRURL(decoded)
        }
        return GetProxyFromShadowsocksURL(decoded)
    }
}

function GetProxyFromShadowsocksRURL(base64Data: string): ShadowsocksRProxyServer {
    const [prefix, suffix] = Base64.decode(base64Data).split('/')
    const [password, obfs, method, protocol, port, ...others] = prefix.split(':').reverse()
    const host = others.reverse().join(':')
    const params = new URLSearchParams(suffix)
    const result: ShadowsocksRProxyServer = {
        Cipher: method,
        Name: params.get('remarks') ? Base64.decode(params.get('remarks')) : `${host}:${port}`,
        Obfs: obfs,
        Password: Base64.decode(password),
        Protocol: protocol,
        ServerAddress: host,
        ServerPort: +port,
        SupportUDP: true,
        Type: 'ssr',
    }
    if (params.has('obfsparam')) {
        result.ObfsParams = autoDecodeBase64(params.get('obfsparam'))
    }
    if (params.has('protoparam')) {
        result.ProtocolParams = autoDecodeBase64(params.get('protoparam'))
    }
    return result
}

function GetProxyFromTrojanURL(url: URL): TrojanProxyServer {
    const name = decodeURIComponent(url.hash ?? '').replace(/^#/, '')
    const allowInsecure = url.searchParams.get('allowInsecure')
    return {
        Name: name || url.host,
        Password: url.username,
        ServerAddress: url.hostname,
        ServerName: url.searchParams.get('sni') ?? url.searchParams.get('peer'),
        ServerPort: Number(url.port),
        Type: 'trojan',
        AllowInsecure: ['false', '0'].includes(allowInsecure) ? false : !!allowInsecure,
    }
}

function autoDecodeBase64(source: string) {
    if (source.match(/^[A-Za-z0-9+/=]+$/)) {
        try {
            return Base64.decode(source)
        } catch (e) {
            // ignored
        }
    }
    return source
}