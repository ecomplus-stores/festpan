import _ecomPassport from '@ecomplus/passport-client'

const toggleFavorite = async (productId, ecomPassport = _ecomPassport) => {  
  const customer = ecomPassport.getCustomer()
  const search = new EcomSearch()
  
  if(customer.display_name){
    //console.log('logado')
    // Usuário logado - código existente
    const favorites = customer.favorites || []
    const isFavorite = await checkFavorite(productId, ecomPassport)
    
    if (!isFavorite) {
      favorites.push(productId)
      window.messageBullet(`Adicionado aos favoritos`)
    } else {
      const favIndex = favorites.indexOf(productId)
      favorites.splice(favIndex, 1)
      window.messageBullet(`Removido dos favoritos`)
    }
  
    ecomPassport.requestApi('/me.json', 'patch', { favorites })   
    search.setProductIds(favorites).fetch().then(result => {
      $(`.favorite-count`).text(result.hits.hits.length)
    })

    return !isFavorite
  } else {
    //console.log('não logado')
    // Usuário não logado - versão corrigida
    let localFavorites = localStorage.getItem(`apxLocalFavorites`)
    if(localFavorites){
      localFavorites = JSON.parse(localFavorites)
    } else {
      localFavorites = []
    }

    // Verifica se o produto já é favorito usando a lista atual
    const isFavorite = localFavorites.includes(productId)
    //console.log('isFavorite', isFavorite, localFavorites)
    if (!isFavorite) {
      //console.log('isFavorite1', isFavorite, localFavorites)
      // Adiciona aos favoritos
      localFavorites.push(productId)
      window.messageBullet(`Adicionado aos favoritos`)
    } else {
      //console.log('isFavorite2', isFavorite, localFavorites)
      // Remove dos favoritos
      const favIndex = localFavorites.indexOf(productId)
      localFavorites.splice(favIndex, 1)
      window.messageBullet(`Removido dos favoritos`)
    }
    
    localStorage.setItem(`apxLocalFavorites`, JSON.stringify(localFavorites))

    // Atualiza contagem
    search.setProductIds(localFavorites).fetch().then(result => {
      $(`.favorite-count`).text(result.hits.hits.length)
      //console.log('favorite-search', result.hits.hits.length)
      if(result.hits.hits.length == 0){          
        $(`.favorites__body`).html('<p class="m-4 text-center h5 font-small d-block">Ops... você não adicionou nenhum produto a sua lista de favoritos</p>');
      }
    })
    //console.log('isFavorite3', !isFavorite, localFavorites)
    return !isFavorite
  }
}
const checkFavorite = (productId, ecomPassport) => {
  //console.log('checkFavorite', productId)
  const customer = ecomPassport.getCustomer()
  if(customer.display_name){
    const { favorites } = ecomPassport.getCustomer()
    
    return favorites && favorites.includes(productId)
  }else{
    //////console.log('b',productId)

    let localFavorites = localStorage.getItem(`apxLocalFavorites`)
    if(localFavorites == null){
      localFavorites = []
      
    }else{
      localFavorites = JSON.parse(localFavorites)
    }
    
    return localFavorites && localFavorites.includes(productId)
  }  
}

export { toggleFavorite, checkFavorite }