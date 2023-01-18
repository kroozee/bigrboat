export type Angle = number; // rads

export type Position = {
    x: number,
    y: number
}

export type Area = {
    width: number,
    height: number
}

export type Velocity = {
    speed: number
    direction: Angle
}

export type FinSpeed = {
    port: number // left
    starboard: number // right
}

export type Line = VerticalLine | NonVerticalLine

type VerticalLine = {
    isVertical: true
    x: number
}

type NonVerticalLine = {
    // y - gradient*x = yIntercept
    // OR y = yIntercept + gradient*x
    // OR x = (yIntercept + y) / gradient
    isVertical: false
    yIntercept: number
    gradient: number
}