const search = new EcomSearch()
const EcomPassport = require('@ecomplus/passport-client');
const client = EcomPassport.ecomPassport.getCustomer();   



window.messageBullet = function(message) {
  const container = document.getElementById('message-container');
  
  // Create a new div for the message
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  messageElement.textContent = message;
  
  // Append the new message to the container
  container.appendChild(messageElement);
  
  // Trigger fadeIn effect
  setTimeout(() => {
    messageElement.classList.add('fade-in');
  }, 10);  // Small delay to allow the DOM to update

  // Wait 3 seconds, then trigger fadeOut
  setTimeout(() => {
    messageElement.classList.remove('fade-in');
    messageElement.classList.add('fade-out');
    
    // Remove the message element after fadeOut transition (500ms)
    setTimeout(() => {
      messageElement.remove();
    }, 500);
  }, 3000);
}


document.addEventListener("DOMContentLoaded", function() {
  updateClientInfo();
  $('body').on('.wishlist','click', function() {
    setTimeout(() => {
      updateClientInfo();
    }, 2000);
  });
 
});

async function updateClientInfo(){
let client = await EcomPassport.ecomPassport.getCustomer();   
  console.log('updateClientInfo',client)
  if(client.display_name){
    $('[data-client_name]').text(client.display_name);
    $('[data-favorite_count]').text(client.favorites.length || 0);
  }
  console.log('client name',client)
}

window.updateClientInfo = updateClientInfo;

window.equalProductNameSize = function() {
  const productNames = document.querySelectorAll('.card-product .name-product');
  let maxHeight = 0;
  //console.log('equalProductNameSize', productNames.length);
  productNames.forEach(name => {
    const height = name.offsetHeight;
    if (height > maxHeight) {
      maxHeight = height;
    }
  });

  if (maxHeight > 0) {
    document.documentElement.style.setProperty('--productNameHeight', `${maxHeight}px`);
  }
  //console.log('equalProductNameSize', maxHeight);
};


$('body').on('click','#favorites-quickview button[data-product-id]', function(){
  toggleFavorite($(this).data(`product-id`), EcomPassport.ecomPassport)
  $(this).closest(`.item`).remove();
});