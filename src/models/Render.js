class Render {
  /** @type {string} **/
  #clause
  /** @type {string} **/
  #clauseSourceVariable
  /** @type {string} **/
  #clauseTargetVariable
  /** @type {string} **/
  #liquidTag
  /** @type {Snippet} **/
  #snippet
  /** @type {string} **/
  #snippetName
  /** @type {string[][]} **/
  #variables = []

  /**
   * Get Snippet
   * @returns {Snippet}
   */
  get snippet () {
    return this.#snippet
  }

  /**
   * Set Snippet
   * @param {Snippet} snippet
   */
  set snippet (snippet) {
    this.#snippet = snippet
  }

  /**
   *  Get Snippet Name
   * @returns {string}
   */
  get snippetName () {
    return this.#snippetName
  }

  /**
   * Set Snippet Name
   * @param {string} snippetName
   */
  set snippetName (snippetName) {
    this.#snippetName = snippetName
  }

  /**
   * Get Liquid Tag
   * @returns {string}
   */
  get liquidTag () {
    return this.#liquidTag
  }

  /**
   * Set Liquid Tag
   * @param {string} liquidTag
   */
  set liquidTag (liquidTag) {
    this.#liquidTag = liquidTag
  }

  /**
   * Get Clause (with|for)
   * @returns {string}
   */
  get clause () {
    return this.#clause
  }

  /**
   * Set clause (with|for)
   * @param {string} clause
   */
  set clause (clause) {
    this.#clause = clause
  }

  /**
   * Get Clause Source Variable Name
   * @returns {string}
   */
  get clauseSourceVariable () {
    return this.#clauseSourceVariable
  }

  /**
   * Set Clause Source Variable Name
   * @param {string} clauseSourceVariable
   */
  set clauseSourceVariable (clauseSourceVariable) {
    this.#clauseSourceVariable = clauseSourceVariable
  }

  /**
   * Get Clause Target Variable Name
   * @returns {string}
   */
  get clauseTargetVariable () {
    return this.#clauseTargetVariable
  }

  /**
   * Set Clause Target Variable Name
   * @param {string} clauseTargetVariable
   */
  set clauseTargetVariable (clauseTargetVariable) {
    this.#clauseTargetVariable = clauseTargetVariable
  }

  /**
   * Get Variable Names
   * @returns {string[][]}
   */
  get variables () {
    return this.#variables
  }

  /**
   *  Set Variable Names
   * @param {string[][]} variables
   */
  set variables (variables) {
    this.#variables = variables
  }

  /**
   * Boolean helper to check for a "for" clause
   * @returns {boolean}
   */
  hasForClause () {
    return this.#clause && this.#clause === 'for'
  }

  /**
   * Boolean helper to check for a "for" clause
   * @returns {boolean}
   */
  hasWithClause () {
    return this.#clause && this.#clause === 'with'
  }
}

export default Render
