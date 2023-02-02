import NodeConfig from '../../cli/models/NodeConfig.js'

function buildGridClasses (breakpoint) {
  let result = {}
  let prefix = '.'

  if (breakpoint !== undefined) {
    prefix += breakpoint + '--'
  }

  result[`${prefix}one-whole`] = { width: '100%' }
  result[`${prefix}one-half`] = { width: '50%' }
  result[`${prefix}one-third`] = { width: '33.33333%' }
  result[`${prefix}two-thirds`] = { width: '66.66667%' }

  if (breakpoint !== undefined) {
    result[`
      .grid--uniform ${prefix}one-half:nth-of-type(2n+1),
      .grid--uniform ${prefix}one-third:nth-of-type(3n+1)
    `] = { clear: 'both' }
  }

  if (NodeConfig.gridSize >= 4) {
    result[`${prefix}one-quarter`] = { width: '25%' }
    result[`${prefix}two-quarters`] = { width: '50%' }
    result[`${prefix}three-quarters`] = { width: '75%' }

    if (breakpoint !== undefined) {
      result['.grid--uniform ' + prefix + 'one-quarter:nth-of-type(4n+1)'] = { clear: 'both' }
    }
  }

  if (NodeConfig.gridSize >= 5) {
    result[`${prefix}one-fifth`] = { width: '20%' }
    result[`${prefix}two-fifths`] = { width: '40%' }
    result[`${prefix}three-fifths`] = { width: '60%' }
    result[`${prefix}four-fifths`] = { width: '80%' }

    if (breakpoint !== undefined) {
      result['.grid--uniform ' + prefix + 'one-fifth:nth-of-type(5n+1)'] = { clear: 'both' }
    }
  }

  if (NodeConfig.gridSize >= 6) {
    result[`${prefix}one-sixth`] = { width: '16.66667%' }
    result[`${prefix}two-sixths`] = { width: '33.33333%' }
    result[`${prefix}three-sixths`] = { width: '50%' }
    result[`${prefix}four-sixths`] = { width: '66.66667%' }
    result[`${prefix}five-sixths`] = { width: '83.33333%' }

    if (breakpoint !== undefined) {
      result[`
          .grid--uniform ${prefix}one-sixth:nth-of-type(6n+1),
          .grid--uniform ${prefix}two-sixths:nth-of-type(3n+1),
          .grid--uniform ${prefix}three-sixths:nth-of-type(2n+1)
        `] = { clear: 'both' }
    }
  }

  if (NodeConfig.gridSize >= 8) {
    result[`${prefix}one-eighth`] = { width: '12.5%' }
    result[`${prefix}two-eighths`] = { width: '25%' }
    result[`${prefix}three-eighths`] = { width: '37.5%' }
    result[`${prefix}four-eighths`] = { width: '50%' }
    result[`${prefix}five-eighths`] = { width: '62.5%' }
    result[`${prefix}six-eighths`] = { width: '75%' }
    result[`${prefix}seven-eighths`] = { width: '87.5%' }

    if (breakpoint !== undefined) {
      result[`
          .grid--uniform ${prefix}one-eighth:nth-of-type(8n+1),
          .grid--uniform ${prefix}two-eighths:nth-of-type(4n+1),
          .grid--uniform ${prefix}four-eighths:nth-of-type(2n+1)
        `] = { clear: 'both' }
    }
  }

  if (NodeConfig.gridSize >= 10) {
    result[`${prefix}one-tenth`] = { width: '10%' }
    result[`${prefix}two-tenths`] = { width: '20%' }
    result[`${prefix}three-tenths`] = { width: '30%' }
    result[`${prefix}four-tenths`] = { width: '40%' }
    result[`${prefix}five-tenths`] = { width: '50%' }
    result[`${prefix}six-tenths`] = { width: '60%' }
    result[`${prefix}seven-tenths`] = { width: '70%' }
    result[`${prefix}eight-tenths`] = { width: '80%' }
    result[`${prefix}nine-tenths`] = { width: '90%' }

    if (breakpoint !== undefined) {
      result['.grid--uniform ' + prefix + 'five-tenths:nth-of-type(2n+1)'] = { clear: 'both' }
    }
  }

  if (NodeConfig.gridSize >= 12) {
    result[`${prefix}one-twelfth`] = { width: '8.33333%' }
    result[`${prefix}two-twelfths`] = { width: '16.66667%' }
    result[`${prefix}three-twelfths`] = { width: '25%' }
    result[`${prefix}four-twelfths`] = { width: '33.33333%' }
    result[`${prefix}five-twelfths`] = { width: '41.66667%' }
    result[`${prefix}six-twelfths`] = { width: '50%' }
    result[`${prefix}seven-twelfths`] = { width: '58.33333%' }
    result[`${prefix}eight-twelfths`] = { width: '66.66667%' }
    result[`${prefix}nine-twelfths`] = { width: '75%' }
    result[`${prefix}ten-twelfths`] = { width: '83.33333%' }
    result[`${prefix}eleven-twelfths`] = { width: '91.66667%' }

    if (breakpoint !== undefined) {
      result[`
          .grid--uniform ${prefix}one-twelfth:nth-of-type(12n+1),
          .grid--uniform ${prefix}two-twelfths:nth-of-type(6n+1),
          .grid--uniform ${prefix}three-twelfths:nth-of-type(4n+1),
          .grid--uniform ${prefix}four-twelfths:nth-of-type(3n+1),
          .grid--uniform ${prefix}six-twelfths:nth-of-type(2n+1)
        `] = { clear: 'both' }
    }
  }

  // Wrap in media query syntax if breakpoint sent
  if (breakpoint !== undefined) {
    let mediaQuerySyntax = '@media (--' + breakpoint + ')'
    return { [mediaQuerySyntax]: result }
  } else {
    // No breakpoint, top-level only
    return result
  }
}

