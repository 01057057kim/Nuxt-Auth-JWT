// JWT Token Management Utilities

export const getAuthToken = (): string | null => {
  if (process.client) {
    return localStorage.getItem('authToken')
  }
  return null
}

export const setAuthToken = (token: string): void => {
  if (process.client) {
    localStorage.setItem('authToken', token)
  }
}

export const removeAuthToken = (): void => {
  if (process.client) {
    localStorage.removeItem('authToken')
  }
}

export const isAuthenticated = (): boolean => {
  if (process.client) {
    return !!localStorage.getItem('authToken')
  }
  return false
}

export const getUserData = (): any => {
  if (process.client) {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : null
  }
  return null
}

export const setUserData = (userData: any): void => {
  if (process.client) {
    localStorage.setItem('userData', JSON.stringify(userData))
  }
}

export const removeUserData = (): void => {
  if (process.client) {
    localStorage.removeItem('userData')
  }
}

export const logout = (): void => {
  if (process.client) {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
  }
} 