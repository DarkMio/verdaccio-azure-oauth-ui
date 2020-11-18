import { AuthCallback, IPluginAuth, IPluginMiddleware } from "@verdaccio/types"
import e, { Application } from "express"
import { logger } from "../../logger"
import { AzureAuthProvider } from "../azure"

import { CliFlow, WebFlow } from "../flows"
import { GitHubAuthProvider } from "../github"
import { GithubConfig } from "../github/GithubConfig"
import { Auth, Verdaccio } from "../verdaccio"
import { AuthCore } from "./AuthCore"
import { AuthProvider, createAuthProvider } from "./AuthProvider"
import { Cache } from "./Cache"
import { Config, validateConfig } from "./Config"
import { PatchHtml } from "./PatchHtml"
import { registerGlobalProxyAgent } from "./ProxyAgent"
import { ServeStatic } from "./ServeStatic"
import { pluginName } from "../../constants"
/**
 * Implements the verdaccio plugin interfaces.
 */
export class Plugin implements IPluginMiddleware<any>, IPluginAuth<any> {
  private readonly provider: AuthProvider
  private readonly cache: Cache
  private readonly verdaccio: Verdaccio
  private readonly core: AuthCore

  constructor(private readonly config: Config) {
    switch (config.auth[pluginName].mode) {
      case "github":
        this.provider = createAuthProvider(GitHubAuthProvider, config.config)
        break
      case "azure":
        this.provider = createAuthProvider(AzureAuthProvider, config.config)
        break
      default:
        throw Error("No config for either azure or github is present.")
    }

    this.cache = new Cache(this.provider)
    this.verdaccio = new Verdaccio(this.config)
    this.core = new AuthCore(this.verdaccio, this.provider)
    validateConfig(config)
    registerGlobalProxyAgent()
  }

  /**
   * IPluginMiddleware
   */
  register_middlewares(app: Application, auth: Auth) {
    this.verdaccio.setAuth(auth)

    const children = [
      new ServeStatic(),
      new PatchHtml(this.verdaccio),
      new WebFlow(this.verdaccio, this.core, this.provider),
      new CliFlow(this.verdaccio, this.core, this.provider),
    ]

    for (const child of children) {
      child.register_middlewares(app)
    }
  }

  /**
   * IPluginAuth
   */
  async authenticate(username: string, token: string, callback: AuthCallback) {
    try {
      const providerGroups = await this.cache.getGroups(token)

      if (this.core.authenticate(username, providerGroups)) {
        const user = this.core.createAuthenticatedUser(username)
        logger.log("Creating new user: " + JSON.stringify(user))
        callback(null, user.real_groups)
      } else {
        callback(null, false)
      }
    } catch (error) {
      callback(error, false)
    }
  }
}