function buildDisplayHelpers (breakpoint) {
  let result = {}
  let prefix = '.'

  if (breakpoint !== undefined) {
    prefix += breakpoint + '--'
  }

  result[`${prefix}show`] = { display: 'block !important' }
  result[`${prefix}hide`] = { display: 'none !important' }

  result[`${prefix}text-left`] = { 'text-align': 'left !important' }
  result[`${prefix}text-right`] = { 'text-align': 'right !important' }
  result[`${prefix}text-center`] = { 'text-align': 'center !important' }

  // Wrap in media query syntax if breakpoint sent
  if (breakpoint !== undefined) {
    let mediaQuerySyntax = '@media (--' + breakpoint + ')'
    return { [mediaQuerySyntax]: result }
  } else {
    // No breakpoint, top-level only
    return result
  }
}

function buildAnimationDelay (count) {
  let result = {}

  for (let i = count; i > 0; i--) {
    let delay = Math.round((0.06 * i) * 100) / 100
    if (i === 1) {
      delay = 0
    }

    if (delay > 0) {
      result[`.animation-delay-${i}`] = { 'animation-delay': `${delay}s` }
    }
  }

  return result
}

function buildPushClasses (breakpoint) {
  let result = {}
  let prefix = '.'

  if (breakpoint !== undefined) {
    prefix += breakpoint + '--'
  }

  result[`${prefix}push-one-half`] = { left: '50%' }
  result[`${prefix}push-one-third`] = { left: '33.33333%' }
  result[`${prefix}push-two-thirds`] = { left: '66.66667%' }

  if (NodeConfig.gridSize >= 4) {
    result[`${prefix}push-one-quarter`] = { left: '25%' }
    result[`${prefix}push-two-quarters`] = { left: '50%' }
    result[`${prefix}push-three-quarters`] = { left: '75%' }
  }

  if (NodeConfig.gridSize >= 5) {
    result[`${prefix}push-one-fifth`] = { left: '20%' }
    result[`${prefix}push-two-fifths`] = { left: '40%' }
    result[`${prefix}push-three-fifths`] = { left: '60%' }
    result[`${prefix}push-four-fifths`] = { left: '80%' }
  }

  if (NodeConfig.gridSize >= 6) {
    result[`${prefix}push-one-sixth`] = { left: '16.66667%' }
    result[`${prefix}push-two-sixths`] = { left: '33.33333%' }
    result[`${prefix}push-three-sixths`] = { left: '50%' }
    result[`${prefix}push-four-sixths`] = { left: '66.66667%' }
    result[`${prefix}push-five-sixths`] = { left: '83.33333%' }
  }

  if (NodeConfig.gridSize >= 8) {
    result[`${prefix}push-one-eighth`] = { left: '12.5%' }
    result[`${prefix}push-two-eighths`] = { left: '25%' }
    result[`${prefix}push-three-eighths`] = { left: '37.5%' }
    result[`${prefix}push-four-eighths`] = { left: '50%' }
    result[`${prefix}push-five-eighths`] = { left: '62.5%' }
    result[`${prefix}push-six-eighths`] = { left: '75%' }
    result[`${prefix}push-seven-eighths`] = { left: '87.5%' }
  }

  if (NodeConfig.gridSize >= 10) {
    result[`${prefix}push-one-tenth`] = { left: '10%' }
    result[`${prefix}push-two-tenths`] = { left: '20%' }
    result[`${prefix}push-three-tenths`] = { left: '30%' }
    result[`${prefix}push-four-tenths`] = { left: '40%' }
    result[`${prefix}push-five-tenths`] = { left: '50%' }
    result[`${prefix}push-six-tenths`] = { left: '60%' }
    result[`${prefix}push-seven-tenths`] = { left: '70%' }
    result[`${prefix}push-eight-tenths`] = { left: '80%' }
    result[`${prefix}push-nine-tenths`] = { left: '90%' }
  }

  if (NodeConfig.gridSize >= 12) {
    result[`${prefix}push-one-twelfth`] = { left: '8.33333%' }
    result[`${prefix}push-two-twelfths`] = { left: '16.66667%' }
    result[`${prefix}push-three-twelfths`] = { left: '25%' }
    result[`${prefix}push-four-twelfths`] = { left: '33.33333%' }
    result[`${prefix}push-five-twelfths`] = { left: '41.66667%' }
    result[`${prefix}push-six-twelfths`] = { left: '50%' }
    result[`${prefix}push-seven-twelfths`] = { left: '58.33333%' }
    result[`${prefix}push-eight-twelfths`] = { left: '66.66667%' }
    result[`${prefix}push-nine-twelfths`] = { left: '75%' }
    result[`${prefix}push-ten-twelfths`] = { left: '83.33333%' }
    result[`${prefix}push-eleven-twelfths`] = { left: '91.66667%' }
  }

  // Wrap in media query syntax if breakpoint sent
  if (breakpoint !== undefined) {
    const mediaQuerySyntax = `@media (--${breakpoint})`
    return { [mediaQuerySyntax]: result }
  } else {
    // No breakpoint, top-level only
    return result
  }
}

