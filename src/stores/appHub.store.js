import Store from 'd2-ui/lib/store/Store'

const store = Store.create()

function getAppFromVersionId(versionId) {
    for (let i = 0; i < store.getState().apps.length; i++) {
        const app = store.getState().apps[i]
        for (let j = 0; j < app.versions.length; j++) {
            if (app.versions[j].id === versionId) {
                app.version = app.versions[j]
                return app
            }
        }
    }

    return null
}

store.getAppFromVersionId = getAppFromVersionId

export default store
