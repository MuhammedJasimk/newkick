

function addToCart(proId) {
	$.ajax({
		url: '/addToCart/' + proId,
		method: 'get',
		success: (response) => {
            // alert(response)
            if(response.status){
                let count = $('#cartCount').html()
                count =parseInt(count)+1
                $('#cartCount').html(count)
            }else{
                location.href = '/login'
            }
		}
	})
}


//function subcat(catId) {
	//$.ajax({
		//url: '/getsubcatProduct/'+catId,
		//method: 'get',
		//success: (response) => {
           // alert(response)
            // console.log(response)
             //$(".result").html(response);
           // var rslt = document.getElementById('rslt').value =response
		//}
	//})
//}

function changequantity(cartId, proId,userId, count) {
    console.log(proId,count,cartId)
    let quantity = parseInt(document.getElementById(proId).innerHTML)
    count = parseInt(count)
    $.ajax({
        url: '/changeProductCount',
        data: {
            user:userId,
            cart: cartId,
            product: proId,
            count: count,
            quantity: quantity,
        },
        method: 'post',
        success: (response) => {
            if (response.removeproduct) {
                //alert("product removed from cart")
                swal("product removed from cart");
                location.reload()
            } else {
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('subtotal').innerHTML=response.total.subTotal
                document.getElementById('grandtotal').innerHTML=response.total.total
                document.getElementById('tax').innerHTML=response.total.tax


            }
        }
    })
}

function deleteItem(cartId,proId){
    // console.log(cartId,proId);
    $.ajax({
        url: '/deleteProduct',
        data: {
            cart: cartId,
            product: proId
        },
        method: 'post',
        success: (response) => {
            console.log(response);
            console.log('response');
            if (response.removeproduct) {
                swal("product removed from cart")
                
                location.reload()
            } else {
               console.log("yes did it");
            }
        }
    })
}


function statusUpdate(val,orderId){
    console.log(val);
    $.ajax({
        url: '/admin/updateOrderStatus',
        data: {
            status:val,
            id:orderId,
        },
        method: 'post',
        success: (response) => {
            if (response.status) {
                alert("Status Changed")
                location.reload()
            } else {
               console.log("yes did it");
            }
        }
    })
}

  
