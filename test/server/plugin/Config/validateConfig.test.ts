import { pluginName } from "src/constants"
import { validateConfig } from "src/server/plugin/Config"
import { createTestPluginConfig } from "test/utils"

describe("Config", () => {
  describe("validateConfig", () => {
    function shouldSucceed(config: any) {
      validateConfig(config)
    }

    it("accepts an empty 'auth' node as long as it is enabled", () => {
      shouldSucceed({
        auth: {
          [pluginName]: { enabled: true },
        },
        middlewares: {
          [pluginName]: { mode: "github", config: createTestPluginConfig() },
        },
      })
    })

    it("accepts an empty 'middlewares' node as long as it is enabled", () => {
      shouldSucceed({
        auth: {
          [pluginName]: { mode: "github", config: createTestPluginConfig() },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("treats 'enterprise-origin' as optional", () => {
      shouldSucceed({
        auth: {
          [pluginName]: {
            mode: "github",
            config: {
              ...createTestPluginConfig(),
              ["'enterprise-origin'"]: null,
            },
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    function shouldFail(config: any) {
      try {
        validateConfig(config)
        fail()
      } catch (error) {
        // expected
      }
    }

    it("throws an error if 'auth' node is not enabled", () => {
      shouldFail({
        middlewares: {
          [pluginName]: { mode: "github", config: createTestPluginConfig() },
        },
      })
    })

    it("throws an error if 'middlewares' node is not enabled", () => {
      shouldFail({
        auth: {
          [pluginName]: { mode: "github", config: createTestPluginConfig() },
        },
      })
    })

    it("throws an error if 'org' is missing", () => {
      shouldFail({
        auth: {
          [pluginName]: {
            mode: "github",
            config: { ...createTestPluginConfig(), ["org"]: null },
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("throws an error if 'client-id' is missing", () => {
      shouldFail({
        auth: {
          [pluginName]: {
            mode: "github",
            config: { ...createTestPluginConfig(), ["client-id"]: null },
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })

    it("throws an error if 'client-secret' is missing", () => {
      shouldFail({
        auth: {
          [pluginName]: {
            mode: "github",
            config: {
              ...createTestPluginConfig(),
              ["client-secret"]: null,
            },
          },
        },
        middlewares: {
          [pluginName]: { enabled: true },
        },
      })
    })
  })
})
