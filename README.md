# Proxy Converter

![Deploy](https://github.com/kookxiang/Proxy-Converter/workflows/Deploy/badge.svg?branch=master)

> 某不知名的订阅转换工具
>
> 服务地址: https://clash-converter.kookxiang.workers.dev
>
> 使用方法：用新链接替换原有订阅链接

## 基本参数

 - `url`: 需要转换的订阅链接
 - `from`: 原始订阅链接格式，目前支持 `clash`（默认）/ `base64`
 - `to`: 需要转换成的格式，目前支持 `clash` / `surge`

注：拼接参数时需要对特殊字符进行 URL Encode，最终链接如:

```
https://clash-converter.kookxiang.workers.dev/?url=https%3A%2F%2Fexample.com%2Fclash%3Fquery&from=clash&to=clash
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

### debug

没卵用的 debug 模式

目前唯一的功能是将订阅地址信息记录到日志中方便排查（默认不会记录）
