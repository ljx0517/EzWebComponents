export class AbortableFetch {

    private ctrl: AbortController
    private _native: Promise<Response>

    constructor(uri: Request | string, options?: RequestInit) {
        this.ctrl = new AbortController()

        this._native = window.fetch(uri, {
            ...options || {},
            signal: this.ctrl.signal
        })
    }

    then<T>(fn: (res: /*Response*/ any) => any): AbortableFetch {
        this._native = this._native.then(fn)
        return this
    }

    /* eslint-disable @typescript-eslint/no-explicit-any */
    catch(fn: (err: Error) => any): AbortableFetch {
        this._native = this._native.catch((err): any => {
            if (err.name !== 'AbortError') {
                return fn(err)
            }
        })
        return this
    }

    finally(fn: () => void): AbortableFetch {
        this._native = this._native.finally(fn)
        return this
    }

    abort(): void {
        this.ctrl.abort()
    }
}
function cancelableFetch(url: string, requestOptions: RequestInit) {
    return new AbortableFetch(url, requestOptions).then(handleResponse)
}
function handleResponse(response: Response) {
    return response.text().then((text) => {
        const contentType = response.headers.get('content-type');
        let data = null;
        if (contentType.includes('text/')) {
            data = text;
        } else {
            data = text && JSON.parse(text);
        }

        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}
export class HttpClient {
    static get(url: string, params?: {[key: string]: string|number}) : AbortableFetch{
        const requestOptions = {
            method: 'GET',
        };
        const reqUrl = new URL(url, document.baseURI);
        if (params && params.constructor.name === 'Object') {
            Object.keys(params).forEach((k) => {
                reqUrl.searchParams.append(k, `${params[k]}`)
            })
        }
        return cancelableFetch(reqUrl.href, requestOptions);
    }

    static post(url: string, body: {[key: string]: any}) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        return cancelableFetch(url, requestOptions);
    }

    static put(url: string, body: {[key: string]: any}) {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        return cancelableFetch(url, requestOptions);
    }

    static delete(url: string) {
        const requestOptions = {
            method: 'DELETE',
        };
        return cancelableFetch(url, requestOptions);
    }
}
