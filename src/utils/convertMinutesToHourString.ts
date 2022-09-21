export function convertMinutesToHourString(minutes: number): string{
    const amountHours = Math.floor(minutes/60)
    const amountMinutes = minutes - amountHours * 60

    return `${amountHours.toString().padStart(2, '0')}:${amountMinutes.toString().padStart(2, '0')}`
}