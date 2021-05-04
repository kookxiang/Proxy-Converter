export class ConvertError extends Error {
    Source?: string;
    Target?: string;

    URL?: any;
    Data?: any;
    Content?: any;

    WithSource(source: any) {
        this.Source = source;
        return this;
    }

    WithTarget(target: any) {
        this.Target = target;
        return this;
    }

    WithURL(url: string) {
        this.URL = url;
        return this;
    }

    WithContent(content: any) {
        this.Content = content;
        return this;
    }

    WithData(data: any) {
        this.Data = data;
        return this;
    }
}