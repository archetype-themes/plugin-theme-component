import { hrtime } from 'node:process'
import InternalError from '../errors/InternalError.js'
import logger from './Logger.js'

class Timer {
  static getTimer () {
    return hrtime.bigint()
  }

  static getEndTimer (startTimer) {
    return hrtime.bigint() - startTimer
  }

  static getEndTimerInSeconds (startTimer, precision = 3) {
    const bigIntEndTimer = this.getEndTimer(startTimer) / BigInt(Math.pow(10, 9 - precision))
    if (bigIntEndTimer > Number.MAX_SAFE_INTEGER && bigIntEndTimer < Number.MIN_SAFE_INTEGER) {
      throw new InternalError('Timer conversion issue. BigInt Value is out of bounds')
    }
    return Number(bigIntEndTimer) / Math.pow(10, precision)
  }
}

export default Timer
