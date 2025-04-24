export const getAppIconSrc = (app) => {
    const iconSize = ['128', '48', '16'].find(
        (iconSize) => iconSize in app.icons
    )
    if (iconSize) {
        return app.icons[iconSize]
    }
    return null
}
