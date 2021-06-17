import { decode } from 'js-base64';
import { ConvertError } from '../Error';
import { ProxyServer, ShadowsocksProxyServer, ShadowsocksRProxyServer, TrojanProxyServer, VmessProxyServer } from "../ProxyServer";

export default function GetProxyListFromBase64(content: string): ProxyServer[] {
    const data = decode(content).split('\n')
    if (!data?.length) {
        throw new ConvertError('cannot find proxy list.').WithSource('base64').WithContent(content)
    }
    return data.map(x => x.trim()).filter(Boolean).map((line: string) => {
        if (line.startsWith('vmess://')) {
            return GetProxyFromVmessURL(line.replace('vmess://', ''))
        }
        const url = new URL(line)
        const protocol = url.protocol.replace(/:$/, '')
        if (protocol === 'ss') {
            return GetProxyFromShadowsocksURL(url)
        } else if (protocol === 'ssr') {
            return GetProxyFromShadowsocksRURL(url)
        } else if (protocol === 'trojan') {
            return GetProxyFromTrojanURL(url)
        } else {
            throw new ConvertError(`unsupported protocol: ${protocol}`).WithSource('base64').WithData(line)
        }
    })
}

function GetProxyFromVmessURL(data: string): VmessProxyServer {
    const config = JSON.parse(decode(data))
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
            Name: decodeURIComponent(url.hash?.replace(/^#/, '')) || url.host,
            Password: url.password,
            ServerAddress: url.hostname,
            ServerPort: +url.port,
            Type: 'ss',
        }
        return result
    } if (url.username) {
        [url.username, url.password] = decode(url.username).split(':')
        return GetProxyFromShadowsocksURL(url)
    } else {
        const decoded = decode(url.host)
        if (decoded.match(/:/g)?.length === 5) {
            return GetProxyFromShadowsocksRURL(url)
        }
        const raw = new URL(`ss://${decoded}`)
        const result: ShadowsocksProxyServer = {
            Cipher: raw.username,
            Name: decodeURIComponent(url.hash?.replace(/^#/, '')) || url.host,
            Password: raw.password,
            ServerAddress: raw.hostname,
            ServerPort: +raw.port,
            Type: 'ss',
        }
        return result
    }
}

function GetProxyFromShadowsocksRURL(url: URL): ShadowsocksRProxyServer {
    const [prefix, suffix] = decode(url.host).split('/')
    const [host, port, protocol, method, obfs, password] = prefix.split(':')
    const params = new URLSearchParams(suffix)
    const result: ShadowsocksRProxyServer = {
        Cipher: method,
        Name: params.get('remarks') ?? `${host}:${port}`,
        Obfs: obfs,
        Password: decode(password),
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

function GetProxyFromTrojanURL(url: URL): TrojanProxyServer {
    const name = decodeURIComponent(url.hash ?? '').replace(/^#/, '');
    return {
        Name: name || url.host,
        Password: url.username,
        ServerAddress: url.hostname,
        ServerName: url.searchParams.get('sni') ?? url.searchParams.get('peer'),
        ServerPort: Number(url.port),
        Type: 'trojan',
    };
}
