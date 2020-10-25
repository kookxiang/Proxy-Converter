import YAML from 'yaml'

const YamlKeys = ['proxies', 'Proxies', 'proxy', 'Proxy']

export default function GetProxyListFromYaml(content: string): any[] {
    const data = YAML.parse(content)
    for (const key of YamlKeys) {
        if (Array.isArray(data[key])) {
            return data[key]
        }
    }
    throw new Error('cannot find proxy list.')
}
