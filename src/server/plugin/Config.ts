import { Config as VerdaccioConfig } from "@verdaccio/types"
import chalk from "chalk"
import { get } from "lodash"

import { pluginName } from "../../constants"
import { logger } from "../../logger"

//
// Types
//
export interface PluginConfig {
  mode: ModeConfig["configName"]
  config: ModeConfig
}

export interface ModeConfig {
  configName: string
}

export type PluginConfigKey = keyof Config

export interface Config extends VerdaccioConfig, PluginConfig {
  middlewares: {
    [pluginName]: PluginConfig
  }
  auth: {
    [pluginName]: PluginConfig
  }
}

//
// Access
//
export function getConfig<T = string>(config: Config, key: PluginConfigKey): T {
  const value =
    null ||
    get(config, `middlewares[${pluginName}][config][${key}]`) ||
    get(config, `auth[${pluginName}][config][${key}]`)

  return process.env[value] || value
}

export function getMode<T = string>(config: Config): T {
  const value =
    null ||
    get(config, `middlewares[${pluginName}][mode]`) ||
    get(config, `auth[${pluginName}][mode]`)
  return value
}

export function getModeConfig<T = string>(
  config: ModeConfig,
  key: PluginConfigKey,
): T {
  const value = null || get(config, `[${key}]`)

  return process.env[value] || value
}

//
// Validation
//
function ensurePropExists(config: Config, key: PluginConfigKey) {
  const value = getConfig(config, key)

  if (!value) {
    logger.error(
      chalk.red(
        `[${pluginName}] ERR: Missing configuration "auth.${pluginName}.${key}"`,
      ),
    )
    throw new Error("Please check your verdaccio config.")
  }
}

function ensureNodeIsNotEmpty(config: Config, node: keyof Config) {
  const path = `[${node}][${pluginName}]`
  const obj = get(config, path, {})

  if (!Object.keys(obj).length) {
    throw new Error(`"${node}.${pluginName}" must be enabled`)
  }
}

export function validateConfig(config: Config) {
  const mode = getMode(config)
  if (mode === "github") {
    ensurePropExists(config, "org")
    ensurePropExists(config, "client-id")
    ensurePropExists(config, "client-secret")
  }

  ensureNodeIsNotEmpty(config, "auth")
  ensureNodeIsNotEmpty(config, "middlewares")
}
