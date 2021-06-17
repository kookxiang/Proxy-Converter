import { ProxyServer } from "../ProxyServer";

export async function ResolveDNS(domain: string, type: 'A' | 'AAAA' = 'A') {
    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}&ct=application/dns-json`);
    const result = await response.json();
    return (result?.Answer || []).pop()?.data ?? domain;
}

export async function ResolveDNSForProxy(server: ProxyServer) {
    server.ServerAddress = await ResolveDNS(server.ServerAddress)
}
