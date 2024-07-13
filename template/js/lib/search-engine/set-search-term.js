import * as merge from 'lodash.merge'
import query from '@ecomplus/search-engine/src/lib/dsl'

export default (self, term) => {
  const arr = (term || '').split(' ')
  const arrayLength = arr.length
  /* const removeChar = (arr) => { 
    if (arr.length === 1) {
      return arr[0].replace(/(es)|s$/g, '')
    }
  } */
  const fromTo = (arr) => {
    const newArr = arr.map(word => {
        const lower = word.toLowerCase()
        switch (lower) {
          case 'prateleiras':
            return 'prateleira'
          default:
            return lower
        }
    })
    /*
    if (arr.length === 2) {
      switch(arr[0] + ' ' + arr[1]) {
        case 'cake board':
          return 'cakeboard'
        case 'papel chumbo':
          return 'folha chumbo'
      }
    }
    if (arr.length === 3) {
      switch(arr[0] + ' ' + arr[1] + ' ' + arr[2]) {
        case 'manga de confeitar':
        case 'saco de confeiteiro':
        case 'manga de confeiteiro':
          return 'saco de confeitar'
      }
    }
    */
    return newArr.join(' ')
  }
  // match name and/or keyword with term
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-multi-match-query.html
  const listOfTerms = ['silicone', 'prateleira']
  if (!listOfTerms.includes(term)) {
    const sort = query.sort.slice()
    const relevanceSortIndex = sort.findIndex(s => s.ad_relevance)
    sort.splice(relevanceSortIndex, 1)
    self.dsl.sort = sort
  }
  // console.log(self)
  // const modifiedTerm = fromTo(arr)
  const finalTerm = /* modifiedTerm || */ term
  self.mergeFilter({
    multi_match: {
      query: finalTerm,
      type: finalTerm.length > 2 ? 
        arrayLength > 1 
          ? 'most_fields' 
          : 'best_fields' 
          : 'phrase_prefix',
      fields: [
        'name',
        'keywords',
        'skus'
      ]
    }
  }, 'must')
  
  merge(self.dsl, {
    // handle terms suggestion
    // 'did you mean?'
    // https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html
    suggest: {
      text: term,
      words: {
        term: {
          field: 'name'
        }
      }
    }
  })
  return self
}

/**
 * @method
 * @name EcomSearch#setSearchTerm
 * @description Defines term to match with product name
 * and/or keywords on next search request.
 *
 * @param {string} term - Term to be searched
 * @returns {self}
 *
 * @example

// Set new search term
search.setSearchTerm('smartphone')

 * @example

// Set new term and run search request
search.setSearchTerm('notebook').fetch()

 */
