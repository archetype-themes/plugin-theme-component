import chokidar from 'chokidar'

class Watcher {

  static watch (targets, action, rootFolder) {
    const watcher = chokidar.watch(targets, {
      awaitWriteFinish: {
        pollInterval: 20, stabilityThreshold: 60
      }, cwd: rootFolder, ignoreInitial: true
    })

    watcher.on('all', action)
  }
}

export default Watcher
