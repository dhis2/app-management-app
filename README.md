# DHIS 2 App Management App #

The app management app is a core DHIS2 app responsible for managing web apps. It provides the
ability to upload and uninstall apps, as well as installing apps directly from the
[DHIS 2 App Store](https://www.dhis2.org/appstore).

## Getting started

The dependencies of the app are managed by `npm`. Working on the app requires cloning the
repository and installing the dependencies:

```bash
git clone https://github.com/dhis2/app-management-app.git
cd app-management-app
npm install
```

You may also need to install `webpack` and `webpack-dev-server` globally if you haven't
done so previously:

`npm install -g webpack webpack-dev-server`

Finally you will need to add a development manifest named `dev_manifest.webapp` in order to
run the app locally. This manifest will be used by the app to determine the location of the
DHIS 2 API you wish to work with.

Your `dev_manifest.webapp` file might look something like this:

```json
{
  "activities": {
    "dhis": {
      "href": "https://localhost:8080"
    }
  }
}
```

When running in a development environment, the app will try to load `dev-jquery-auth.js`
from the root folder. This file can be used to provide credentials for authenticating
against the DHIS2 API. For example, it might look something like this:

```js
jQuery.ajaxSetup({
    headers: {
        Authorization: 'Basic ' + btoa('admin:district'),
    },
});
```

Once this is in place, you should be able to run the app using the Webpack development
server. By default the app will run on `http://localhost:8081`, but you can override that
on the command line:

```bash
webpack-dev-server --port 1234
```