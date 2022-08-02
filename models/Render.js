class Render {

  constructor () {
    this.variables = []
  }

  get snippetName () {
    return this._snippetName
  }

  set snippetName (snippetName) {
    this._snippetName = snippetName
  }

  get liquidTag () {
    return this._liquidTag
  }

  set liquidTag (liquidTag) {
    this._liquidTag = liquidTag
  }

  get clause () {
    return this._clause
  }

  set clause (clause) {
    this._clause = clause
  }

  get clauseSourceVariable () {
    return this._clauseSourceVariable
  }

  set clauseSourceVariable (clauseSourceVariable) {
    this._clauseSourceVariable = clauseSourceVariable
  }

  get clauseTargetVariable () {
    return this._clauseTargetVariable
  }

  set clauseTargetVariable (clauseTargetVariable) {
    this._clauseTargetVariable = clauseTargetVariable
  }

  get variables () {
    return this._variables
  }

  set variables (variables) {
    this._variables = variables
  }

  hasForClause () {
    return this._clause && this._clause === 'for'
  }

  hasWithClause () {
    return this._clause && this._clause === 'with'
  }

  hasVariables () {
    return this.variables.length > 0
  }
}

export default Render