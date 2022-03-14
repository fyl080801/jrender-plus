export interface Field extends Record<string, any> {
  component?: any
  props?: Record<string, any>
  slot?: string
  children?: Field[] | Array<any>
}

export interface RenderContext {
  model: Record<string, any>
  refs: Record<string, any>
}

export interface RenderServices {
  context: RenderContext
  scope: Record<string, any>
  services: ProxyServices
  props: Record<string, any>
  injector: (input: any) => any
  render: (scope: Record<string, any>) => Promise<any>
}

export interface DatasourceProvider {
  (options: () => Record<string, any>): any
}

export interface ProxyServices {
  functional: Record<string, Function>
}

export interface BindHook {
  name: (name: string) => BindHook
  depend: (name: string) => BindHook
  dependent: (name: string) => BindHook
}

export interface BindHookHandle {
  (services: RenderServices): (field: Field, next: (field?: Field) => void | Promise<any>) => void
}

export interface BindProxyProvider {
  (services: ProxyServices): BindProxy
}

export interface BindProxy {
  (value: any): (context: any) => any
}

export interface Setup {
  addComponent: (name: string & { name: string }, type?: any) => void
  addFunction: (name: string, fx: Function) => void
  onBeforeBind: (handle: BindHookHandle) => BindHook
  onBind: (handle: BindHookHandle) => BindHook
  addProxy: (factory: BindProxyProvider) => void
  addDataSource(type: string, provider: DatasourceProvider): void
}

export interface SetupHandle {
  (setup: Setup): void
}
