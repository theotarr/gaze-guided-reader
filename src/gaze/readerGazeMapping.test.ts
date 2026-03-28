import { describe, expect, it } from 'vitest'

import { mapWebcamGazeToScrollFrame } from '@/gaze/readerGazeMapping'

function rect(x: number, y: number, w: number, h: number): DOMRectReadOnly {
  const top = y
  const left = x
  return {
    x,
    y,
    width: w,
    height: h,
    top,
    right: left + w,
    bottom: top + h,
    left,
    toJSON() {
      return this
    },
  }
}

describe('mapWebcamGazeToScrollFrame', () => {
  it('accepts gaze near the center of the reader and preserves confidence', () => {
    const r = rect(100, 200, 400, 600)
    const out = mapWebcamGazeToScrollFrame({
      clientX: 100 + 200,
      clientY: 200 + 300,
      readerRect: r,
      heldNx: 0.2,
      heldNy: 0.8,
      baseConfidence: 0.9,
    })
    expect(out.countsForScroll).toBe(true)
    expect(out.confidence).toBe(0.9)
    expect(out.nx).toBeCloseTo(0.5, 5)
    expect(out.ny).toBeCloseTo(0.5, 5)
  })

  it('does not count gaze above the reader; holds prior nx/ny and zeros confidence', () => {
    const r = rect(100, 200, 400, 600)
    const out = mapWebcamGazeToScrollFrame({
      clientX: 300,
      clientY: 50,
      readerRect: r,
      heldNx: 0.35,
      heldNy: 0.42,
      baseConfidence: 1,
    })
    expect(out.countsForScroll).toBe(false)
    expect(out.confidence).toBe(0)
    expect(out.nx).toBe(0.35)
    expect(out.ny).toBe(0.42)
  })

  it('returns zeros confidence for non-finite coordinates', () => {
    const r = rect(0, 0, 100, 100)
    const out = mapWebcamGazeToScrollFrame({
      clientX: NaN,
      clientY: 50,
      readerRect: r,
      heldNx: 0.5,
      heldNy: 0.5,
      baseConfidence: 1,
    })
    expect(out.countsForScroll).toBe(false)
    expect(out.confidence).toBe(0)
  })
})
