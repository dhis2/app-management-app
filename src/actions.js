function installAppVersion(versionId, d2) {
    const api = d2.Api.getApi()
    return new Promise((resolve, reject) => {
        api.post(['appHub', versionId].join('/'), '', { dataType: 'text' })
            .then(() => {
                resolve()
            })
            .catch(err => {
                reject(err)
            })
    })
}
