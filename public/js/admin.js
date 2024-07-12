const deleteProduct = (btn) => {
    const productId = btn.parentNode.querySelector('[name=productId]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
    
    const productElement = btn.closest('article');

    fetch('/admin/product/' + productId, {
        method: 'DELETE',
        headers: {
            'csrf-token': csrf,
        }
    })
    .then((result) => {
        console.log('Success!');
        console.log(result);
        //productElement.remove(); // works on modern browsers only 
        productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => {
        console.log('Error!');
        console.log(err);
    });
}