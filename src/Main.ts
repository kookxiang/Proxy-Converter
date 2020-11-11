import https from 'https'
import YAML from 'yaml'
import GetProxyListFromBase64 from './Extractor/Base64'
import GetProxyListFromYaml from './Extractor/Yaml'


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
    const { debug, filter, exempt, source, type = 'yaml' } = request.queries

    response.setHeader('Content-Type', 'text/plain; charset=utf-8')

    if (!source) {
        response.setStatusCode(500)
        response.send('source is required')
        return
    }

    let data;

    try {
        if (debug) {
            console.log(`subscription: ${source}`)
        }
        console.time('fetch subscription')
        data = await FetchSubscription(source)
    } catch (e) {
        console.error(e)
        response.setStatusCode(500)
        response.send(e.message)
        console.timeEnd('fetch subscription')
        return;
    }

    console.timeEnd('fetch subscription')

    try {
        let proxies: any[];
        switch (type) {
            case 'yaml':
                proxies = GetProxyListFromYaml(data)
                break
            case 'base64':
                proxies = GetProxyListFromBase64(data)
                break
            default:
                response.setStatusCode(500)
                response.send('type is not supported')
                return
        }

        const count = proxies.length
        if (filter) {
            proxies = proxies.filter(({ name }) => name.match(new RegExp(asArray(filter).join('|'))))
        }
        if (exempt) {
            proxies = proxies.filter(({ name }) => !name.match(new RegExp(asArray(exempt).join('|'))))
        }
        console.log(`apply filter: ${proxies.length} / ${count} left`)
        if ('sort' in request.queries) {
            proxies.sort((a, b) => a.name.localeCompare(b.name))
        }
        response.send(YAML.stringify({ proxies }))
    } catch (e) {
        console.error(e)
        response.setStatusCode(500)
        response.send(e.message)
    }
}
