import { hrtime } from 'node:process'
import InternalError from '../errors/InternalError.js'

class Timer {
  /** @type {bigint} **/
  time

  constructor () {
    this.time = hrtime.bigint()
  }

  /**
   * Returns the time elapsed since the start of the timer.
   *
   * @param {boolean} [inSeconds=true] - Flag indicating whether to return time in seconds.
   * @param {number} [precision=3] - The number of digits after the decimal point for the time value.
   * @returns {number|bigint} - The time elapsed since the start of the timer.
   * @throws {InternalError} - If the calculated time value is out of the range of Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
   *
   * @example
   * const timer = new Timer();
   * timer.start();
   *
   * // Get time elapsed in seconds with default precision of 3
   * const timerNow = timer.now();
   *
   * // Get time elapsed in milliseconds
   * const timerNowMilliseconds = timer.now(false);
   */
  now (inSeconds = true, precision = 3) {
    const now = hrtime.bigint() - this.time

    if (inSeconds) {
      const bigIntEndTimer = now / BigInt(Math.pow(10, 9 - precision))
      if (bigIntEndTimer > Number.MAX_SAFE_INTEGER && bigIntEndTimer < Number.MIN_SAFE_INTEGER) {
        throw new InternalError('Timer conversion issue. BigInt Value is out of bounds')
      }

      return Number(bigIntEndTimer) / Math.pow(10, precision)
    }

    return now
  }
}

export default Timer
