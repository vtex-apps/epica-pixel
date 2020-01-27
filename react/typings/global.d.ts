declare function epica(s: string, t: string, o?: any): void

interface Window extends Window {
  dataLayer: any[]
  __SETTINGS__: {
    epicaId: string
  }
}
