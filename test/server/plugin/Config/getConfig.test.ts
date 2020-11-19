import { pluginName } from "src/constants"
import { GithubConfig } from "src/server/github/GithubConfig"
import { Config, getConfig } from "src/server/plugin/Config"

describe("Config", () => {
  describe("getConfig", () => {
    const githubConfig: GithubConfig = {
      configName: "github",
      org: "TEST_ORG",
      "client-id": "TEST_ID",
      "client-secret": "TEST_SECRET",
    }
    const authConfig: Config = {
      auth: {
        [pluginName]: {
          mode: "github",
          config: githubConfig,
        },
      },
      middlewares: {
        [pluginName]: { enabled: true },
      },
    } as any

    const middlewaresConfig: Config = {
      auth: {
        [pluginName]: { enabled: true },
      },
      middlewares: {
        [pluginName]: {
          mode: "github",
          config: githubConfig,
        },
      },
    } as any

    it("from auth", () => {
      const value = getConfig(authConfig, "org")
      expect(value).toBe("TEST_ORG")
    })

    it("from middlewares", () => {
      const value = getConfig(middlewaresConfig, "org")
      expect(value).toBe("TEST_ORG")
    })

    it("from auth as environment variable", () => {
      process.env.TEST_ORG = "test-org"
      const value = getConfig(authConfig, "org")
      expect(value).toBe("test-org")
    })

    it("from middlewares as environment variable", () => {
      process.env.TEST_ORG = "test-org"
      const value = getConfig(middlewaresConfig, "org")
      expect(value).toBe("test-org")
    })

    it("auth is preferred over middlewares", () => {
      process.env.TEST_ORG = "test-org"
      const value = getConfig(middlewaresConfig, "org")
      expect(value).toBe("test-org")
    })
  })
})
