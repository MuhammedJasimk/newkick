var express = require('express');
const { response } = require('../app');
var router = express.Router();
var adminHelper = require('../helpers/adminHelpers');
const userHelpers = require('../helpers/userHelpers');
var productHelper = require('../helpers/productHelper');
var userHelper = require('../helpers/userHelpers')
var categoryHelper = require('../helpers/categoryHelpers')
var multer = require('multer');
const { Db } = require('mongodb');
let moment = require('moment');
const { order } = require('paypal-rest-sdk');


const verifyLog = (req, res, next) => {
  if (req.session.adminLog) {
    next()
  } else {
    res.render('admin/login', { admin_link: true, logErrAd: req.session.logErrAd })
    req.session.logErrAd = false
  }
}

/* GET admin listing. */
router.get('/', function (req, res, next) {
  if (req.session.adminLog) {
    res.redirect('admin/index')
  } else {
    res.render('admin/login', { admin_link: true, logErrAd: req.session.logErrAd })
    req.session.logErrAd = false
  }

});

router.get('/index', verifyLog, async function (req, res, next) {
  var cod = await adminHelper.getcodtotal()
  var wallet = await adminHelper.getwallettotal()
  var razorpay = await adminHelper.getrazorpaytotal()
  var paypal = await adminHelper.getpaypaltotal()
  var totalsale = await adminHelper.gettotalsale()

  var Categorysales = await adminHelper.Categorysales()
  // console.log(sales);
  adminHelper.getpaymentmethod().then((paymentMethod) => {
    console.log(wallet);
    res.render('admin/index', { admin_link: true, admin_header: true, paymentMethod, cod, paypal, wallet, razorpay, totalsale, Categorysales })
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
});

router.get('/sales_report', async (req, res) => {
  var sales = await adminHelper.getSales()
  sales.map((sales)=>{
    console.log(sales.date);
    sales.date = moment(sales.date).format('MMMM Do YYYY, h:mm:ss a')
  })
  res.render('admin/sales_report', { admin_link: true, admin_header: true, sales })
})

router.post('/sales_resport_dateWise', async (req, res) => {
  var sales = await adminHelper.sales_resport_dateWise(req.body)
  sales.map((sales)=>{
    console.log(sales.date);
    sales.date = moment(sales.date).format('MMMM Do YYYY, h:mm:ss a')
  })
  res.render('admin/sales_report', { admin_link: true, admin_header: true, sales })
})



router.post('/login', (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.adminSignup
      req.session.adminLog = true
      res.redirect('/admin/index')
    } else {
      req.session.logErrAd = "Incorrect Username or Password";
      res.redirect('/admin')
    }
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })

})


