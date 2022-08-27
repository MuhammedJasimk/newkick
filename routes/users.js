var express = require('express');
const session = require('express-session');
const { Db } = require('mongodb');
const { response, resource } = require('../app');
const categoryHelpers = require('../helpers/categoryHelpers');
const productHelper = require('../helpers/productHelper');
var router = express.Router();
var paypal = require('paypal-rest-sdk');
var userHelper = require('../helpers/userHelpers')
var categoryHelper = require('../helpers/categoryHelpers')
let moment=require('moment')


// let user_session=req.session.user
let cartcount = 0

const verifyLog = (req, res, next) => {
  let cartcount = 0
  if (req.session.user) {
    next()
  } else {
    productHelper.getFeaturproducts().then((product) => {
         console.log(product);
     categoryHelpers.getCategory().then((category) => {
       res.render('user/index', { user_link: true, user_header: true, product, category, cartcount });
      })
   }).catch((err)=>{
    res.render('user/error', { user_link: true, user_header: true})
    console.log(err);
   })
  }
}

const verifyLogTwo = (req, res, next) => {
  let cartcount = 0
  if (req.session.user) {
    next()
  } else {

    res.render('user/login', { user_link: true, user_header: true ,signup:req.session.signupsuccess});
  }
}

/* GET users listing. */
router.get('/', verifyLog, async function (req, res, next) {
  req.session.signupsuccess=null;
  let cartcount = await userHelper.getCartCount(req.session.user._id)
  productHelper.getFeaturproducts().then((product) => {
    categoryHelpers.getCategory().then((category) => {
      res.render('user/index', { user_link: true, user_header: true, login: req.session.user, product, category, cartcount });
    })
  }).catch((err)=>{
    res.render('user/error', { user_link: true, user_header: true})
    console.log(err);
   })
});



router.get('/login', (req, res, next) => {
  var signupsuccess =req.session.signupsuccess
  res.render('user/login', { user_nav_bg: true, user_link: true, user_header: true, logerr: req.session.logerrUser, activeErr: req.session.activeErr ,signupsuccess})
  req.session.logerrUser = false
  req.session.activeErr = false
  req.session.signupsuccess =false
})

router.get('/logout', (req, res) => {
  req.session.user = false;
  res.redirect('/')
})

router.post('/login', (req, res, next) => {
  userHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user
      console.log("log");
      res.redirect('/allproducts')
    } else if (!response.blockErr) {
      req.session.activeErr = true
      res.redirect('/login')
    }
    else {
      req.session.logerrUser = "Enter valid email and password";
      res.redirect('/login')
    }
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/register', (req, res, next) => {
  res.render('user/signUp', { user_link: true, user_header: true, login: req.session.user, signUperr: req.session.signUpErr })
  req.session.signUpErr = false
})

