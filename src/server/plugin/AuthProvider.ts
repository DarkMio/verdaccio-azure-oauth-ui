import { Request } from "express"
import { ModeConfig } from "./Config"

interface AuthProviderConstructor<T extends ModeConfig> {
  new (config: T)
}

export interface AuthProvider {
  getId(): string
  getLoginUrl(callbackUrl: string): string
  getCode(req: Request): string
  getAllowedGroups(): string[]

  getToken(code: string): Promise<string>
  getUsername(token: string): Promise<string>
  getGroups(token: string): Promise<string[]>
}

export function createAuthProvider<T extends ModeConfig>(
  ctor: AuthProviderConstructor<T>,
  config: ModeConfig,
): AuthProvider {
  return new ctor(config as T)
}
