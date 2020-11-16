# 📦🔐 Verdaccio Azure OAuth - With UI Support

An Azure OAuth Plugin for Verdaccio

## About

<img src="screenshots/authorize.png" align="right" width="270"/>

This is a Verdaccio plugin that offers Azure OAuth integration for both the browser and the command line.

### Features

- UI integration with fully functional login and logout. When clicking the login button the user is redirected to GitHub and returns with a working session.
- Updated usage info and working copy-to-clipboard for setup commands.
- A small CLI for quick-and-easy configuration.

### Compatibility

- Verdaccio 3 and 4
- Node >=10
- Chrome, Firefox, Firefox ESR, Edge, Safari, IE 11

## Setup

### Install

```
$ npm install verdaccio-azure-ui
```

### Azure Config

- Create a new app registration in azure: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
- the API permission needs Group.Read.All, User.Read
- create a new Secret
- The callback URL should be `YOUR_REGISTRY_URL/-/oauth/callback`

### Verdaccio Config

Merge the below options with your existing Verdaccio config:

```yml
middlewares:
  azure-ui:
    enabled: true

auth:
  azure-ui:
    tenant: `TENANT ID`
    client-id: `APPLICATION ID`
    client-secret: `APPLICATION SECRET`
    scope: `OPTIONAL API SCOPES`
    allow-groups:
    - a_group # optional list of user groups allowed to authenticate

url_prefix: YOUR_REGISTRY_URL # optional, make sure it is configured as described
```

- The configured values can either be the actual value or the name of an environment variable that contains the value.
- The config props can be specified under either the `middlewares` or the `auth` node. Just make sure, the addon is included under both nodes.

#### `tenant`

Users within this tenant will be able to authenticate.

#### `client-id` and `client-secret`

These values can be obtained from the app registration: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade

#### `scope` (optional)

Requests additional scopes for the user, in case you want to re-use the OpenID bearer token for more use-cases in Verdaccio.

#### `allow-groups` (optional)

User Groups that are allowed to authenticate within this Azure ActiveDirectory.

#### `url_prefix` (optional)

If configured, it must match `YOUR_REGISTRY_URL`. See [GitHub Config](#GitHub-Config).

### Proxy Config

If you are behind a proxy server, the plugin needs to know the proxy server in order to make GitHub requests.

Configure the below environment variable.

```
$ export GLOBAL_AGENT_HTTP_PROXY=http://127.0.0.1:8080
```

See the [global-agent](https://github.com/gajus/global-agent#environment-variables) docs for detailed configuration instructions.

## Login

### Verdaccio UI

- Click the login button and get redirected to Microsoft Login Portal for the tenant..
- Authorize the registry to access your Azure user and tenant info. You only need to do this once. If your tenant is private, make sure to click the <kbd>Request</kbd> or <kbd>Grant</kbd> button to get `read:org` access when prompted to authorize.
- Once completed, you'll be redirected back to the Verdaccio registry.

You are now logged in.

### Command Line

#### Option A) Use the built-in CLI

The easiest way to configure npm is to use this short command:

```
$ npx verdaccio-github-oauth-ui --registry http://localhost:4873
```

#### Option B) Copy commands from the UI

- Verdaccio 4:

Open the "Register Info" dialog and klick "Copy to clipboard":

![](screenshots/register-info.png)

- Verdaccio 3:

Select the text in the header and copy it. In case the text is too long, you can double-click it. The invisible part will still be selected and copied.

![](screenshots/header.png)

- Run the copied commands on your terminal:

```
$ npm config set //localhost:4873:_authToken "SECRET_TOKEN"
$ npm config set //localhost:4873:always-auth true
```

- Verify npm is set up correctly by running the `whoami` command. Example:

```
$ npm whoami --registry http://localhost:4873
Martin Zier
```

If you see your Azure full name, you are ready to start installing and publishing packages.

## Logout

### Verdaccio UI

Click the <kbd>Logout</kbd> button as per usual.

### Command Line

Unless OAuth access is revoked in the Azure settings, the token is valid indefinitely.

### Plugin not detected when installed globally

Verdaccio loads plugins by requiring them but global `node_modules` are NOT searched by the node resolve algorithm. Despite what examples or documentation might be suggesting, globally installed plugins are not supported. Some solutions that worked for others:

- If you are using npm, switch to yarn. yarn installs modules a bit differently, such that globally installed plugins are found.
- Create a `package.json` and install verdaccio + plugins locally.
- Add your global `node_modules` folder to the `NODE_PATH` environment variable to give node a hint to search for modules here, too.
- Extend the official docker image. See this `docker.sh` and `Dockerfile` in this [example](https://gist.github.com/n4bb12/523e8347a580f596cbf14d0d791b5927).

More info: https://github.com/n4bb12/verdaccio-github-oauth-ui/issues/13#issuecomment-435296117