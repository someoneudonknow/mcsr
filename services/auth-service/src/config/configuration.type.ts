import {config as base} from "./envs/default"
import {config as prod} from "./envs/prod"

export type ObjectType = Record<string, unknown>
export type ProdConfig = typeof prod
export type DefaultConfig = typeof base
export type Config = DefaultConfig & ProdConfig

