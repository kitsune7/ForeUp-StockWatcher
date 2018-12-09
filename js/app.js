/**
 * Author: Christopher Bradshaw
 * JS Coding style: Standard (https://standardjs.com/)
 */
/* global fetch */

(function () {
  'use strict'

  const baseApiUrl = 'https://api.iextrading.com/1.0/stock/market/batch'
  const symbols = 'GOOG,AIG,GRPN'

  function verifyBatchJSON (json) {
    const symbols = Object.entries(json)
    const requiredFields = [
      'companyName',
      'low',
      'high',
      'latestPrice',
      'change',
      'changePercent'
    ]

    symbols.map(symbolEntry => {
      if (!symbolEntry[1].hasOwnProperty('quote')) {
        throw new Error('Invalid API response')
      }

      requiredFields.map(field => {
        if (!symbolEntry[1].quote.hasOwnProperty(field)) {
          throw new Error(`Response JSON missing field ${field}.`)
        }
      })
    })

    return json
  }

  function getBatchData () {
    fetch(`${baseApiUrl}?symbols=${symbols}&types=quote`)
      .then(response => response.json())
      .then(json => verifyBatchJSON(json))
      .then(json => {
        const symbols = Object.entries(json)
        const stocks = document.getElementById('stocks')

        document.getElementsByClassName('loading')[0].style.display = 'none'

        if (symbols.length === 0) {
          stocks.innerHTML = '<h2>No stocks yet!</h2>'
        }

        stocks.innerHTML = `${symbols.map(symbolEntry => {
          const symbol = symbolEntry[0]
          const quote = symbolEntry[1].quote
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
      })
      .catch(error => {
        console.log(error)
      })
  }
  getBatchData()
}())
