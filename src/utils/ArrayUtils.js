import { isEqual } from 'lodash-es'

class ArrayUtils {
  /**
   * Merge Object Arrays By Unique Key
   * @param {Object[]} sourceArray Source Array
   * @param {Object[]} newArray New Array, it has priority over the source array
   * @param {string} [uniqueKey='name'] Unique Array Key to compare for duplicates
   * @return {*[]}
   */
  static mergeObjectArraysByUniqueKey = (sourceArray, newArray, uniqueKey = 'name') => {
    const mergedArray = [...sourceArray]

    newArray.forEach((newObject) => {
      const duplicateIndex = mergedArray.findIndex((sourceObject) => isEqual(sourceObject[uniqueKey], newObject[uniqueKey]))

      if (duplicateIndex !== -1) {
        mergedArray[duplicateIndex] = newObject
      } else {
        mergedArray.push(newObject)
      }
    })

    return mergedArray
  }
}

export const mergeObjectArraysByUniqueKey = ArrayUtils.mergeObjectArraysByUniqueKey
