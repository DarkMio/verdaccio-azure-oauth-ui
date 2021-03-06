import got from "got"
import { Request } from "express"
import { stringify } from "querystring"

import { AzureConfig } from "./AzureConfig"
import { AuthProvider } from "../plugin/AuthProvider"

import {
  AzureTokenResponse,
  AzureUserInfoResponse,
  AzureMemberGroupResponse,
  AzureDirectoryObjectResponse,
} from "./AzureApiTypes"
import { logger } from "../../logger"

const BASE_SCOPE = "user.read openid profile offline_access "

const API_URL = "https://login.microsoftonline.com/"
const TOKEN_ENDPOINT = "/oauth2/v2.0/token"
const AUTHORIZATION_ENDPOINT = "/oauth2/v2.0/authorize?"

const USER_INFO_ENDPOINT = "https://graph.microsoft.com/oidc/userinfo"
const MEMBER_GROUPS_ENDPOINT =
  "https://graph.microsoft.com/v1.0/me/getMemberGroups"
const GROUPS_INFO_ENDPOINT =
  "https://graph.microsoft.com/v1.0/directoryObjects/getByIds"

export class AzureAuthProvider implements AuthProvider {
  private readonly tenant = this.config.tenant
  private readonly clientId = this.config.clientId
  private readonly clientSecret = this.config.clientSecret
  private readonly scope = BASE_SCOPE + (this.config.scope || "")
  private readonly allowedGroups = this.config.allowGroups || []
  private readonly endpointUrl: string
  private readonly tokenUrl: string
  private readonly authorizationUrl: string

  constructor(private readonly config: AzureConfig) {
    this.endpointUrl = API_URL + this.config.tenant
    this.tokenUrl = this.endpointUrl + TOKEN_ENDPOINT
    this.authorizationUrl = this.endpointUrl + AUTHORIZATION_ENDPOINT
    if (!this.clientId || !this.clientSecret || !this.tenant) {
      throw new Error(
        "Missing clientId, clientSecret or tenant in config for azure",
      )
    }
  }

  getId(): string {
    return "azure"
  }

  getLoginUrl(callbackUrl: string): string {
    const queryParams = stringify({
      client_id: this.clientId,
      redirect_url: callbackUrl,
      response_type: "code",
      response_mode: "query",
      scope: this.scope,
    })
    return this.authorizationUrl + "?" + queryParams
  }

  getCode(req: Request): string {
    return req.query.code as string
  }

  getAllowedGroups(): string[] {
    return this.allowedGroups as string[]
  }

  async getToken(code: string, callbackUrl?: string): Promise<string> {
    const options = {
      method: "POST",
      form: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: "authorization_code",
        scope: this.scope,
        code,
        redirect_url: callbackUrl,
      },
    } as const

    const response = (await got(
      this.tokenUrl,
      options,
    ).json()) as AzureTokenResponse
    return response.access_token
  }

  async getUsername(token: string): Promise<string> {
    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
    } as const

    const response = (await got(
      USER_INFO_ENDPOINT,
      options,
    ).json()) as AzureUserInfoResponse
    return response.name
  }

  async getGroups(token: string): Promise<string[]> {
    const groupIds = await this.getGroupIds(token)
    const groups = await this.resolveGroupIds(token, groupIds)
    return groups
  }

  private async getGroupIds(token: string): Promise<string[]> {
    const options = {
      method: "POST",
      json: { securityEnabledOnly: false },
      headers: { Authorization: "Bearer " + token },
    } as const
    const response = (await got(
      MEMBER_GROUPS_ENDPOINT,
      options,
    ).json()) as AzureMemberGroupResponse
    return response.value
  }

  private async resolveGroupIds(
    token: string,
    groupIds: string[],
  ): Promise<string[]> {
    const options = {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      json: {
        ids: groupIds,
        types: ["group"],
      },
    } as const

    const response = (await got(
      GROUPS_INFO_ENDPOINT,
      options,
    ).json()) as AzureDirectoryObjectResponse
    const names = response.value.map((x) => x.mailNickname)
    return names
  }
}
