import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'

class Api {
    constructor({ baseUrl }) {
        this.baseUrl = baseUrl
    }

    request = ({ url, method, body }) =>
        fetch(`${this.baseUrl}/api/${url}`, {
            method,
            body,
            credentials: 'include',
            redirect: 'manual',
        }).then(async (res) => {
            if (res.type === 'opaqueredirect') {
                throw {
                    message: i18n.t(
                        'Your session has expired. Please refresh the page and login before trying again.'
                    ),
                }
            }
            if (res.status < 200 || res.status >= 300) {
                const errorBody = await res.json()
                throw errorBody
            }
            return res
        })

    installVersion = (versionId) =>
        this.request({
            url: `appHub/${versionId}`,
            method: 'post',
        })

    uninstallApp = (appKey) =>
        this.request({
            url: `apps/${appKey}`,
            method: 'delete',
        })

    uploadApp = (file) => {
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
