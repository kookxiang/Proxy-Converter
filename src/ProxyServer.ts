interface CommonConfig {
    Name: string,
    Type: string,
}

export interface VmessProxyServer extends CommonConfig {
    Type: 'vmess',
    ClientID: string,
    ClientAlterID: number,

    Cipher: 'aes-128-gcm' | 'chacha20-poly1305' | 'auto' | 'none',

    ServerAddress: string,
    ServerPort: number,
    SupportUDP?: boolean,

    Transport: 'tcp' | 'kcp' | 'ws' | 'http' | 'domainsocket' | 'quic',
    TransportSecurity: 'none' | 'tls',

    // TLS Support
    ServerName?: string,

    // WebSocket Support
    WebSocketPath?: string,
    WebSocketHost?: string,
}

export interface ShadowsocksProxyServer extends CommonConfig {
    Type: 'ss',
    ServerAddress: string,
    ServerPort: number,
    Password: string,
    Cipher: 'chacha20-ietf-poly1305' | 'aes-256-gcm' | string,
    SupportUDP?: boolean,
    Timeout?: number,
}

export interface ShadowsocksRProxyServer extends Omit<ShadowsocksProxyServer, 'Type'> {
    Type: 'ssr',
    Protocol: string,
    ProtocolParams?: string,
    Obfs: string,
    ObfsParams?: string,
}

export interface TrojanProxyServer extends CommonConfig {
    Type: 'trojan',
    AllowInsecure?: boolean;
    Password: string,
    ServerAddress: string,
    ServerName?: string,
    ServerPort: number,
    SupportUDP?: boolean,
}

export type ProxyServer = VmessProxyServer | ShadowsocksProxyServer | ShadowsocksRProxyServer | TrojanProxyServer
