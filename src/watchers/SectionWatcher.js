import { watch } from 'node:fs/promises'
import logger from '../utils/Logger.js'
import SectionBuilder from '../builders/SectionBuilder.js'
import { exit } from 'node:process'

class SectionWatcher {
  /**
   *
   * @param {Section} section
   */
  static async watch (section) {
    try {
      const watcher = watch(section.rootFolder + '/src', { recursive: true })
      for await (const event of watcher) {
        if (!event.filename.endsWith('~')) {
          logger.debug(`Detected a "${event.eventType}" event on "${event.filename}"`)
          await SectionBuilder.build(section)
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        logger.debug('Received Abort Signal - Exiting')
        logger.info('See you again soon!')
        exit(0)
      } else {
        await this.watch(section)
      }
    }
  }

}

export default SectionWatcher
