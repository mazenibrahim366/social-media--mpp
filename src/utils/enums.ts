export const signatureTypeEnum = { system: 'System', bearer: 'Bearer' } as const
export const tokenTypeEnum = { access: 'access', refresh: 'refresh' } as const
export const logoutEnum = {
  signoutFromAllDevice: 'signoutFromAllDevice',
  signout: 'signout',
  stayLoggedIn: 'stayLoggedIn',
} as const
export let genderEnum = { male: 'male', female: 'female' } as const
export let roleEnum = { User: 'User', Admin: 'Admin' } as const
export let providerEnum = {system : "system",google : "google"}