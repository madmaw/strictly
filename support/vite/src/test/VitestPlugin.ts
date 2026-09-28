export type VitestPluginCallbacks = {
  beforeAll?(): void | Promise<void>
  afterAll?(): void | Promise<void>
  beforeEach?(): void | Promise<void>
  afterEach?(): void | Promise<void>
}

export type VitestPlugin = {
  install(): VitestPluginCallbacks
}