function buildAppearDelay (count) {
  let result = {}
  const baseTransform = 0.1
  const baseOpacity = 0.2

  for (let i = count; i > 0; i--) {
    let additional = Math.round((0.06 * i) * 100) / 100
    if (i === 1) {
      additional = 0
    }

    const amountTransform = Math.round((additional + baseTransform) * 100) / 100 + 's'
    const amountOpacity = Math.round((additional + baseOpacity) * 100) / 100 + 's'

    result['.appear-delay-' + i] =
      {
        'transition': `transform 1s cubic-bezier(0.165, 0.84, 0.44, 1) ${amountTransform}, opacity 1s cubic-bezier(0.165, 0.84, 0.44, 1) ${amountOpacity}`
      }
  }

  return result
}

export default {
  clearfix: {
    '&::after': {
      content: '""',
      display: 'table',
      clear: 'both'
    }
  },
  'grid-column-generator': function (mixin, breakpoint) {
    return buildGridClasses(breakpoint)
  },
  'grid-push-generator': function (mixin, breakpoint) {
    return buildPushClasses(breakpoint)
  },
  'responsive-display-helper': function (mixin, breakpoint) {
    return buildDisplayHelpers(breakpoint)
  },
  'animation-delay': function (mixin, count) {
    return buildAnimationDelay(count)
  },
  'appear-delay': function (mixin, count) {
    return buildAppearDelay(count)
  }
}
