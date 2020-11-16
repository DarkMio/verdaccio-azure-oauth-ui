import { ModeConfig } from "./../plugin/Config";

export interface AzureConfig extends ModeConfig {
  configName: "azure"
  tenant: string
  "client-id": string
  "client-secret": string
  scope?: string | ""
  "allow-groups"?: string[]
}