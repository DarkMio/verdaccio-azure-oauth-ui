import got from "got"

import { GitHubOAuth } from "./OAuth"
import { GitHubOrganization } from "./Organization"
import { GitHubUser } from "./User"

export class GitHubClient {
  constructor(
    private readonly webBaseUrl: string,
    private readonly apiBaseUrl: string,
  ) {}

  /**a
   * `POST /login/oauth/access_token`
   *
   * [Web application flow](bit.ly/2mNSppX).
   */
  requestAccessToken = async (
    code: string,
    clientId: string,
    clientSecret: string,
  ): Promise<GitHubOAuth> => {
    const url = this.webBaseUrl + "/login/oauth/access_token"
    const options = {
      method: "POST",
      json: {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub access token: " + error.message)
    }
  }

  /**
   * `GET /user`
   *
   * [Get the authenticated user](https://developer.github.com/v3/users/#get-the-authenticated-user)
   */
  requestUser = async (accessToken: string): Promise<GitHubUser> => {
    const url = this.apiBaseUrl + "/user"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub user info: " + error.message)
    }
  }

  /**
   * `GET /user/orgs`
   *
   * [List your organizations](https://developer.github.com/v3/orgs/#list-your-organizations)
   */
  requestUserOrgs = async (
    accessToken: string,
  ): Promise<GitHubOrganization[]> => {
    const url = this.apiBaseUrl + "/user/orgs"
    const options = {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    } as const

    try {
      return await got(url, options).json()
    } catch (error) {
      throw new Error("Failed requesting GitHub user orgs: " + error.message)
    }
  }
}
