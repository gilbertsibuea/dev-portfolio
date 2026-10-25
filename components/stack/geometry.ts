/** Degrees → radians */
export function degToRad(deg: number) {
    return (deg * Math.PI) / 180
}

export type SectorGeometry = {
    index: number
    /** Mid-angle in degrees (0 = east, CCW). Adjusted so sector 0 sits at top. */
    midAngleDeg: number
    startAngleDeg: number
    endAngleDeg: number
    /** Unit vector from center toward sector mid (SVG y grows down). */
    midX: number
    midY: number
    /** Label / icon anchor in viewBox coords */
    labelX: number
    labelY: number
    pathD: string
}

/**
 * Build 8 equal annulus sectors.
 * Sector 0 is centered at the top (−90°).
 */
export function buildSectorGeometry(
    count: number,
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    labelR: number
): SectorGeometry[] {
    const sweep = 360 / count
    // Offset so sector midpoints land at top, top-right, … rather than on the seams
    const startOffset = -90 - sweep / 2

    return Array.from({ length: count }, (_, index) => {
        const startAngleDeg = startOffset + index * sweep
        const endAngleDeg = startAngleDeg + sweep
        const midAngleDeg = startAngleDeg + sweep / 2

        const start = degToRad(startAngleDeg)
        const end = degToRad(endAngleDeg)
        const mid = degToRad(midAngleDeg)

        const x0 = cx + outerR * Math.cos(start)
        const y0 = cy + outerR * Math.sin(start)
        const x1 = cx + outerR * Math.cos(end)
        const y1 = cy + outerR * Math.sin(end)
        const x2 = cx + innerR * Math.cos(end)
        const y2 = cy + innerR * Math.sin(end)
        const x3 = cx + innerR * Math.cos(start)
        const y3 = cy + innerR * Math.sin(start)

        const largeArc = sweep > 180 ? 1 : 0

        const pathD = [
            `M ${x0} ${y0}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x1} ${y1}`,
            `L ${x2} ${y2}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${x3} ${y3}`,
            "Z",
        ].join(" ")

        return {
            index,
            midAngleDeg,
            startAngleDeg,
            endAngleDeg,
            midX: Math.cos(mid),
            midY: Math.sin(mid),
            labelX: cx + labelR * Math.cos(mid),
            labelY: cy + labelR * Math.sin(mid),
            pathD,
        }
    })
}

/**
 * Map a pointer position relative to wheel center to a sector index.
 * Returns null when inside the dead-zone (inner hub) or outside the wheel.
 */
export function pointerToSectorIndex(
    dx: number,
    dy: number,
    count: number,
    innerR: number,
    outerR: number
): number | null {
    const dist = Math.hypot(dx, dy)
    if (dist < innerR * 0.55 || dist > outerR * 1.15) return null

    // atan2: 0 = east, positive = south in SVG coords
    const deg = (Math.atan2(dy, dx) * 180) / Math.PI
    const sweep = 360 / count
    const startOffset = -90 - sweep / 2

    // Normalize into [startOffset, startOffset + 360)
    let relative = deg - startOffset
    while (relative < 0) relative += 360
    while (relative >= 360) relative -= 360

    return Math.min(count - 1, Math.floor(relative / sweep))
}
