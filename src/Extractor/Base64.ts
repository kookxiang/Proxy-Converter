import { URL } from "url"

export default function GetProxyListFromBase64(content: string): any[] {
    const data = Buffer.from(content, 'base64').toString().split('\n')
    if (!data?.length) {
        throw new Error('cannot find proxy list.')
    }
    return data.filter(Boolean).map((line: string) => {
        const url = new URL(line.trim())
        const protocol = url.protocol.replace(/:$/, '')
        if (protocol === 'vmess') {
            return GetProxyFromVmessURL(url)
        } else {
            throw new Error(`unsupported protocol: ${protocol}`)
        }
    })
}

function GetProxyFromVmessURL(url: URL): any {
    const config = JSON.parse(Buffer.from(url.host, 'base64').toString())
    if (+config.v !== 2) {
        throw new Error(`unsupported vmess version: ${config.v}`)
    }
    const result: any = {
        name: config.ps,
        type: 'vmess',
        server: config.add,
        port: config.port,
        uuid: config.id,
        alterId: config.aid,
        cipher: config.type,
        udp: true,
        network: config.net,
        'ws-path': config.path,
    }
    if (config.tls) {
        result.tls = true
    }
    if (config.net === 'ws' && config.host) {
        result['ws-headers'] = { Host: config.host }
    }
    return result
}