let signUpdata;
router.post('/userSignup', (req, res, next) => {
  // sendTextMessage()
  req.body.active = true
  userHelper.doSignup(req.body).then((response) => {
    console.log("otp check");
    console.log(response);
    if (response.status) {
      signUpdata = response
      console.log('otp');
      console.log(signUpdata);
      res.redirect('/otp')
    }

    else if (response.err) {
      req.session.signUpErr = "Enter valid mobile number and email"
      res.redirect('/register')
    }
    else {
      res.redirect('/')
    }
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/otp', (req, res) => {
  res.render('user/otp', { user_link: true, user_header: true, })
})

router.post('/submit', (req, res) => {
  console.log("submit");
  console.log(req.body);
  console.log(signUpdata);
  userHelper.otp(req.body, signUpdata).then((response) => {
    if (response.status) {
      req.session.signupsuccess ="Account Created Successfully";
      res.redirect('/login')
    } else {
      res.redirect('/otp')
    }
  })
})

router.get('/allproducts', async (req, res) => {
  console.log("try");
  console.log("try2");
  if (req.session.user) {
    console.log('sesssion');
    let cartcount = await userHelper.getCartCount(req.session.user._id)
    let category = await categoryHelpers.getCategory()
    let subcat = await categoryHelper.getSubCategory()
    console.log("sub");
    console.log(subcat);
    productHelper.getproducts().then((product) => {
      res.render('user/allProducts', { user_link: true, user_header: true, login: true, product, cartcount, subcat, category })
    })
  } else {
    console.log('else');
    let subcat = await categoryHelper.getSubCategory()
    let category = await categoryHelpers.getCategory()
    productHelper.getproducts().then((product) => {
      res.render('user/allProducts', { user_link: true, user_header: true, product, cartcount, subcat, category })
    })
  }
})


router.get('/categoryview/:id', async (req, res) => {
  console.log(req.params.id);
  let category = await categoryHelpers.getCategory()
  let subcat = await categoryHelper.getSubCategory()
  productHelper.productCat(req.params.id).then((product) => {
    res.render('user/allProducts', { user_link: true, user_header: true, login: true, product, cartcount, subcat, category })
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/product_detail/:id', async (req, res) => {
  if (req.session.user) {
    let category = await categoryHelpers.getCategory()
    let cartcount = await userHelper.getCartCount(req.session.user._id)
    var productDetail = await productHelper.getproductDetail(req.params.id, req.body)
    console.log(productDetail.Name);
    console.log("hhd");
    productHelper.getFeaturproducts().then((product) => {
      res.render('user/product-detaile', { user_link: true, user_header: true, product,category, login: req.session.user, productDetail, product, cartcount, })
    }).catch((error) => {
      res.render('/user/error', { user_link: true, user_header: true })
    })
  }

  var productDetail = await productHelper.getproductDetail(req.params.id, req.body)
  console.log(productDetail.Name);
  let category = await categoryHelpers.getCategory()
  productHelper.getFeaturproducts().then((product) => {
    res.render('user/product-detaile', {category, user_link: true, user_header: true, productDetail, product, cartcount })
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.get('/addToCart/:id', verifyLogTwo, (req, res) => {

  userHelper.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })

  })
})

router.get('/cart', verifyLogTwo, async (req, res) => {
  // if (req.session.user) {
  let cartcount = await userHelper.getCartCount(req.session.user._id)
  if (cartcount >= 1) {
    let total = await userHelper.getTotalAmount(req.session.user._id)
    let product = await userHelper.getCart(req.session.user._id)
    // console.log(getWallet);
    console.log(total);
    total.tax =parseInt(total.tax)
    let category = await categoryHelpers.getCategory()
    res.render('user/addToCart', {category, user_link: true, user_header: true, login: req.session.user, product, notempty: true, total, cartcount })
  } else {
    res.render('user/addToCart', {user_link: true, user_header: true, login: req.session.user })
  }
  // } else {
  //   res.render('user/addToCart', { user_link: true, user_header: true })
  // }
})

router.post('/changeProductCount', (req, res, next) => {
  console.log(req.body);
  console.log("test");
  userHelper.chengeProductCount(req.body).then(async (response) => {
    response.total = await userHelper.getTotalAmount(req.body.user)
    if (response.total) {
      response.total.shipping = 50
      response.total.total = response.total.shipping + response.total.total
      res.json(response)
    }
    // console.log(response.total.shipping);

  })
})


router.post('/deleteProduct', (req, res, next) => {
  userHelper.deleteItem(req.body).then((response) => {
    console.log(response);
    console.log('response');
    res.json(response)
  })
})


router.get('/placeOrder', verifyLogTwo, async (req, res) => {
  console.log(req.body);

  let address = await userHelper.getAddress(req.session.user._id)

  let total = await userHelper.getTotalAmount(req.session.user._id)

  let getWallet = await userHelper.getWallet(req.session.user._id)
  console.log(total);
  let category = await categoryHelpers.getCategory()
  total.tax = parseInt(total.tax)
  res.render('user/place-order', {category, user_link: true, user_header: true, total, address, login: req.session.user, user: req.session.user, getWallet })
})

router.post('/placeOrder', async (req, res) => {
  console.log(req.body);
  let product = await userHelper.getCartProductList(req.body.userId)
  let total = await userHelper.getTotalAmount(req.body.userId)
  let checkcoup = await userHelper.checkcoup(req.body.userId)
  let coupen = await userHelper.check_Coupen(checkcoup.coupon)
  let category = await categoryHelpers.getCategory()
  console.log("hsdbsnkms");
  console.log(checkcoup);
  total = total.total

  if (checkcoup.coupon) {
    discount = total / 100 * coupen.rate
    total = parseInt(total - discount)
  }

  console.log("after");
  console.log(total);

  userHelper.placeOrder(req.body, product, total, checkcoup).then(async (orderId) => {

    if (req.body.payment_method_wlt === 'wallet') {
      var response = await userHelper.checkWallet()
      if (response.amount >= total) {
        let newWalletAmount = response.amount - total;
        console.log("newWalletAmount");
        console.log(newWalletAmount);
        userHelper.changePaymentStatus_wlt(orderId, req.session.user._id)
        console.log('amnt');
        userHelper.changeWalletAmount(req.session.user._id, newWalletAmount)
        console.log("fnl");
        response.wallet = true;
        res.json(response)
      } else {
        console.log("else");
        total = total - response.amount;
        userHelper.addwalletAmnt(orderId, response.amount)
        console.log(total);
        req.session.wallet = true
      }
    }
    if (req.body.payment_method === 'COD') {
      console.log("COD");
      userHelper.changePaymentStatus_cod(orderId, req.session.user._id)
      res.json({ codSuccess: true })
    } else if (req.body.payment_method === 'razorepay') {
      console.log("razorepay");
      parseInt(total)
      userHelper.generateRazorpay(orderId, total).then((response) => {
        response.razorepay = true;
        res.json(response)
      })
    } else if (req.body.payment_method === 'paypal') {
      console.log(req.body);
      console.log("paypal");
      req.session.otAmount = parseInt(total)
      req.session.orderId = orderId
      console.log(req.session.orderId);
      userHelper.generatePaypal(orderId, total).then((response) => {
        console.log(response);
        res.json(response)
      })
    }
  }).catch((error) => {
    res.render('/user/error', { category, user_link: true, user_header: true })
  })
}),

  router.post('/userAddress', (req, res) => {
    userHelper.addAddress(req.session.user._id, req.body).then(() => {
      res.json({ status: true })
    })
  })

router.get('/orderSuccess', verifyLogTwo, async (req, res) => {
  let category = await categoryHelpers.getCategory()
  res.render('user/orderSuccess', {category, user: req.session.user })
})

router.get('/orders', verifyLogTwo, async (req, res) => {
  let Orders = await userHelper.getUserOrders(req.session.user._id)
Orders.map((Orders)=>{
  console.log(Orders.date);
  Orders.date = moment(Orders.date).format('MMMM Do YYYY')
})

  //console.log(Orders.date);
  let category = await categoryHelpers.getCategory()
  res.render('user/orders', {category, user_link: true, user_header: true, login: req.session.user, Orders })
})

router.get('/viewOrderProduct/:id', verifyLogTwo, async (req, res) => {
  let category = await categoryHelpers.getCategory()
  let order = await userHelper.getOrder(req.params.id)
  console.log(order.coupon);
  // if (order.coupon) {
    //var product = await userHelper.getOrderProduct(req.params.id)
    var product = await userHelper.getOrderProductN(req.params.id)
    var subtotal = await userHelper.subtotal(req.params.id)
    var totalamount = product[0].totalAmount
    var discount = (product[0].tax + subtotal[0].subtotal) -totalamount
    discount= parseInt(discount)
    product.map((product)=>{
      product.tax= parseInt(product.tax)
      product.total= parseInt(product.total)
      product.discounted= parseInt(product.discounted)
    })
    
  res.render('user/viewOrderProduct', {category, user_link: true, user_header: true,subtotal, login: req.session.user, product, totalamount,discount })


})

router.get('/cancelOrder/:id', verifyLogTwo, (req, res) => {
  userHelper.cancelOrder(req.params.id, req.session.user._id)
  res.redirect('/orders')
})

router.get('/returnproduct/:id', verifyLogTwo, (req, res) => {
  userHelper.returnproduct(req.params.id, req.session.user._id)
  res.redirect('/orders')
})

router.get('/profile', verifyLogTwo, async (req, res) => {
  let category = await categoryHelpers.getCategory()
  try {
    let userAddress = await userHelper.getAddress(req.session.user._id)
    let userData = await userHelper.getUserData(req.session.user._id)
    let getWallet = await userHelper.getWallet(req.session.user._id)
    console.log(userAddress);
    res.render('user/profile', {category, user_link: true, user_header: true, login: req.session.user, userAddress, userData, getWallet })
  } catch (error) {
    res.render('/user/error', {category, user_link: true, user_header: true })
  }

})

router.get('/editProfile', verifyLogTwo, async (req, res) => {
  let userData = await userHelper.getUserData(req.session.user._id)
  let userAddress = await userHelper.getAddress(req.session.user._id)
  let category = await categoryHelpers.getCategory()
  res.render('user/Editprofile', {category, user_link: true, user_header: true, login: req.session.user, userAddress, userData })
})

router.get('/editPassword', async(req, res) => {
  let category = await categoryHelpers.getCategory()
  res.render('user/changePassword', {category, user_link: true, user_header: true, login: req.session.user, logErr: req.session.logErr })
  req.session.logErr = false
})

router.post('/editpassword',async (req, res) => {
  let category = await categoryHelpers.getCategory()
  userHelper.changePassword(req.session.user._id, req.body).then((response) => {
    console.log('response');
    console.log(response);
    if (response.status) {
      res.redirect('/profile')
    } else {
      req.session.logErr = "Enter valid data"
      res.redirect('/editPassword')
    }

  }).catch((error) => {
    res.render('/user/error', {category, user_link: true, user_header: true })
  })
})

router.post('/editProfile', verifyLogTwo, (req, res) => {
  userHelper.EditUser(req.body, req.session.user).then((response) => {
    if (response.err) {
      res.redirect('/profile')
    } else {
      res.redirect('/profile')
    }
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/address', verifyLogTwo, async (req, res) => {
  let userAddress = await userHelper.getAddress(req.session.user._id)
  let userData = await userHelper.getUserData(req.session.user._id)
  let category = await categoryHelpers.getCategory()
  console.log(userData);
  if (userAddress.length == 0) {
    res.render('user/address', {category, user_link: true, user_header: true, login: req.session.user, noData: true })
  } else {
    res.render('user/address', {category, user_link: true, user_header: true, login: req.session.user, userAddress, userData })
  }
})

router.get('/removeAddress/:id', verifyLog, (req, res) => {
  console.log("dsjjhkjds");
  userHelper.removeAddress(req.params.id).then((response) => {
    res.json({ status: true })
  })
})

router.get('/editAddress/:id', verifyLogTwo, async (req, res) => {
  let addressDetail = await userHelper.getAddressDetail(req.params.id)
  let category = await categoryHelpers.getCategory()
  res.render('user/editAddress', {category, user_link: true, user_header: true, login: req.session.user, addressDetail })

})

router.post('/editAddress/:id', (req, res) => {
  userHelper.editAddress(req.params.id, req.body).then(() => {
    console.log("set");
    res.redirect('/profile')
  })
})

router.post('/verify_payment', (req, res) => {
  console.log(req.body);
  if (req.session.wallet) {
    userHelper.clearwallet(req.session.user._id)
    req.secure.wallet = null
  }
  userHelper.verifyPayment(req.body).then(() => {
    console.log(req.body['receipt']);
    userHelper.changePaymentStatus(req.body['order[receipt]'], req.session.user._id).then(() => {
      console.log("Success");
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: 'Payment Faild' })
    res.json({ status: false, errMsg: '' })
  })
})


router.get('/getsubcatProduct/:subId/:catId', async (req, res) => {
  console.log("fghjkl");
  console.log(req.params.subId);
  console.log(req.params.catId);
  let category = await categoryHelpers.getCategory()
  let subcat = await categoryHelper.getSubCategory()
  categoryHelper.getSubCategoryItem(req.params.subId, req.params.catId).then((product) => {
    res.render('user/cat_wise_pro_list', { user_link: true, user_header: true, login: req.session.user, product, subcat, category })
  })
})


router.get('/success', async (req, res) => {

  if (req.session.wallet) {
    userHelper.clearwallet(req.session.user._id)
    req.secure.wallet = null
  }

  userHelper.changePaymentStatus(req.session.orderId, req.session.user._id).then(() => {
    console.log("aa");
    // console.log(tAmount);
    console.log(req.session.otAmount);
    var amount = req.session.otAmount
    console.log(amount);

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": "" + amount,
        },
      }]
    };
    // console.log("mmmmmmm");

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log("err");
        console.log(error.response);
        throw error;
      } else {
        console.log("Create Payment Response");
        console.log(payment);
        res.redirect('/orderSuccess')
      }
    });
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/productInvoice/:id/:item', async (req, res) => {
  console.log(req.params.item);
  console.log(req.params.id);
  let category = await categoryHelpers.getCategory()
  let order = await userHelper.getOrder(req.params.id)
  console.log(order);
  if (order.coupon) {
    var proData = await userHelper.productInvoice_d(req.params.id,req.params.item)
  } else {
    var proData = await userHelper.productInvoice(req.params.id,req.params.item)
   
  
   
    proData.discounted=0;
  }

  proData.tax = parseInt(proData.tax)
    proData.discounted = parseInt(proData.discounted)

  res.render('user/product_invoice', {category, user_link: true, user_header: true, login: req.session.user, proData })

})

router.get('/checkWallet/:id', (req, res) => {
  console.log(req.params.id);
  userHelper.checkWallet().then((response) => {
    if (req.params.id > response.amount) {
      response.walletE = true
      res.json(response)
    } else {
      console.log(response);
      res.json(response)
    }

  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })

})



router.post('/addcoupon', (req, res) => {
  console.log(req.body);
  userHelper.checkCoupen(req.body, req.session.user._id).then(async (response) => {

    if (response.a) {
      let total = await userHelper.getTotalAmount(req.session.user._id)
      let discount = total.total * parseInt(response.a.rate) / 100
      let amount = total.total - discount
      console.log(amount);
      console.log('amount');
      response.finalAmount = amount
      res.json(response)
    } else {
      res.json(response)
    }

  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.get('/forgotPassword', async(req, res) => {
  let category = await categoryHelpers.getCategory()
  res.render('user/forgotPassword', {category, user_link: true, user_header: true, err: req.session.pwErr })
  req.session.pwErr = null;
})

let PWdata;
let mob;
router.post('/forgotpassword', (req, res) => {
  mob = req.body.mob
  console.log(req.body);
  userHelper.checkmobile(req.body).then((response) => {
    if (response.err) {
      console.log('err');
      req.session.pwErr = "Enter valid mobile number"
      res.redirect('/forgotPassword')
    } else if (response.status) {
      PWdata = response
      res.render('user/pw_otp', { user_link: true, user_header: true })
    } else {

    }
  })
})

router.post('/Pw_submit', (req, res) => {
  console.log(req.body);
  console.log(signUpdata);

  userHelper.PW_otp(req.body, PWdata).then((response) => {
    if (response.status) {
      res.render('user/new_Pw', { user_link: true, user_header: true })
    } else {
      res.redirect('/otp')
    }
  })
})

router.post('/newPw', (req, res) => {
  console.log(mob);
  console.log(req.body);
  userHelper.updatepassword(mob, req.body).then(() => {
    res.redirect('/login')
  })
})




module.exports = router;
