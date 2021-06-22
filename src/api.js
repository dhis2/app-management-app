import { useConfig } from '@dhis2/app-runtime'

class Api {
    constructor({ baseUrl }) {
        this.baseUrl = baseUrl
    }

    request = ({ url, method, body }) =>
        fetch(`${this.baseUrl}/api/${url}`, {
            method,
            body,
            credentials: 'include',
        }).then(res => {
            if (res.status < 200 || res.status >= 300) {
                throw new Error(res.statusText)
            }
            return res
        })

    installVersion = versionId =>
        this.request({
            url: `appHub/${versionId}`,
            method: 'post',
        })

    uninstallApp = appKey =>
        this.request({
            url: `apps/${appKey}`,
            method: 'delete',
        })

    uploadApp = file => {
        const data = new FormData()
        data.append('file', file)
        return this.request({
            url: 'apps',
            method: 'post',
            body: data,
        })
    }
}

export const useApi = () => {
    const { baseUrl } = useConfig()
    return new Api({ baseUrl })
}
