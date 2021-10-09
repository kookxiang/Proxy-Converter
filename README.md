# Proxy Converter

![Deploy](https://github.com/kookxiang/Proxy-Converter/workflows/Deploy/badge.svg?branch=master)

> 某不知名的订阅转换工具
>
> 服务地址: https://kookxiang.dev/proxy/convert
>
> 使用方法：用新链接替换原有订阅链接

使用向导: https://kookxiang.dev/proxy/convert

## 基本参数

 - `url`: 需要转换的订阅链接
 - `from`: 原始订阅链接格式，目前支持 `clash`（默认）/ `base64`
 - `to`: 需要转换成的格式，目前支持 `clash` / `surge` / `base64`

注：拼接参数时需要对特殊字符进行 URL Encode，最终链接如:

```
https://kookxiang.dev/proxy/convert/?url=https%3A%2F%2Fexample.com%2Fclash%3Fquery&from=clash&to=clash
```

## 高级参数

### exempt

排除节点（节点名过滤）

本参数支持添加多个，效果叠加

```
...&exempt=US&exempt=CN
```

### filter

只返回需要的节点（节点名过滤）

本参数支持添加多个，效果叠加

```
...&filter=HK&filter=TW
```

### resolve

云端执行 DNS 解析，用于应对极端情况下 DNS 污染导致的不可用

```
...&resolve
```
