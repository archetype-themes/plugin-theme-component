class Render {

  constructor () {
    this.variables = []
  }

  /**
   * Get Snippet
   * @returns {Snippet}
   */
  get snippet () {
    return this._snippet
  }

  /**
   * Set Snippet
   * @param {Snippet} snippet
   */
  set snippet (snippet) {
    this._snippet = snippet
  }

  /**
   *  Get Snippet Name
   * @returns {string}
   */
  get snippetName () {
    return this._snippetName
  }

  /**
   * Set Snippet Name
   * @param {string} snippetName
   */
  set snippetName (snippetName) {
    this._snippetName = snippetName
  }

  /**
   * Get Liquid Tag
   * @returns {string}
   */
  get liquidTag () {
    return this._liquidTag
  }

  /**
   * Set Liquid Tag
   * @param {string} liquidTag
   */
  set liquidTag (liquidTag) {
    this._liquidTag = liquidTag
  }

  /**
   * Get Clause (with|for)
   * @returns {string}
   */
  get clause () {
    return this._clause
  }

  /**
   * Set clause (with|for)
   * @param {string} clause
   */
  set clause (clause) {
    this._clause = clause
  }

  /**
   * Get Clause Source Variable Name
   * @returns {string}
   */
  get clauseSourceVariable () {
    return this._clauseSourceVariable
  }

  /**
   * Set Clause Source Variable Name
   * @param {string} clauseSourceVariable
   */
  set clauseSourceVariable (clauseSourceVariable) {
    this._clauseSourceVariable = clauseSourceVariable
  }

  /**
   * Get Clause Target Variable Name
   * @returns {string}
   */
  get clauseTargetVariable () {
    return this._clauseTargetVariable
  }

  /**
   * Set Clause Target Variable Name
   * @param {string} clauseTargetVariable
   */
  set clauseTargetVariable (clauseTargetVariable) {
    this._clauseTargetVariable = clauseTargetVariable
  }

  /**
   * Get Variable Names
   * @returns {string[]}
   */
  get variables () {
    return this._variables
  }

  /**
   *  Set Variable Names
   * @param {string[]} variables
   */
  set variables (variables) {
    this._variables = variables
  }

  /**
   * Boolean helper to check for a "for" clause
   * @returns {boolean}
   */
  hasForClause () {
    return this._clause && this._clause === 'for'
  }

  /**
   * Boolean helper to check for a "for" clause
   * @returns {boolean}
   */
  hasWithClause () {
    return this._clause && this._clause === 'with'
  }
}

export default Render
