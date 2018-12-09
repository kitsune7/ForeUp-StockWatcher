/**
 * Author: Christopher Bradshaw
 * JS Coding style: Standard (https://standardjs.com/)
 */
/* global fetch */

(function () {
  'use strict'

  const symbols = {} // Maps symbol name to quote object

  // Click handlers
  document.stockAdd.onsubmit = (event) => {
    const inputElement = document.stockAdd.querySelector(`input[type='text']`)
    const loadingIcon = document.querySelector('.loading')

    event.preventDefault()
    loadingIcon.style.display = 'block'
    inputElement.value = inputElement.value.toUpperCase()

    getSymbolData(inputElement.value)
    loadingIcon.style.display = 'none'
  }

  function displayError (message) {
    const errorElement = document.querySelector('p.error')
    errorElement.innerText = message
    errorElement.style.display = 'block'
  }

  function clearError () {
    const errorElement = document.querySelector('p.error')
    errorElement.innerText = ''
    errorElement.style.display = 'none'
  }

  function verifyBatchJSON (json) {
    const requiredFields = [
      'change',
      'changePercent',
      'companyName',
      'high',
      'latestPrice',
      'low',
      'symbol'
    ]
    const fields = Object.keys(json)

    requiredFields.map(field => {
      if (fields.indexOf(field) === -1) {
        throw new Error(`Response JSON missing field ${field}.`)
      }
    })

    return json
  }

  function getSymbolData (symbol) {
    fetch(`https://api.iextrading.com/1.0/stock/${symbol}/quote`)
      .then(response => {
        if (response.status === 404) {
          const error = 'Unknown symbol. Maybe you mistyped it?'
          displayError(error)
          throw Error(error)
        }

        return response
      })
      .then(response => response.json())
      .then(json => verifyBatchJSON(json))
      .then(json => addSymbol(json))
      .catch(error => {
        console.log(error)
      })
  }

  function addSymbol (symbolObject) {
    const stocks = document.getElementById('stocks')

    if (symbols.hasOwnProperty(symbolObject.symbol)) {
      displayError(`You've already added this symbol.`)
      return
    }

    clearError()
    stocks.classList.remove('empty')
    symbols[symbolObject.symbol] = symbolObject

    const symbolEntries = Object.entries(symbols)
    stocks.innerHTML = `${symbolEntries.map(symbolEntry => {
      const symbol = symbolEntry[0]
      const quote = symbolEntry[1]
      const arrowTop = ((1 - (quote.latestPrice - quote.low) / (quote.high - quote.low)) * 100).toFixed(2)

      return `
        <li>
          <div class="primary-stock-content">
            <div>
              <h3>${quote.companyName}</h3>
              <h4>${symbol}</h4>
            </div>
            <div>
              <p class="change ${(quote.change >= 0) ? 'positive' : 'negative'}">
                ${(quote.change >= 0) ? '&#x25B2;' : '&#x25BC;'} ${quote.change}
                (${(quote.changePercent * 100).toFixed(2)}%)
              </p>
              <p class="price">$${quote.latestPrice.toFixed(2)}</p>
            </div>
          </div>
          <div class="priceRange">
            <div class="line">
                <div class="arrow" style="top: calc(${arrowTop}% - .5 * var(--arrow-height));">&#x25B6;</div>
            </div>
            <p>$${quote.high.toFixed(2)}</p>
            <p>$${quote.low.toFixed(2)}</p>
          </div>
        </li>
      `
    }).join('')}`
  }
}())
