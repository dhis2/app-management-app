> **Caution**
>
> This section is deprecated and is NOT recommended for new
> applications.
>
> Please see [DHIS2 App Platform](https://platform.dhis2.nu/#/) for the
> up-to-date way to build a DHIS2 Web App.

# Apps { #apps }

A packaged app is an [Open Web
App](https://developer.mozilla.org/en-US/docs/Open_Web_apps_and_Web_standards)
that has all of its resources (HTML, CSS, JavaScript, app manifest, and
so on) contained in a zip file. It can be uploaded to a DHIS2
installation directly through the user interface at runtime. A packaged
app is a ZIP file with an [app
manifest](http://www.w3.org/2008/webapps/manifest/) in its root
directory. The manifest must be named `manifest.webapp`. A throrough
description of apps can be obtained
[here](https://developer.mozilla.org/en-US/Apps/Quickstart).

## Purpose of packaged Apps { #apps_purpose_packaged_apps }

The purpose of packaged apps is to extend the web interface of DHIS2,
without the need to modify the source code of DHIS2 itself. A system
deployment will often have custom and unique requirements. The apps
provide a convenient extension point to the user interface. Through
apps, you can complement and customize the DHIS2 core functionality with
custom solutions in a loosely coupled and clean manner.

Apps do not have permissions to interact directly with DHIS2 Java API.
Instead, apps are expected to use functionality and interact with the
DHIS2 services and data by utilizing the DHIS2 Web API.

## Creating Apps { #apps_creating_apps }

DHIS2 apps are constructed with HTML, JavaScript and CSS files, similar
to any other web application. Apps also need a special file called
_manifest.webapp_ which describes the contents of the app. A basic
example of the _manifest.webapp_ is shown below:

    {
        "version": "0.1",
        "name": "My App",
        "description": "My App is a Packaged App",
        "launch_path": "/index.html",
        "appType": "APP",
        "icons": {
            "16": "/img/icons/mortar-16.png",
            "48": "/img/icons/mortar-48.png",
            "128": "/img/icons/mortar-128.png"
        },
        "developer": {
            "name": "Me",
            "url": "http://me.com"
        },
        "default_locale": "en",
        "activities": {
            "dhis": {
                "href": "*",
                "namespace": "my-namespace"
            }
        },
        "authorities": [
             "MY_APP_ADD_NEW",
             "MY_APP_UPDATE",
             "MY_APP_DELETE"
        }
    }

The _manifest.webapp_ file must be located at the root of the project.
Among the properties are:

-   The _icons→48_ property is used for the icon that is displayed on
    the list of apps that are installed on a DHIS2 instance.

-   The _activities_ property is an dhis-specific extension meant to
    differentiate between a standard Open Web App and an app that can be
    installed in DHIS2.

-   The _authorities_ property contains a list of DHIS2 authorities
    which can be used to restrict users from certain actions on the
    current app. This list will be loaded into DHIS2 during app
    installation process and available for selecting in User Role
    management form.

-   The \*\** value for *href* is converted to the appropriate URL when
    the app is uploaded and installed in DHIS2. This value can then be
    used by the application's JavaScript and HTML files to make calls to
    the DHIS2 Web API and identify the correct location of DHIS2 server
    on which the app has been installed. To clarify, the *activities\*
    part will look similar to this after the app has been installed:

<!-- end list -->

    "activities": {
        "dhis": {
            "href": "http://apps.dhis2.org/demo",
            "namespace": "my-namespace"
        }
     }

-   A _settings_ property is optional, and can be used on a dashboard
    widget app to suppress showing the widget title when the widget is
    displayed on a dashboard:

<!-- end list -->

    "settings": {
        "dashboardWidget": {
            "hideTitle": true
        }
    }

The namespace property can be added if your app is utilizing the
dataStore or userDataStore api. When adding the namespace property, only
users with access to your app are allowed to make changes to the
namespace. A namespace can only be reserved in this way once. If another
app tries to reserve a namespace already in use, the installation of the
other app will fail.

If you have a collection of apps that want to share the same namespace,
but also wish to reserve it, the users of the apps needs to have the
authority to use the app that initially reserved the namespace.

> **Note**
>
> Namespaces will not be created until atleast one key-value pair is
> present in the namespace. Specifying a namespace in the manifest only
> restricts the access and does not create any data in the namespace.

The _appType_ property specifies how the app will be displayed by the
DHIS2 instance. The possible values for appType and their effects are
explained in the following table.

Table: App types

| App type                 | Description                                                                                                                                               |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APP                      | Will be listed in the "apps" menu                                                                                                                         |
| DASHBOARD_WIDGET         | Available from the search box on the dashboard, can be added as an item on any dashboard                                                                  |
| TRACKER_DASHBOARD_WIDGET | Can be embedded in the tracker dashboard _(this type is not yet supported)_                                                                               |
| RESOURCE                 | Resource apps are packages that can be shared by multiple other apps. These apps are not shown anywhere in the UI, except from in the app management app. |

If no _appType_ is specified in the manifest, the system will use "APP"
by default.

To read the JSON structure into JavaScript, you can use a regular AJAX
request and parse the JSON into an object. Most Javascript libraries
provide some support, for instance with jQuery it can be done like this:

    $.getJSON( "manifest.webapp", function( json ) {
        var apiBaseUrl = json.activities.dhis.href + "/api";
    } );

The app can contain HTML, JavaScript, CSS, images and other files which
may be required to support it . The file structure could look something
like this:

    /
    /manifest.webapp    #manifest file (mandatory)
    /css/               #css stylesheets (optional)
    /img/               #images (optional)
    /js/                #javascripts (optional)

> **Note**
>
> It is only the `manifest.webapp` file which must be placed in the
> root. It is up the developer to organize CSS, images and JavaScript
> files inside the app as needed.

All the files in the project should be compressed into a standard zip
archive. Note that the manifest.webapp file must be located on the root
of the zip archive (do not include a parent directory in the archive).
The zip archive can then be installed into DHIS2 as you will see in the
next section.
