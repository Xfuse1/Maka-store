/**
 * Save design settings to database via API route
 */
export async function saveDesignSettings(key: string, value: any): Promise<void> {
  try {
    const response = await fetch('/api/admin/design/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'فشل حفظ الإعدادات')
    }
  } catch (error: any) {
    const message = error?.message ?? 'حدث خطأ أثناء حفظ الإعدادات'
    console.error('[saveDesignSettings] Error:', error)
    throw new Error(message)
  }
}

/**
 * Get all design settings from database via API route
 */
export async function getDesignSettings(): Promise<any> {
  try {
    const response = await fetch('/api/admin/design/settings', {
      method: 'GET',
    })

    const data = await response.json()

    return data.settings || {}
  } catch (error) {
    console.error('[getDesignSettings] Error:', error)
    return {}
  }
}
