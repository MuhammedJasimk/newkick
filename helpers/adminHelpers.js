var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt');
const { ObjectID, ObjectId } = require('bson');
const { connect } = require('../routes');
const { response, prependListener, map } = require('../app');

module.exports = {
    doLogin: (adminData) => {
        console.log(adminData);
        return new Promise(async (resolve, reject) => {
            let loginstatus = false
            let response = {}
            let adminSignup = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
            if (adminSignup) {
                bcrypt.compare(adminData.password, adminSignup.Password).then((status) => {
                    if (status) {
                        console.log('login success');
                        resolve(response)
                        response.status = true
                        response.admin = adminSignup
                    } else {
                        console.log('login fail');
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login fail');
                resolve({ status: false })
            }
        })
    },

    getUser: () => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(user)
        })
    },
    blockUser: (userId) => {
        console.log(userId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { active: false } }).then((response) => {
                resolve()
            })
        })

    },
    activateUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { active: true } }).then((response) => {
                resolve()
            })
        })
    },

    userAdd: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            var userSignup = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            let response = {};
            if (userSignup) {
                response.err = "Mail is alredy Used"
                resolve(response)
            } else if (userData.Email == '' || userData.Password == '' || userData.Username == '') {
                response.err = "Fill the form"
                resolve(response)
            } else {
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data)
                })
            }
        })
    },

    // getUserOrders: () => {
    //     return new Promise(async (resolve, reject) => {
    //         let orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
    //         resolve(orders)
    //     })
    // },

    getUserOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $lookup: {
                        from: collection.DELIVERYADDRESS_COLLECTION,
                        localField: 'address',
                        foreignField: '_id',
                        as: 'address'
                    }
                },
                {
                    $project: {
                        cancelled: 1, paymentmethod: 1,Wallet:1, totalAmount: 1, status: 1, date: 1, address: { $arrayElemAt: ['$address.addressDetail', 0] }
                    }
                },
                {
                    $sort: { date: -1 }
                }
                ,{
                    $project: {
                        paymentmethod: 1,Wallet:1, totalAmount: 1, status: 1, date: 1, cancelled: 1, address:1,
                        total:{
                            $cond: { if: "$Wallet", then: 
                            { $subtract: [{ $toInt: "$totalAmount" }, '$Wallet'] }
                            , else:"$totalAmount"} 
                       }
                    }
                },
            ]).toArray()
            console.log(orders);
            resolve(orders)
        })
    },


    updateOrderStatus: (data) => {
        // console.log("jagsh");
        console.log(data);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(data.id) }, { $set: { status: data.status } }).then((response) => {
                resolve()
            })
        })
    },

    getpaymentmethod: () => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).distinct("paymentmethod").then((response) => {
                console.log(response);
                resolve(response)
            })
        })
    },

    getcodtotal: () => {
        return new Promise(async (resolve, reject) => {
            var codtotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: { paymentmethod: "COD" }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $toInt: '$totalAmount' } },
                    }
                },
            ]).toArray()
            resolve(codtotal[0])
        })
    },

    getwallettotal: () => {
        return new Promise(async (resolve, reject) => {
            var wallet = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: { paymentmethod: "Wallet" }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $toInt: '$totalAmount' } },
                    }
                },
            ]).toArray()
            resolve(wallet[0])
        })
    },

    getrazorpaytotal: () => {
        return new Promise(async (resolve, reject) => {
            var codtotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: { paymentmethod: "razorepay" }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' },
                    }
                },
            ]).toArray()
            resolve(codtotal[0])
        })
    },
    getpaypaltotal: () => {
        return new Promise(async (resolve, reject) => {
            var codtotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $match: { paymentmethod: "paypal" }
                },
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $toInt: '$totalAmount' } },
                    }
                },
            ]).toArray()
            resolve(codtotal[0])
        })
    },

    gettotalsale: () => {
        console.log("totot");
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: '$product'
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$totalAmount" }
                    }
                }
            ]).toArray()
            console.log(total[0]);
            resolve(total[0])
        })

    },

    getSales: () => {
        return new Promise(async (resolve, reject) => {

            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        product: "$product.item._id", 
                        qty: '$product.quantity',
                        name: '$product.item.Name',
                        date: '$date',
                        user: '$userId',
                        coupon:'$coupon',
                        image:'$product.item.image',
                        price: '$product.item.price',
                        discounted_price: '$product.item.discounted_price',
                        
                    }
                },
                {
                        $lookup: {
                            from: collection.USER_COLLECTION,
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.COUPON_COLLECTION,
                            localField: 'coupon',
                            foreignField: 'coupon_name',
                            as: 'coupon'
                        }
                    },
                    {
                        $unwind:'$user'
                    },
                    {
                        $project:{
                            product: 1, 
                            qty: 1,
                            name: 1,
                            couponrate:{ $arrayElemAt: ['$coupon.rate', 0] },
                            discounted_price:1,
                            date: 1,
                            address: 1,
                            coupon:1,
                            image:1,
                            price:1,
                            userName: "$user.Username",
                            Email: "$user.Email",
                        }
                    },
                    {
                        $project:{
                                product: 1, 
                                qty: 1,
                                name: 1,
                                couponrate:1,
                                discounted_price:1,
                                date: 1,
                                address: 1,
                                coupon:1,
                                image:1,
                                price:1,
                                userName:1,
                                Email:1,
                                coupon:{
                                    $cond: { if: "$couponrate", then: 
                                    {$multiply: [{ $divide: [{ $toInt: "$discounted_price" }, 100] }, { $toInt:"$couponrate" }] }
                                    , else:0} 
                               }
                           
                        }
                    },
                    {
                        $project:{
                                product: 1, 
                                qty: 1,
                                name: 1,
                                couponrate:1,
                                discounted_price:1,
                                date: 1,
                                address: 1,
                                coupon:1,
                                image:1,
                                price:1,
                                userName:1,
                                Email:1,
                                coupon:1,
                                //Total:{ $subtract: [{ $toInt: "$total" }, '$discounted'] },
                                Total: { $multiply: [{ $subtract: [{ $toInt: "$discounted_price" }, { $toInt: "$coupon" }] }, { $toInt: "$qty" }] },
                           
                        }
                    }
                   
               
            ]).toArray()
            console.log(sales[0]);
            console.log(sales);
            resolve(sales)

        })

    },

    sales_resport_dateWise: (data) => {

        console.log(data);
        start = new Date(data.start)
        end = new Date(data.end)
        console.log(start);
        console.log(end);
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {

                    $match: { date: { $gte: data.start, $lte: data.end } }
                },
                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        product: "$product.item._id", 
                        qty: '$product.quantity',
                        name: '$product.item.Name',
                        date: '$date',
                        user: '$userId',
                        coupon:'$coupon',
                        image:'$product.item.image',
                        price: '$product.item.price',
                        discounted_price: '$product.item.discounted_price',
                        
                    }
                },
                {
                        $lookup: {
                            from: collection.USER_COLLECTION,
                            localField: 'user',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.COUPON_COLLECTION,
                            localField: 'coupon',
                            foreignField: 'coupon_name',
                            as: 'coupon'
                        }
                    },
                    {
                        $unwind:'$user'
                    },
                    {
                        $project:{
                            product: 1, 
                            qty: 1,
                            name: 1,
                            couponrate:{ $arrayElemAt: ['$coupon.rate', 0] },
                            discounted_price:1,
                            date: 1,
                            address: 1,
                            coupon:1,
                            image:1,
                            price:1,
                            userName: "$user.Username",
                            Email: "$user.Email",
                        }
                    },
                    {
                        $project:{
                                product: 1, 
                                qty: 1,
                                name: 1,
                                couponrate:1,
                                discounted_price:1,
                                date: 1,
                                address: 1,
                                coupon:1,
                                image:1,
                                price:1,
                                userName:1,
                                Email:1,
                                coupon:{
                                    $cond: { if: "$couponrate", then: 
                                    {$multiply: [{ $divide: [{ $toInt: "$discounted_price" }, 100] }, { $toInt:"$couponrate" }] }
                                    , else:0} 
                               }
                           
                        }
                    },
                    {
                        $project:{
                                product: 1, 
                                qty: 1,
                                name: 1,
                                couponrate:1,
                                discounted_price:1,
                                date: 1,
                                address: 1,
                                coupon:1,
                                image:1,
                                price:1,
                                userName:1,
                                Email:1,
                                coupon:1,
                                //Total:{ $subtract: [{ $toInt: "$total" }, '$discounted'] },
                                Total: { $multiply: [{ $subtract: [{ $toInt: "$discounted_price" }, { $toInt: "$coupon" }] }, { $toInt: "$qty" }] },
                           
                        }
                    }

            ]).toArray()
            console.log(sales);
            console.log(sales[0]);
            resolve(sales)
        })
    },



    Categorysales: () => {

        return new Promise(async (resolve, reject) => {
            let Categorysales = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        category: "$product.item.category",
                    }
                },
                // {
                //     $lookup: {
                //         from: collection.PRODUCT_COLLECTION,
                //         localField: "item",
                //         foreignField: '_id',
                //         as: "product"
                //     }
                // },
                // {
                //     $project: {
                //         item: 1, product: { $arrayElemAt: ['$product', 0] }
                //     }
                // },
                // {
                //     $project: {
                //         category: "$product.category"

                //     }
                // },
                {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        localField: "category",
                        foreignField: '_id',
                        as: "Category"
                    }
                },
                {
                    $project: {
                        Category: { $arrayElemAt: ['$Category', 0] }
                    }
                },
                {
                    $project: {
                        category: "$Category.Categoryname"
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 }
                    }

                },
                {
                    $sort: { _id: 1 }
                }


            ]).toArray()
            console.log(Categorysales);
            resolve(Categorysales)
        })
    },

    addOffer: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.OFFER_COLLECTION).insertOne(data).then(() => {
                resolve()
            })
        })
    },

    getoffer: () => {
        return new Promise(async (resolve, reject) => {
            var offer = await db.get().collection(collection.OFFER_COLLECTION).find().toArray()
            resolve(offer)
        })
    },

    addProductOffer: (data) => {
        console.log(data);
        var catId = data.catId
        return new Promise(async (resolve, reject) => {
            let response = {}
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: ObjectId(data.catId) }).toArray()
            console.log(product);

            product.map(async (product) => {
                var price = product.price;
                var disprice = product.discounted_price;
                console.log(price);
                console.log(disprice);
                console.log(data.offer);
                var discounted_price = product.price * data.offer / 100
                let discountedPrice = {}
                discountedPrice = parseInt(product.price - discounted_price)
                console.log(discountedPrice);
                await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: ObjectId(product._id) },
                    {
                        $set: {
                            discounted_price: discountedPrice, OffAmount: data.offer, OfferName: data.OfferName, offer: true
                        }
                    }
                )

                db.get().collection(collection.CATEGORY_COLLECTION).updateMany({ _id: ObjectId(catId) },
                    {
                        $set: {
                            OffAmount: data.offer, OfferName: data.OfferName, offer: true
                        }
                    }
                )
            })
            response.status = true;
            resolve(response)
        })
    },
    getUserDetailOrder: (id) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(id) }
                },
                {
                    $unwind: "$product",
                    // $unwind: "$quantity"

                },

                {
                    $project: {
                        item: '$product.item',
                        Name: '$product.item.Name',
                        price: '$product.item.price',
                        address: '$product.item.address',
                        image: '$product.item.image',
                        discounted_price:'$product.item.discounted_price',
                        quantity: '$product.quantity',
                        coupon: '$product.coupon',
                        totalAmount: 1,
                        userId: 1,
                        address: 1,
                        cancelled: 1,
                        coupon:1,
                        
                    }
                },
                {
                    $lookup: {
                        from: collection.DELIVERYADDRESS_COLLECTION,
                        localField: 'address',
                        foreignField: '_id',
                        as: 'address'
                    }
                },
                {
                    $lookup: {
                        from: collection.COUPON_COLLECTION,
                        localField: 'coupon',
                        foreignField: 'coupon_name',
                        as: 'coupon'
                    }
                },
                {
                    $project: {
                        address: { $arrayElemAt: ['$address', 0] },
                        couponOff:{ $arrayElemAt: ['$coupon.rate', 0] },
                        totalAmount: 1,
                        item: 1,
                        Name:1,
                        cancelled: 1,
                        quantity: 1,
                        price: 1,
                        discount_price: 1,
                        image:1,
                        coupon:1,
                        Name: 1,
                        discounted_price:1,
                        total: { $sum: { $multiply: [{ $toInt: '$product.discounted_price' }, { $toInt: '$quantity' }] } },
                        address: "$address.addressDetail.address",
                        mobile: "$address.addressDetail.mobile",
                        email: "$address.addressDetail.email",
                        pinCode: "$address.addressDetail.pinCode",
                        street: "$address.addressDetail.street",
                        country: "$address.addressDetail.country",
                        total: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, { $toInt: "$quantity" }] } },
                    }
                },
                {
                    $project: {
                        address: 1, couponOff:1,totalAmount: 1,item: 1,Name:1,cancelled: 1,quantity: 1,price: 1,discount_price: 1,
                        image:1,coupon:1,Name: 1,discounted_price:1,total: 1,address:1,mobile:1,email:1,pinCode:1,street:1,country: 1,
                        coupon:{
                             $cond: { if: "$coupon", then: 
                             {$multiply: [{ $divide: [{ $toInt: "$discounted_price" }, 100] }, { $toInt:"$couponOff" }] }
                             , else:0} 
                        }
                    }
                },
                {
                    $project: {
                        address: 1, couponOff:1,totalAmount: 1,item: 1,Name:1,cancelled: 1,quantity: 1,price: 1,discount_price: 1,
                        image:1,coupon:1,Name: 1,discounted_price:1,total: 1,address:1,mobile:1,email:1,pinCode:1,street:1,country: 1,
                        final:{
                             $cond: { if: "$coupon", then:
                             { $subtract: [{ $toInt: "$total" }, { $toInt: '$coupon' }] }
                             , else:"$total"} 
                        }
                    }
                },
            ]).toArray()
            console.log(orders);
            resolve(orders)
        })
    },


    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },

    cancelProductOffer: (data) => {
        let response = {}
        console.log(data);
        console.log("endoo");
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).update({ _id: ObjectId(data.proId) },
                { $set: { OffAmount: false, OfferName: false, offer: false } }
            ).then(async () => {
                let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: ObjectId(data.proId) }).toArray()
                console.log(product);
                product.map(async (product) => {
                    var price = product.price
                    await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ _id: ObjectId(product._id) },
                        {
                            $set: {
                                discounted_price: price,
                                OffAmount: null,
                                OfferName: null,
                                offer: null,
                            }
                        }
                    )
                })
                response.status = true
                resolve(response)
            })
        })
    },

    deleteCatOffer: (id) => {
        console.log(id);
        console.log(id.proId);
        return new Promise(async (resolve, reject) => {
            let response = {}
            let offer = await db.get().collection(collection.OFFER_COLLECTION).findOne({ _id: ObjectId(id.proId) })
            console.log(offer);
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ OfferName: offer.Offername }).toArray()
            console.log("product");
            console.log(product);
            db.get().collection(collection.OFFER_COLLECTION).deleteOne({ _id: ObjectId(id.proId) })
            console.log("dlt");
            product.map(async (product) => {
                var price = product.price
                console.log(price);
                await db.get().collection(collection.PRODUCT_COLLECTION).updateMany({ OfferName: offer.Offername },
                    {
                        $set: {
                            discounted_price: price,
                            OffAmount: null,
                            OfferName: null,
                            offer: null,
                        }
                    }
                )
                console.log("llll");

            })
            db.get().collection(collection.CATEGORY_COLLECTION).updateMany({ OfferName: offer.Offername },
                {
                    $set: {
                        OffAmount: null,
                        OfferName: null,
                        offer: null,
                    }
                }
            )
            response.status = true
            resolve(response)
        })
    },

    createCoupon: (data) => {
        console.log(data);
        let response = {}
        console.log(data);
        return new Promise(async(resolve, reject) => {
            let coupon =await db.get().collection(collection.COUPON_COLLECTION).findOne({coupon_name: data.coupon_name })
            console.log(coupon);
            if (coupon) {
                console.log("err coupon");
                response.error = true
                resolve(response)
            } else {
                db.get().collection(collection.COUPON_COLLECTION).insertOne(data).then(() => {
                    resolve(response)
                })
            }
        })
    },
    
    coupenUsed: () => {
        return new Promise(async (resolve, reject) => {
            let coupenUsed = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $project: {
                        coupon: 1,
                        status: { $ne: ["$coupon", null] },
                        userId: 1
                    }
                },
                {
                    $match: { status: true }
                },
                {
                    $lookup: {
                        from: collection.COUPON_COLLECTION,
                        localField: 'coupon',
                        foreignField: 'coupon_name',
                        as: 'coupon'
                    }
                }, {
                    $project: {
                        userId: 1,
                        coupon: { $arrayElemAt: ['$coupon', 0] },
                    }
                }, {
                    $lookup: {
                        from: collection.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        user: { $arrayElemAt: ['$user', 0] },
                        userId: 1,
                        coupon: '$coupon.coupon_name',
                        rate: '$coupon.rate',
                    }
                }
            ]).toArray()
            console.log(coupenUsed);
            // console.log(coupenUsed[0]);
            resolve(coupenUsed)

        })

    }
}

