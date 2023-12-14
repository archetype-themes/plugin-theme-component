import { hrtime } from 'node:process'
import InternalError from '../errors/InternalError.js'

class Timer {
  static getTimer () {
    return hrtime.bigint()
  }

  static getTimeElapsed (startTimer) {
    return hrtime.bigint() - startTimer
  }

  static getTimeElapsedInSeconds (startTimer, precision = 3) {
    const bigIntEndTimer = Timer.getTimeElapsed(startTimer) / BigInt(Math.pow(10, 9 - precision))
    if (bigIntEndTimer > Number.MAX_SAFE_INTEGER && bigIntEndTimer < Number.MIN_SAFE_INTEGER) {
      throw new InternalError('Timer conversion issue. BigInt Value is out of bounds')
    }
    return Number(bigIntEndTimer) / Math.pow(10, precision)
  }
}

export default Timer

export const getTimer = Timer.getTimer
export const getTimeElapsed = Timer.getTimeElapsedInSeconds
