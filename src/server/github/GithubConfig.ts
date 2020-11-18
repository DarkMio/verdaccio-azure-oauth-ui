import { ModeConfig } from "./../plugin/Config"

export interface GithubConfig extends ModeConfig {
  configName: "github"
  org: string
  "client-id": string
  "client-secret": string
  "enterprise-origin"?: string
}
