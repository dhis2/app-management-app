import Store from 'd2-ui/lib/store/Store'

const store = Store.create()

store.getAppFromKey = appKey => {
    const apps = store.getState()
    for (let i = 0; i < apps.length; i++) {
        if (apps[i].key === appKey) {
            return apps[i]
        }
    }

    return null
}

export default store
