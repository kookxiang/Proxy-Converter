interface CommonConfig {
    Name: string,
    Type: "vmess" | "ss",
}

export interface VmessProxyServer extends CommonConfig {
    ClientID: string,
    ClientAlterID: number,

    Cipher: "aes-128-gcm" | "chacha20-poly1305" | "auto" | "none",

    ServerAddress: string,
    ServerPort: number,
    SupportUDP?: boolean,

    Transport: "tcp" | "kcp" | "ws" | "http" | "domainsocket" | "quic",
    TransportSecurity: "none" | "tls",

    // TLS Support
    ServerName?: string,

    // WebSocket Support
    WebSocketPath?: string,
    WebSocketHost?: string,
}

export interface ShadowsocksProxyServer extends CommonConfig {
    ServerAddress: string,
    ServerPort: number,
    Password: string,
    Cipher: "chacha20-ietf-poly1305" | "aes-256-gcm" | string,
    SupportUDP?: boolean,
    Timeout?: number,
}

export type ProxyServer = VmessProxyServer | ShadowsocksProxyServer
