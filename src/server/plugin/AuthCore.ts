import { stringify } from "querystring"

import { logger } from "../../logger"
import { User, Verdaccio } from "../verdaccio"
import { AuthProvider } from "./AuthProvider"

export class AuthCore {
  constructor(
    private readonly verdaccio: Verdaccio,
    private readonly authProvider: AuthProvider,
  ) {}

  createAuthenticatedUser(username: string): User {
    // See https://verdaccio.org/docs/en/packages
    return {
      name: username,
      groups: ["$all", "@all", "$authenticated", "@authenticated"],
      real_groups: [username, ...this.authProvider.getAllowedGroups()],
    }
  }

  async createUiCallbackUrl(token: string, username: string): Promise<string> {
    const user = this.createAuthenticatedUser(username)

    const uiToken = await this.verdaccio.issueUiToken(user)
    const npmToken = await this.verdaccio.issueNpmToken(token, user)

    const query = { username, uiToken, npmToken }
    const url = "/?" + stringify(query)

    return url
  }

  authenticate(username: string, groups: string[]): boolean {
    const allowedGroups = this.authProvider.getAllowedGroups()
    logger.log(
      `User '${username}' is part of '${groups}', checking against '${allowedGroups}'`,
    )
    const success = groups.some((x) => allowedGroups.includes(x))

    if (!success) {
      logger.error(this.getDeniedMessage(username))
    }

    return success
  }

  private getDeniedMessage(username: string) {
    return `Access denied: User "${username}" is not a member of "${this.authProvider.getAllowedGroups()}"`
  }
}
