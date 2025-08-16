export type GuestGender = 'male' | 'female' | string

export interface DrinkMenuForAlcohol {
  alcohol_percentage: number
  alcohol_content_ml: number
}

export interface DrinkOrderForAlcohol {
  quantity: number
  ordered_at: string
  drink_menu: DrinkMenuForAlcohol
}

const ALCOHOL_DENSITY_G_PER_ML = 0.789
const METABOLISM_RATE_PER_HOUR = 0.017 // % BAC per hour
const STANDARD_DRINK_ML = 17.7

function getBodyParams(gender: GuestGender): { estimatedWeightKg: number; bodyWaterRatio: number } {
  const isFemale = gender === 'female'
  return {
    estimatedWeightKg: isFemale ? 60 : 70,
    bodyWaterRatio: isFemale ? 0.49 : 0.58
  }
}

export function calculatePureAlcoholMl(alcoholContentMl: number, alcoholPercentage: number, quantity: number): number {
  return (alcoholContentMl * alcoholPercentage / 100) * quantity
}

export function calculateInitialBACFromPureAlcohol(pureAlcoholMl: number, gender: GuestGender): number {
  const { estimatedWeightKg, bodyWaterRatio } = getBodyParams(gender)
  const bodyWaterLiters = estimatedWeightKg * bodyWaterRatio
  const alcoholGrams = pureAlcoholMl * ALCOHOL_DENSITY_G_PER_ML
  // Widmark formula approximation:
  // initialBAC(%) = (alcohol grams) / (weight kg * r) / 10
  return bodyWaterLiters > 0 ? (alcoholGrams / (estimatedWeightKg * bodyWaterRatio * 10)) : 0
}

export function calculateRemainingBAC(initialBAC: number, hoursSinceDrink: number): number {
  return Math.max(0, initialBAC - (hoursSinceDrink * METABOLISM_RATE_PER_HOUR))
}

export function calculateAlcoholMetrics(
  orders: DrinkOrderForAlcohol[] = [],
  gender: GuestGender,
  now: Date = new Date()
): { totalAlcoholMl: number; standardDrinks: number; estimatedBAC: number; lastHourAlcohol: number } {
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  let totalAlcoholMl = 0
  let lastHourAlcohol = 0
  let currentBAC = 0

  for (const order of orders) {
    const pureAlcoholMl = calculatePureAlcoholMl(
      order.drink_menu.alcohol_content_ml,
      order.drink_menu.alcohol_percentage,
      order.quantity
    )
    totalAlcoholMl += pureAlcoholMl

    const orderTime = new Date(order.ordered_at)
    if (orderTime >= oneHourAgo) {
      lastHourAlcohol += pureAlcoholMl
    }

    const hoursAgo = (now.getTime() - orderTime.getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 0 || hoursAgo > 24) continue

    const initialBAC = calculateInitialBACFromPureAlcohol(pureAlcoholMl, gender)
    currentBAC += calculateRemainingBAC(initialBAC, hoursAgo)
  }

  const standardDrinks = totalAlcoholMl / STANDARD_DRINK_ML

  return {
    totalAlcoholMl: Math.round(totalAlcoholMl * 10) / 10,
    standardDrinks: Math.round(standardDrinks * 10) / 10,
    estimatedBAC: Math.round(currentBAC * 1000) / 1000,
    lastHourAlcohol: Math.round(lastHourAlcohol * 10) / 10
  }
}

export function buildBacTimeSeries(
  orders: DrinkOrderForAlcohol[] = [],
  gender: GuestGender,
  start: Date,
  end: Date,
  stepMinutes: number = 15
): { labels: string[]; values: number[] } {
  if (!orders || orders.length === 0) return { labels: [], values: [] }

  const stepMs = stepMinutes * 60 * 1000
  const labels: string[] = []
  const values: number[] = []

  for (let t = start.getTime(); t <= end.getTime(); t += stepMs) {
    const bucketTime = new Date(t)
    let bac = 0

    for (const order of orders) {
      const orderTime = new Date(order.ordered_at)
      const elapsedHours = (t - orderTime.getTime()) / (1000 * 60 * 60)
      if (elapsedHours < 0 || elapsedHours > 24) continue

      const pureAlcoholMl = calculatePureAlcoholMl(
        order.drink_menu.alcohol_content_ml,
        order.drink_menu.alcohol_percentage,
        order.quantity
      )
      const initialBAC = calculateInitialBACFromPureAlcohol(pureAlcoholMl, gender)
      bac += calculateRemainingBAC(initialBAC, elapsedHours)
    }

    labels.push(bucketTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    values.push(Math.round(bac * 1000) / 1000)
  }

  return { labels, values }
}


