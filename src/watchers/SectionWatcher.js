import chokidar from 'chokidar'
import SectionBuilder from '../builders/SectionBuilder.js'
import SectionFactory from '../factory/SectionFactory.js'
import ArchieCLI from '../models/static/ArchieCLI.js'
import logger from '../utils/Logger.js'

class SectionWatcher {
  /**
   *
   * @param {string} sectionRootFolder
   */
  static async buildOnChange (sectionRootFolder) {

    logger.debug(`SectionWatcher: Initializing chokidar watcher`)
    const watcher = chokidar.watch(['sections/*/src/*', '../snippets/*/src/*'], {
      awaitWriteFinish: {
        pollInterval: 20, stabilityThreshold: 60
      }, cwd: sectionRootFolder, ignoreInitial: true
    })

    logger.debug(`SectionWatcher: Will Watch all events and rebuild the Section`)
    watcher.on('all', async (event, path) => {
      logger.debug(`Event: "${event}" on file: ${path} detected`)

      const section = await SectionFactory.fromSectionBuildCommand(ArchieCLI.targetComponent)
      await SectionBuilder.build(section)
    })
  }
}

export default SectionWatcher