router.get('/allUsers', verifyLog, (req, res) => {
  adminHelper.getUser().then((user) => {
    res.render('admin/allusers', { admin_link: true, admin_header: true, user })
    console.log(user);
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/blockUser/:id', (req, res) => {
  adminHelper.blockUser(req.params.id).then(() => {
    console.log(req.params.id);
    req.session.user = null;
    res.redirect('/admin/allUsers')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/activate/:id', (req, res) => {
  adminHelper.activateUser(req.params.id).then(() => {
    console.log(req.params.id);
    res.redirect('/admin/allUsers')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/addUser', verifyLog, (req, res) => {
  res.render('admin/addUser', { admin_header: true, admin_link: true, userErr: req.session.userErr })
  req.session.userErr = null
})

router.post('/addUser', (req, res) => {
  adminHelper.userAdd(req.body).then((response) => {
    if (response.err) {
      signupErr = response.err
      req.session.userErr = response.err
      res.redirect('/admin/addUser')
    } else {
      res.redirect('/admin/allUsers')
    }
  })
})


router.get('/allProduct', verifyLog, (req, res) => {
  productHelper.getAllproducts().then((product) => {
    res.render('admin/allProducts', { admin_header: true, admin_link: true, product })
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("stage 1");
    cb(null, './public/images/product')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + '--' + file.originalname)
  }
})
const upload = multer({ storage: fileStorageEngine })


router.get('/addProduct', verifyLog, (req, res) => {
  categoryHelper.getCategory().then((category) => {
    categoryHelper.getSubCategory().then((subcategory) => {
      categoryHelper.getsize().then((size) => {
        categoryHelper.getbrand().then((brand) => {
          categoryHelper.getcolor().then((color) => {
            res.render('admin/addProduct', { admin_header: true, admin_link: true, productAdded: req.session.proAdd, subcategory, category, size, color, brand })
            req.session.proAdd = false
          }).catch((error) => {
            res.render('/user/error', { user_link: true, user_header: true })
          })
        }).catch((error) => {
          res.render('/user/error', { user_link: true, user_header: true })
        })
      }).catch((error) => {
        res.render('/user/error', { user_link: true, user_header: true })
      })
    }).catch((error) => {
      res.render('/user/error', { user_link: true, user_header: true })
    })
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.post('/addProduct', upload.array('image', 4), function (req, res) {

  var filenames = req.files.map(function (file) {
    return file.filename;
  });
  req.body.status = true;
  req.body.image = filenames;
  // console.log(req.body);
  productHelper.addProduct(req.body).then(() => {
    req.session.proAdd = true
    res.redirect('/admin/addProduct')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })

});


router.get('/addCategory', verifyLog, (req, res) => {
  res.render('admin/addCategory', { admin_header: true, admin_link: true, category: req.session.category })
  req.session.category = false
  req.session.proAdd = false
})

//router.get('/allCategory', verifyLog, (req, res) => {
router.get('/allCategory', (req, res) => {
  categoryHelper.getCategory().then((category) => {
    res.render('admin/allCategory', { admin_header: true, admin_link: true, category })
    req.session.proAdd = false
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })

})


const fileStorageEnginecategory = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log("stage 1");
    cb(null, './public/images/categories')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + '--' + file.originalname)
  }
})

const uploadcategory = multer({ storage: fileStorageEnginecategory })
router.post('/addCategory', uploadcategory.array('image'), (req, res) => {
  var filenames = req.files.map(function (file) {
    return file.filename;
  });
  req.body.image = filenames;
  categoryHelper.addCategory(req.body).then(() => {
    req.session.category = true;
    res.redirect('/admin/addCategory')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.get('/blockProduct/:id', (req, res) => {
  console.log(req.params.id);
  productHelper.blockProduct(req.params.id).then(() => {
    res.redirect('/admin/allProduct')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.get('/unblockProduct/:id', (req, res) => {
  productHelper.unblockProduct(req.params.id).then(() => {
    res.redirect('/admin/allProduct')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/editproduct/:id', async (req, res) => {
  let product = await productHelper.getproductsByid(req.params.id)
  categoryHelper.getCategory().then((category) => {
      categoryHelper.getbrand().then((brand) => {
        categoryHelper.getSubCategory().then((subcategory) => {
            console.log(category);
            res.render('admin/editProduct', { admin_header: true, admin_link: true, subcategory, product, category, brand })
          })
        })
  })
})
router.post('/editProduct/:id', upload.array('image'), (req, res) => {
  var filenames = req.files.map(function (file) {
    return file.filename;
  });
  req.body.image = filenames;
  console.log(req.body);
  productHelper.editProduct(req.body, req.params.id).then(() => {
    res.redirect('/admin/allProduct')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.get('/catEdit/:id', async (req, res) => {

  let category = await categoryHelper.getCategorybyid(req.params.id)
  console.log(category);
  res.render('admin/catEdit', { admin_header: true, admin_link: true, category })
})


router.post('/editCategory/:id', uploadcategory.array('image'), (req, res) => {
  var filenames = req.files.map(function (file) {
    return file.filename;
  });
  req.body.image = filenames;
  console.log("1 st");
  categoryHelper.editCategory(req.params.id, req.body).then(() => {
    console.log(req.body);
    res.redirect('/admin/allCategory')
    // res.send("sdfghjkl")
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/logout', (req, res) => {
  req.session.adminLog = false;
  req.session.admin = false;
  res.redirect('/admin')
})

router.get('/Subcategory', (req, res) => {
  categoryHelper.getSubCategory().then((category) => {
    // res.render('admin/allCategory',{admin_header:true,admin_link:true ,category})
    res.render('admin/Subcategory', { admin_header: true, admin_link: true, category })
    req.session.proAdd = false
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.post('/addSubCategory', (req, res) => {
  console.log(req.body)
  categoryHelper.addSubCategory(req.body).then(() => {
    res.redirect('/admin/Subcategory')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})


router.post('/addcolor', (req, res) => {
  categoryHelper.addcolor(req.body).then(() => {
    res.redirect('/admin/Subcategory')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.post('/addbrand', (req, res) => {
  categoryHelper.addbrand(req.body).then(() => {
    res.redirect('/admin/Subcategory')
  })
    .catch((error) => {
      res.render('/user/error', { user_link: true, user_header: true })
    })
})

router.post('/addsize', (req, res) => {
  categoryHelper.addsize(req.body).then(() => {
    res.redirect('/admin/Subcategory')
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/orders', async (req, res) => {
  let Orders = await adminHelper.getUserOrders()
  console.log(Orders);
  Orders.map((Orders)=>{
    console.log(Orders.date);
    Orders.date = moment(Orders.date).format('MMMM Do YYYY, h:mm:ss a')
  })
  res.render('admin/orders', { admin_header: true, admin_link: true, Orders })
})

router.post('/updateOrderStatus', (req, res) => {
  // console.log(req.body);
  adminHelper.updateOrderStatus(req.body).then(() => {
    res.json({ status: true })
  })
})

router.get('/add_offer', async (req, res) => {
  var offer = await adminHelper.getoffer()
  console.log(offer);
  res.render('admin/add_offer', { admin_header: true, admin_link: true, offer })
})

router.post('/add_offer', (req, res) => {
  console.log(req.body);
  adminHelper.addOffer(req.body).then(() => {
    res.redirect('/admin/add_offer')
  })
})

router.get('/add_category_offer', (req, res) => {
  adminHelper.getAllCategory().then(async (category) => {
    var offer = await adminHelper.getoffer()
    console.log('category');
    console.log(category);
    res.render('admin/add_category_offer', { admin_header: true, admin_link: true, category, offer })
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.post('/addOffer', (req, res) => {
  console.log("post");
  adminHelper.addProductOffer(req.body).then((response) => {
    console.log(response);
    res.json(response)
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.post('/CancelOffer', (req, res) => {
  console.log("post");
  console.log(req.body);
  adminHelper.cancelProductOffer(req.body).then((response) => {
    console.log("hgjg");
    res.json(response)
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.post('/deleteCatOffer', (req, res) => {
  console.log("post");
  console.log(req.body);
  adminHelper.deleteCatOffer(req.body).then((response) => {
    console.log("hgjg");
    res.json(response)
  }).catch((error) => {
    res.render('/user/error', { user_link: true, user_header: true })
  })
})

router.get('/orderDetails/:id', async (req, res) => {
  let Orders = await adminHelper.getUserDetailOrder(req.params.id)
  Orders.map((Orders)=>{
    Orders.coupon=parseInt(Orders.coupon)
  })
  res.render('admin/orderDetails', { admin_header: true, admin_link: true, Orders })
})

router.get('/coupon', (req, res) => {
  res.render('admin/addcoupon', { admin_header: true, admin_link: true, added: req.session.coupon })
  req.session.coupon = null;
})

router.get('/coupon_used', async (req, res) => {
  console.log("admin cp");
  let usedcoupen = await adminHelper.coupenUsed()
  res.render('admin/coupon_used', { admin_header: true, admin_link: true, usedcoupen })
})


router.post('/createCoupon', (req, res) => {
  console.log(req.body);
  adminHelper.createCoupon(req.body).then((response) => {
    if (response.error) {
      req.session.coupon = "Existing coupon"
      res.redirect('/admin/coupon')
    } else {
      req.session.coupon = "Added Successfully"
      res.redirect('/admin/coupon')
    }
  })
})





// router.post
module.exports = router;