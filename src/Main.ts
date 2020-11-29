import https from 'https'
import GetProxyListFromBase64 from './Extractor/Base64'
import GetProxyListFromClash from './Extractor/Clash'
import FormatProxyForClash from './Formatter/Clash'
import FormatProxyForSurge from './Formatter/Surge'
import { ProxyServer } from './ProxyServer'

async function FetchSubscription(url: string, timeout = 3000): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout }, (req) => {
            let body = ''
            req.on('data', (data) => body += data)
            req.on('error', (e) => reject(e))
            req.on('end', () => resolve(body))
        })
    })
}

function asArray<T>(source: T | T[]) : T[] {
    if (Array.isArray(source)) {
        return source
    }
    if (source) {
        return [source]
    }
    return []
}

export async function handler(request: any, response: any) {
    const { debug, filter, exempt, url, from = 'clash', to = 'clash' } = request.queries

    response.setHeader('Content-Type', 'text/plain; charset=utf-8')

    if (!url) {
        response.setStatusCode(500)
        response.send('url is required')
        return
    }

    let data

    try {
        if (debug) {
            console.log(`subscription: ${url}`)
        }
        console.time('fetch subscription')
        data = await FetchSubscription(url)
    } catch (e) {
        console.error(e)
        response.setStatusCode(500)
        response.send(e.message)
        console.timeEnd('fetch subscription')
        return
    }

    console.timeEnd('fetch subscription')

    try {
        // import proxy from subscription
        let proxies: ProxyServer[]
        switch (from) {
            case 'yaml':
            case 'clash':
                proxies = GetProxyListFromClash(data)
                break
            case 'base64':
                proxies = GetProxyListFromBase64(data)
                break
            default:
                response.setStatusCode(500)
                response.send(`${from} is not supported`)
                return
        }

        // filter proxy list
        const count = proxies.length
        if (filter) {
            proxies = proxies.filter(({ Name }) => Name.match(new RegExp(asArray(filter).join('|'))))
        }
        if (exempt) {
            proxies = proxies.filter(({ Name }) => !Name.match(new RegExp(asArray(exempt).join('|'))))
        }
        console.log(`apply filter: ${proxies.length} / ${count} left`)
        proxies.sort((a, b) => a.Name.localeCompare(b.Name))

        // output
        switch (to) {
            case 'clash':
                response.send(FormatProxyForClash(proxies))
                break
            case 'surge':
                response.send(FormatProxyForSurge(proxies))
                break
            default:
                response.setStatusCode(500)
                response.send(`${to} is not supported`)
        }
    } catch (e) {
        console.error(e)
        response.setStatusCode(500)
        response.send(e.message)
    }
}
