import chokidar from 'chokidar'
import SectionBuilder from '../builders/SectionBuilder.js'
import SectionFactory from '../factory/SectionFactory.js'
import Archie from '../models/static/Archie.js'
import logger from '../utils/Logger.js'

class SectionWatcher {
  /**
   *
   * @param {Section} section
   */
  static async watch (section) {
    const watcher = chokidar.watch(['sections/*/src/*', '../snippets/*/src/*'], {
      awaitWriteFinish: {
        pollInterval: 20,
        stabilityThreshold: 60
      },
      cwd: section.rootFolder,
      ignoreInitial: true
    })

    watcher.on('all', await this.onWatchEvent)
  }

  static async onWatchEvent (event, path) {
    logger.debug(`Event: "${event}" on file: ${path} detected`)

    const section = await SectionFactory.fromName(Archie.targetComponent)
    await SectionBuilder.build(section)
  }
}

export default SectionWatcher
