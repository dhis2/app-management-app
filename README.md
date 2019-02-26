# DHIS 2 App Management App [![Build Status](https://travis-ci.com/dhis2/app-management-app.svg?branch=master)](https://travis-ci.com/dhis2/app-management-app) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fapp-management-app.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fapp-management-app?ref=badge_shield)
#

The app management app is a core DHIS2 app responsible for managing web apps. It provides the
ability to upload and uninstall apps, as well as installing apps directly from the
[DHIS 2 App Store](https://play.dhis2.org/appstore).


## Getting started

The dependencies of the app are managed by `npm` or `yarn` (recommended). Working on the app requires cloning the
repository and installing the dependencies:

```bash
> git clone https://github.com/dhis2/app-management-app.git
> cd app-management-app
> yarn install
```

Once dependencies are installed, you can run the app locally using yarn (or npm):

```bash
> yarn start
```

By default app will be available on [localhost:8081](http://localhost:8081), and it will attempt to connect to the DHIS2 API on [localhost:8080/dhis](http://localhost:8080/dhis). To change these defaults, create a file called `$DHIS2_HOME/config.js` with the following format:

```javascript
module.exports = {
  baseUrl: 'http://localhost:8080/dhis',
  authentication: 'Basic YWRtaW46ZGlzdHJpY3Q=',
};
```

Where the basic authentication string is a simple base64-encoded version of the string `user:password`. For example:

```javascript
btoa('admin:district'); // returns "YWRtaW46ZGlzdHJpY3Q="
```


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fapp-management-app.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fapp-management-app?ref=badge_large)
