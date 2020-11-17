import { ModeConfig } from "./../plugin/Config";

export interface AzureConfig extends ModeConfig {
  configName: "azure"
  tenant: string
  clientId: string
  clientSecret: string
  scope?: string | ""
  allowGroups?: string[]
}