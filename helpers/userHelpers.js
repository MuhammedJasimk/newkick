var db = require('../config/connection')
var collection = require('../config/collection')
var otpp = require('../config/otp')

const bcrypt = require('bcrypt')
var Razorpay = require('razorpay')
var paypal = require('paypal-rest-sdk');
const { response, use } = require('../app')
const { ObjectId } = require('mongodb')
const { resolve } = require('path')


console.log(otpp.accountSid);
console.log(otpp.authToken);
console.log(otpp.serviceSID);

const client = require('twilio')(otpp.accountSid, otpp.authToken)


var instance = new Razorpay({
    key_id: 'rzp_test_z7AuC90c1sj1kE',
    key_secret: 'VTI4EM9hAxdj6cYOBEBqJV3N',
});

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'Abuoz1yST0ONoUbxDPdkThZPKiw4Kj4I2Sf982i3TMY0SYf6yxWtCoDNGfLGom4Hk9HWQIqy3uA3Y-ZL',
    'client_secret': 'EMFm-AZgNaXasNDsNz-euaeY4YBJLQO7Ci7VaqxWfz662efK9HY1n9eH9EsKGa1iQKU2YBqH2epQJv9Q'
});

module.exports = {
    // doSignup: (userData) => {

    //     return new Promise(async (resolve, reject) => {
    //         let response = {};
    //         userData.Password = await bcrypt.hash(userData.Password, 10)
    //         let userSignup = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
    //         if (userSignup) {
    //             response.err = true
    //             resolve(response)
    //         } else {

    //             db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
    //                 let wallet = {
    //                     user:data.insertedId,
    //                     amount:0,
    //                 }
    //                 db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)
    //                 console.log(data.insertedId);
    //                 resolve(data);
    //             })
    //         }
    //     })
    // },
    doSignup: (userData) => {
        console.log(userData);
        console.log('userData');
        console.log();

        return new Promise(async (resolve, reject) => {
            let response = {};
            userData.Password = await bcrypt.hash(userData.Password, 10)
            let usermail = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            let usermobile = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber: userData.mobileNumber })
            if (usermail || usermobile) {
                console.log("fsklm");
                response.status = false;
                response.err = true
                resolve(response)
            } else {
                console.log("respo");
                userData.status = true;
                response = userData
                console.log(response);
                console.log('start');
                console.log(otpp.serviceSID);
                console.log(userData.mobileNumber);
                client.verify.services(otpp.serviceSID).verifications
                    .create({
                        to: `+91${userData.mobileNumber}`,
                        channel: 'sms',
                    })
                    .then((data) => {

                    })
                console.log('resolve check');
                console.log(response);
                resolve(response)
            }
        })


    },

    otp: (otp, userData) => {
        console.log("set");
        console.log(userData);
        return new Promise((resolve, reject) => {
            console.log("inside promise");
            console.log(userData.mobileNumber);
            console.log(otp.otp);
            console.log(otpp.serviceSID);

            client.verify.services(otpp.serviceSID).verificationChecks
                .create({
                    to: `+91${userData.mobileNumber}`,
                    code: otp.otp
                }).then((data) => {

                    console.log('data');
                    console.log(data);
                    if (data.status == 'approved') {
                        db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                            let wallet = {
                                user: data.insertedId,
                                amount: 0,
                            }
                            db.get().collection(collection.WALLET_COLLECTION).insertOne(wallet)
                            console.log(data.insertedId);
                            resolve({ status: true });
                        })
                    } else {
                        resolve({ status: false })
                    }
                })
        })
    },

    doLogin: (userData) => {
        try {
            return new Promise(async (resolve, reject) => {
                let loginstatus = false
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
                let checkUser = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email, active: true })
                if (user) {
                    if (checkUser) {
                        bcrypt.compare(userData.Password, user.Password).then((status) => {
                            console.log("active true");
                            response.active = true
                            if (status) {
                                console.log('login success');
                                response.status = true
                                response.user = user
                                resolve(response)
                            } else {
                                console.log('login fail');
                                resolve({ blockErr: true })
                            }
                        })
                    } else {
                        console.log("active false");
                        resolve({ credentialsErr: true })
                    }

                } else {
                    console.log('login fail');
                    resolve({ status: false })
                }
            })
        } catch (error) {
            console.log(error);
        }

    },

    getWallet: (id) => {
        try {
            return new Promise(async (resolve, reject) => {
                let wallet = await db.get().collection(collection.WALLET_COLLECTION).findOne({ user: ObjectId(id) })
                console.log("hfdcskj,");
                console.log(wallet);
                resolve(wallet.amount)
            })
        } catch (error) {
            console.log(error);
        }
        // console.log(id);

    },

    addToCart: (proId, userId) => {
        try {
            return new Promise(async (resolve, reject) => {

                let proObj = {
                    item: ObjectId(proId),
                    quantity: 1
                }

                let userCart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: ObjectId(userId) })
                if (userCart) {
                    let proExist = userCart.product.findIndex(product => product.item == proId)
                    if (proExist != -1) {
                        // console.log("Ex");
                        db.get().collection(collection.CART_COLLECTON).updateOne({ user: ObjectId(userId), 'product.item': ObjectId(proId) },
                            { $inc: { 'product.$.quantity': 1 } }
                        ).then(() => {
                            resolve()
                        })
                    } else {
                        db.get().collection(collection.CART_COLLECTON).updateOne({ user: ObjectId(userId) },
                            {
                                $push: { product: proObj }
                            }
                        ).then((response) => {
                            resolve()
                        })
                    }
                } else {
                    let cartObj = {
                        user: ObjectId(userId),
                        product: [proObj]
                    }

                    db.get().collection(collection.CART_COLLECTON).insertOne(cartObj).then((response) => {
                        resolve()
                    })
                }
            })
        } catch (error) {
            console.log(error);
        }

    },
    getCart: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let cartItems = await db.get().collection(collection.CART_COLLECTON).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $project: {
                            item: '$product.item',
                            quantity: '$product.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }

                    },
                ]).toArray()
                console.log(cartItems);
                resolve(cartItems)
            })
        } catch (error) {
            console.log(error);
        }

    },

    getCartCount: (userId) => {
        try {
            let count = 0
            return new Promise(async (resolve, reject) => {
                let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: ObjectId(userId) })
                if (cart) {
                    count = cart.product.length
                }
                resolve(count)
            })
        } catch (error) {
            reject(error)
        }

    },

    chengeProductCount: (details) => {
        try {
            details.count = parseInt(details.count)
            details.quantity = parseInt(details.quantity)

            return new Promise((resolve, reject) => {
                if (details.count == -1 && details.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTON)
                        .updateOne({ _id: ObjectId(details.cart) },
                            {
                                $pull: { product: { item: ObjectId(details.product) } }
                            }
                        ).then((response) => {
                            resolve({ removeproduct: true })
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTON)
                        .updateOne({ _id: ObjectId(details.cart), 'product.item': ObjectId(details.product) },
                            {
                                $inc: { 'product.$.quantity': details.count }
                            }
                        ).then((response) => {
                            resolve({ status: true })
                        })
                }

            })
        } catch (error) {
            console.log(error);
        }

    },

    deleteItem: (data) => {
        try {
            console.log('try');
            return new Promise((resolve, reject) => {
                db.get().collection(collection.CART_COLLECTON).updateOne({ _id: ObjectId(data.cart) },
                    {
                        $pull: { product: { item: ObjectId(data.product) } }
                    }
                ).then((response) => {
                    console.log(response);
                    resolve({ removeproduct: true })
                })
            })
        } catch (error) {
            console.log(error);
        }

    },

    getTotalAmount: (userId) => {
        try {
            console.log("ccchhheee");
            console.log(userId);
            return new Promise(async (resolve, reject) => {
                let total = await db.get().collection(collection.CART_COLLECTON).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$product'
                    },

                    {
                        $project: {
                            item: '$product.item',
                            quantity: '$product.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            subTotal: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.discounted_price' }] } },
                        }
                    },

                    {
                        $project: {
                            subTotal: 1,
                            tax: { $multiply: ['$subTotal', 0.01] },
                        },
                    },
                    {
                        $project: {
                            subTotal: 1, tax: 1,
                            total: { $sum: { $sum: [{ $toInt: '$subTotal' }, { $toInt: '$tax' }] } }
                        }
                    },

                    {
                        $project: {
                            subTotal: 1, tax: 1,
                            total: 1
                        },
                    }

                ]).toArray()
                console.log("yessss");
                console.log(total[0]);
                resolve(total[0]);
            })
        } catch (error) {
            console.log(error);
        }

    },

    placeOrder: (order, product, total, checkcoup) => {
        console.log(product);
        try {
            console.log(product);
            return new Promise(async (resolve, reject) => {
                const date = new Date();
                let proarray = product.map((product) => {
                    return product.item
                })
                console.log(proarray);
                let item = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: { $in: proarray } }).toArray()
                console.log(item);
                for (let i = 0; i < product.length; i++) {
                    product[i].item = item[i]

                }
                // console.log(order, product, total);
                //let status = order.payment_method === 'COD' ? 'placed' : 'pending'
                let orderObj = {
                    userId: ObjectId(order.userId),
                    paymentmethod: order.payment_method,
                    product: product,
                    coupon: checkcoup.coupon,
                    totalAmount: total,
                    status: ' pending',
                    date: date.toISOString(),
                    //date: new Date(),
                    //status:pending,
                    address: ObjectId(order.address),
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    resolve(response.insertedId)
                })
            })
        } catch (error) {
            console.log(error);
        }


    },


    // placeOrder: (order, product, total,checkcoup) => {

    //     if (checkcoup.coupon){
    //         db.get()collection
    //     }
    // console.log(product);
    //     return new Promise((resolve, reject) => {
    //         const date = new Date();
    //         // console.log(order, product, total);
    //         let status = order.payment_method === 'COD' ? 'placed' : 'pending'
    //         let orderObj = {
    //             userId: ObjectId(order.userId),
    //             paymentmethod: order.payment_method,
    //             product: product,
    //             totalAmount: total,
    //             status: status, 
    //             date: date.toLocaleString(),
    //             //date: new Date(),
    //             address: ObjectId(order.address),
    //         }
    //         db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
    //             db.get().collection(collection.CART_COLLECTON).deleteOne({ user: ObjectId(order.userId) })
    //             resolve(response.insertedId)
    //         })
    //     })
    // },



    getCartProductList: (userId) => {
        try {
            console.log(userId);
            return new Promise(async (resolve, reject) => {
                let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: ObjectId(userId) })
                // console.log(cart);
                resolve(cart.product)
            })
        } catch (error) {
            console.log(error);
        }

    },
    checkcoup: (userId) => {
        try {
            console.log(userId);
            return new Promise(async (resolve, reject) => {
                let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: ObjectId(userId) })
                // console.log(cart);
                resolve(cart)
            })
        } catch (error) {
            console.log(error);
        }

    },

    getCartList: (userId) => {
        try {
            console.log(userId);
            return new Promise(async (resolve, reject) => {
                let cart = await db.get().collection(collection.CART_COLLECTON).findOne({ user: ObjectId(userId) })
                // console.log(cart);
                resolve(cart)
            })
        } catch (error) {
            console.log(error);
        }

    },

    // getUserOrders:(userId)=>{
    //     return new Promise (async(resolve,reject)=>{
    //         let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId:ObjectId(userId)}).sort({date:-1}).toArray()
    //         resolve(orders)
    //     }) 
    // },

    getUserOrders: (userId) => {
        try {
            return new Promise(async (resolve, reject) => {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: ({ userId: ObjectId(userId) })

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
                        $project: {
                            paymentmethod: 1, Wallet: 1, totalAmount: 1, status: 1, date: 1, cancelled: 1, address: { $arrayElemAt: ['$address.addressDetail', 0] },
                            total: {
                                $cond: {
                                    if: "$Wallet", then:
                                        { $subtract: [{ $toInt: "$totalAmount" }, '$Wallet'] }
                                    , else: "$totalAmount"
                                }
                            }
                        }
                    },

                    {
                        $sort: { date: -1 }
                    }
                ]).toArray()
                console.log('orders');
                console.log(orders);
                resolve(orders)
            })
        } catch (error) {
            console.log(error);
        }

    },

    getOrder: (id) => {
        try {
            console.log(id);
            return new Promise(async (resolve, reject) => {
                db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(id) }).then((data) => {
                    console.log(data);
                    resolve(data)
                })
            })
        } catch (error) {
            console.log(error);
        }

    },
    // getOrderdt: (id) => {

    //     console.log(id);
    //     return new Promise(async (resolve, reject) => {
    //       let order =await  db.get().collection(collection.ORDER_COLLECTION).findOne({_id: ObjectId(id) })
    //             resolve(order)
    //         })
    // },

    getOrderProductN: (orderId) => {
        try {
            console.log(orderId);
            return new Promise(async (resolve, reject) => {
                let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { _id: ObjectId(orderId) }
                    },
                    {
                        $unwind: "$product",
                        // $unwind: "$quantity"

                    },

                    {
                        $project: {
                            id: '$product.item._id',
                            Name: '$product.item.Name',
                            image: '$product.item.image',
                            discounted_price: '$product.item.discounted_price',
                            price: '$product.item.price',
                            quantity: '$product.quantity',
                            totalAmount: 1,
                            paymentmethod: 1,
                            coupon: 1,

                        }
                    },

                    // {
                    //     $project:{
                    //         Name:1,
                    //         id:1,
                    //         image:1,
                    //         discounted_price:1,
                    //         price:1,
                    //         quantity:1,
                    //         totalAmount:1,
                    //         paymentmethod:1,
                    //         total: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, { $toInt: '$quantity' }] } },
                    //         tax: { $sum: { $multiply: ['$totalAmount', 0.01] } },
                    //     }
                    // },
                    {
                        $project: {
                            Name: 1,
                            id: 1,
                            image: 1,
                            discounted_price: 1,
                            price: 1,
                            quantity: 1,
                            totalAmount: 1,
                            paymentmethod: 1,
                            coupon: 1,
                            ProTotal: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, { $toInt: '$quantity' }] } }
                        }
                    },
                    {
                        $project: {
                            Name: 1,
                            id: 1,
                            image: 1,
                            discounted_price: 1,
                            price: 1,
                            quantity: 1,
                            totalAmount: 1,
                            paymentmethod: 1,
                            coupon: 1,
                            ProTotal: 1,
                            tax: { $sum: { $multiply: ['$totalAmount', 0.01] } },
                        }
                    },
                    {
                        $lookup: {
                            from: collection.COUPON_COLLECTION,
                            localField: 'coupon',
                            foreignField: 'coupon_name',
                            as: 'coupons'
                        }
                    },
                    {
                        $project: {
                            Name: 1,
                            id: 1,
                            image: 1,
                            discounted_price: 1,
                            price: 1,
                            quantity: 1,
                            totalAmount: 1,
                            paymentmethod: 1,
                            coupon: 1,
                            ProTotal: 1,
                            tax: 1,
                            coupon: { $arrayElemAt: ['$coupons', 0] },
                            //             discount:{
                            //         $cond: { if:{ $ne: [ "$coupon", null ] }, then: 
                            //         { $discount: [{ $toInt: "$totalAmount" }, '$Wallet'] }
                            //         , else:0
                            //     } 
                            //    }
                        }
                    },
                    {
                        $project: {
                            Name: 1,
                            id: 1,
                            image: 1,
                            discounted_price: 1,
                            price: 1,
                            quantity: 1,
                            totalAmount: 1,
                            paymentmethod: 1,
                            coupon: 1,
                            ProTotal: 1,
                            tax: 1,
                            coupon: 1,
                        }
                    },

                ]).toArray()
                console.log(orderItems);
                resolve(orderItems)
            })
        } catch (error) {
            console.log(error);
        }

    },

    subtotal: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let subtotal = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(orderId) }
                },
                {
                    $unwind: "$product",
                    // $unwind: "$quantity"

                },
                {
                    $project: {
                        id: '$product.item._id',
                        quantity: '$product.quantity',
                        price: '$product.item.price',
                        discounted_price: '$product.item.discounted_price',
                        coupon: 1,
                    }
                }, {
                    $group: {
                        _id: null,
                        subtotal: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, { $toInt: '$quantity' }] } }

                    }
                }
            ]).toArray()
            console.log(subtotal);
            resolve(subtotal)
        })
    },


    cancelOrder: (orderId, userId) => {
        console.log(orderId, userId);
        console.log(orderId);
        return new Promise(async (resolve, reject) => {
            let totalamount = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { status: "cancelled", cancelled: true } })
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { totalAmount: 0 } })
            console.log(totalamount.totalAmount);
            console.log(totalamount.paymentmethod);
            if (totalamount.paymentmethod != "COD" && totalamount.status != " pending") {
                console.log("Not cod");
                if (totalamount.totalAmount > 1) {
                    console.log("+0");
                    db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) }, { $inc: { amount: totalamount.totalAmount } })
                } else {
                    console.log("0");
                    db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) }, { $set: { amount: totalamount.totalAmount } })
                }
                console.log(totalamount.totalAmount);
            } else {
                console.log("cod sds");
            }

        })


    },
    returnproductk: (orderId, userId) => {
        console.log(orderId, userId);
        console.log(orderId);
        return new Promise(async (resolve, reject) => {
            let totalamount = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: ObjectId(orderId) })
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { status: "Returned", cancelled: true } })
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) }, { $set: { totalAmount: 0 } })
            console.log(totalamount.totalAmount);
            console.log(totalamount.paymentmethod);
            if (totalamount.paymentmethod != "COD" && totalamount.status != " pending") {
                console.log("Not cod");
                if (totalamount.totalAmount > 1) {
                    console.log("+0");
                    db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) }, { $inc: { amount: totalamount.totalAmount } })
                } else {
                    console.log("0");
                    db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(userId) }, { $set: { amount: totalamount.totalAmount } })
                }
                console.log(totalamount.totalAmount);
            } else {
                console.log("cod sds");
            }

        })


    },

    addAddress: (userId, data) => {

        return new Promise((resolve, reject) => {
            let userDataObj = {
                addressDetail: {
                    mobile: data.phone,
                    email: data.email,
                    address: data.address,
                    pinCode: data.pin,
                    street: data.street,
                    country: data.country,
                },
                userId: ObjectId(userId),
            }
            db.get().collection(collection.DELIVERYADDRESS_COLLECTION).insertOne(userDataObj).then((response) => {
                resolve(response)
            })
        })
    },

    getAddress: (userId) => {

        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.DELIVERYADDRESS_COLLECTION)
                .find({ userId: ObjectId(userId) }).toArray()
            // console.log(address[0]);
            resolve(address)
        })
    },

    EditUser: (userData, user) => {

        return new Promise(async (resolve, reject) => {
            console.log("1 st ");
            if (userData.Email == user.Email) {
                console.log("same Email");
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(user._id) },
                    {
                        $set: {
                            Username: userData.Username,
                            Email: userData.Email,
                            mobileNumber: userData.mobileNumber,
                        }

                    }).then((data) => {
                        resolve(data);
                    })
            } else {
                console.log("Not same Email");
                let response = {};
                let userDataEdit = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
                if (userDataEdit) {
                    response.err = true
                    resolve(response)
                } else {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(user._id) },
                        {
                            $set: {
                                Username: userData.Username,
                                Email: userData.Email,
                                mobileNumber: userData.mobileNumber,
                            }
                        }
                    ).then((data) => {
                        resolve(data);
                    })
                }
            }
        })
    },

    getUserData: (id) => {

        return new Promise(async (resolve, reject) => {
            let userData = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(id) })
            resolve(userData)
        })
    },

    removeAddress: (id) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.DELIVERYADDRESS_COLLECTION).deleteOne({ _id: ObjectId(id) }).then((response) => {
                resolve(response)
            })
        })
    },

    getAddressDetail: (id) => {

        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.DELIVERYADDRESS_COLLECTION).findOne({ _id: ObjectId(id) })
            resolve(address)
        })
    },

    editAddress: (id, data) => {

        console.log(id);
        console.log(data);
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.DELIVERYADDRESS_COLLECTION).updateOne({ _id: ObjectId(id) },
                {
                    $set: {
                        addressDetail: {
                            address: data.address,
                            pinCode: data.pin,
                            street: data.street,
                            country: data.country
                        }
                    }
                }
            )
        }).then(() => {
            resolve()
        })
    },


    editAddress: (id, data) => {

        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.DELIVERYADDRESS_COLLECTION).updateOne({ _id: ObjectId(id) },
                {
                    $set: {
                        addressDetail: {
                            address: data.address,
                            pinCode: data.pin,
                            street: data.street,
                            country: data.country,
                            email: data.email,
                            mobile: data.phone,
                        }
                    }
                }
            ).then(() => {
                resolve()
            })

        })
    },

    generateRazorpay: (orderId, total) => {
        total = parseInt(total)
        console.log("check");
        console.log(orderId, total);
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId,
            }).then((data) => {
                console.log(data);
                resolve(data)
            }).catch((error) => {
                console.error(error)
                // error
            })
        })
    },

    verifyPayment: (details) => {

        return new Promise((resolve, reject) => {
            var crypto = require('crypto');
            var hmac = crypto.createHmac('sha256', 'VTI4EM9hAxdj6cYOBEBqJV3N');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })

    },


    changePaymentStatus: (orderId, user) => {
        console.log("receipt");
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'Placed',
                    }
                }).then(() => {
                    db.get().collection(collection.CART_COLLECTON).deleteOne({ user: ObjectId(user) })
                    resolve()
                })
        })
    },

    changePaymentStatus_wlt: (orderId, user) => {

        // console.log("receipt");
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'Placed',
                        paymentmethod: 'Wallet'
                    }
                }).then(() => {
                    db.get().collection(collection.CART_COLLECTON).deleteOne({ user: ObjectId(user) })
                    resolve()
                })
        })
    },
    changePaymentStatus_cod: (orderId, user) => {

        // console.log("receipt");
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'Placed',
                        paymentmethod: 'COD'
                    }
                }).then(() => {
                    db.get().collection(collection.CART_COLLECTON).deleteOne({ user: ObjectId(user) })
                    resolve()
                })
        })
    },

    addwalletAmnt: (orderId, walletamount) => {

        // console.log("receipt");
        console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        Wallet: walletamount
                    }
                }).then(() => {
                    resolve()
                })
        })
    },


    generatePaypal: (orderId, total) => {
        parseInt(total);
        console.log(total);
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": total,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": "Hat for the best team ever"
                }]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    console.log("pmnt")
                    console.log(payment)
                    resolve(payment)
                }
            });

        });
    },


    changePassword: (id, data) => {

        console.log(id);
        console.log(data);
        return new Promise(async (resolve, reject) => {
            let response = {}
            data.newPassword = await bcrypt.hash(data.newPassword, 10)
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(id) })
            if (user) {
                bcrypt.compare(data.oldPassword, user.Password).then((status) => {
                    if (status) {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(id) },
                            {
                                $set: {
                                    Password: data.newPassword
                                }
                            }
                        ).then(() => {
                            response.status = true
                            resolve(response)
                        })
                    } else {
                        console.log("pw-err");
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("err");
                resolve({ status: false })
            }
        })
    },

    productInvoice: (orderId, itemId) => {
        console.log("ids");
        console.log(orderId);
        console.log(itemId);
        return new Promise(async (resolve, reject) => {
            let invoice = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(orderId)
                    }
                }, {
                    $unwind: "$product",
                },

                {
                    $project: {
                        address: 1,
                        coupon: 1,
                        id: "$product.item._id",
                        Name: "$product.item.Name",
                        qty: "$product.quantity",
                        date: 1,
                        coupon: 1,
                        paymentmethod: 1,
                        price: "$product.item.price",
                        discounted_price: "$product.item.discounted_price",
                        sellingP: "$product.item.discounted_price",
                        sellingP: "$product.item.discounted_price",
                        address: 1,
                        image: "$product.item.image",
                    }
                },
                {
                    $match: {
                        id: ObjectId(itemId)
                    }
                },

                {
                    $lookup: {
                        from: collection.DELIVERYADDRESS_COLLECTION,
                        localField: "address",
                        foreignField: "_id",
                        as: "address"
                    }
                },
                {
                    $unwind: "$address"
                },
                {
                    $project: {
                        paymentmethod: 1,
                        date: 1,
                        sellingP: 1,
                        Name: 1,
                        discounted_price: 1,
                        price: 1,
                        qty: 1,
                        image: 1,
                        address: "$address.addressDetail.address",
                        mobile: "$address.addressDetail.mobile",
                        email: "$address.addressDetail.email",
                        pinCode: "$address.addressDetail.pinCode",
                        street: "$address.addressDetail.street",
                        country: "$address.addressDetail.country",
                    }
                },
                {
                    $project: {
                        Name: 1,
                        discounted_rate: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, { $toInt: "$qty" }] } },
                        price: 1, qty: 1, sellingP: 1, image: 1, address: 1, mobile: 1, mobile: 1, email: 1, pinCode: 1, street: 1, country: 1,
                        tax: { $sum: { $multiply: [{ $multiply: [{ $toInt: '$discounted_price' }, 0.01] }, { $toInt: '$qty' }] } }, date: 1, paymentmethod: 1,
                        TotalPrice: { $sum: [{ $toInt: '$discounted_price' }, { $toInt: "$tax" }] }
                    }
                },
                {
                    $project: {
                        Name: 1, sellingP: 1, discounted_rate: 1, price: 1, qty: 1, image: 1, address: 1, mobile: 1, mobile: 1, email: 1, pinCode: 1, street: 1, country: 1,
                        tax: 1, date: 1, paymentmethod: 1,
                        discounted_price: { $sum: [{ $toInt: '$discounted_rate' }, { $toInt: "$tax" }] },

                    }
                }
            ]).toArray()
            console.log(invoice[0]);
            console.log(invoice);
            resolve(invoice[0])
        })

    },

    productInvoice_d: (orderId, itemId) => {

        console.log(orderId);
        console.log(itemId);
        return new Promise(async (resolve, reject) => {
            let invoice = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: ObjectId(orderId)
                    }
                }, {
                    $unwind: "$product",
                },


                {
                    $project: {
                        address: 1,
                        coupon: 1,
                        id: "$product.item._id",
                        Name: "$product.item.Name",
                        qty: "$product.quantity",
                        date: 1,
                        coupon: 1,
                        paymentmethod: 1,
                        price: "$product.item.price",
                        discounted_price: "$product.item.discounted_price",
                        sellingP: "$product.item.discounted_price",
                        address: 1,
                        image: "$product.item.image",

                    }
                },

                {
                    $match: {
                        id: ObjectId(itemId)
                    }
                },

                {
                    $lookup: {
                        from: collection.COUPON_COLLECTION,
                        localField: 'coupon',
                        foreignField: 'coupon_name',
                        as: 'coupons'
                    }
                },

                {
                    $lookup: {
                        from: collection.DELIVERYADDRESS_COLLECTION,
                        localField: "address",
                        foreignField: "_id",
                        as: "address"
                    }
                },
                {
                    $unwind: "$address"
                },
                {
                    $project: {
                        paymentmethod: 1,
                        date: 1,
                        qty: 1,
                        sellingP: 1,
                        coupon: 1,
                        Name: 1,
                        discounted_price: 1,
                        price: 1,
                        qty: 1,
                        image: 1,
                        coupon_off: { $arrayElemAt: ['$coupons.rate', 0] },
                        address: "$address.addressDetail.address",
                        mobile: "$address.addressDetail.mobile",
                        email: "$address.addressDetail.email",
                        pinCode: "$address.addressDetail.pinCode",
                        street: "$address.addressDetail.street",
                        country: "$address.addressDetail.country",
                    }
                },
                {
                    $project: {
                        discounted_price: 1, qty: 1, coupon_off: 1, paymentmethod: 1,
                        date: 1,
                        qty: 1,
                        coupon: 1,
                        sellingP: 1,
                        Name: 1,
                        discounted_price: 1,
                        price: 1,
                        qty: 1,
                        image: 1,
                        address: 1,
                        mobile: 1,
                        email: 1,
                        pinCode: 1,
                        street: 1,
                        country: 1,
                        discounted_rate: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, { $toInt: "$qty" }] } },

                    }
                },
                {
                    $project: {
                        discounted: { $multiply: [{ $divide: [{ $toInt: "$discounted_rate" }, 100] }, { $toInt: "$coupon_off" }] },
                        // discounted_price:{$subtract:[{ $toInt:"$discounted_price"},'$discounted']},
                        Name: 1, sellingP: 1, discounted_rate: 1, price: 1, qty: 1, image: 1, address: 1, mobile: 1, mobile: 1, email: 1, pinCode: 1, street: 1, country: 1, date: 1, paymentmethod: 1,
                        tax: 1, date: 1, paymentmethod: 1, discounted_price: 1,
                        //TotalPrice: { $sum: [{ $toInt: '$discounted_rate' }, { $toInt: "$tax" }] }
                    }
                },
                {
                    $project: {
                        discounted: 1,
                        discounted_price: { $subtract: [{ $toInt: "$discounted_rate" }, { $toInt: '$discounted' }] },
                        Name: 1, sellingP: 1, discounted_rate: 1, price: 1, qty: 1, image: 1, address: 1, mobile: 1, mobile: 1, email: 1, pinCode: 1, street: 1, country: 1, date: 1, paymentmethod: 1,
                        date: 1, paymentmethod: 1,
                        tax: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, 0.01] } },
                    }
                },
                // {
                //     $project: {
                //         discounted: 1,
                //         discounted_price:1,
                //         Name: 1, discounted_rate: 1, price: 1, qty: 1, image: 1, address: 1, mobile: 1, mobile: 1, email: 1, pinCode: 1, street: 1, country: 1, date: 1, paymentmethod: 1,
                //         date: 1, paymentmethod: 1,
                //         tax: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, 0.01] } },
                //     }
                // },
                // {
                //     $project: {
                //         discounted_price: 1,
                //         Name: 1, discounted_rate: 1, price: 1, qty: 1, image: 1, address: 1, mobile: 1, mobile: 1, email: 1, pinCode: 1, street: 1, country: 1, date: 1, paymentmethod: 1,
                //         tax: 1, date: 1, paymentmethod: 1,
                //         // dprice:{$divide:[{ $toInt:"$total"},100]},
                //         dprice: { $divide: [{ $subtract: [{ $toInt: "$discounted_rate" }, { $toInt: '$discounted' }] }, { $toInt: "$qty" }] },
                //         // TotalPrice: { $sum: [{ $toInt: '$discounted_price' }, { $toInt: "$tax" }] }
                //         tax: { $sum: { $multiply: [{ $toInt: '$discounted_price' }, 0.01] } },
                //         // discounted:{$multiply:[{$divide:[{ $toInt:"$total"},100]},{ $toInt:"$coupon_Off"}]},
                //         TotalPrice: { $sum: [{ $multiply: [{ $toInt: '$discounted_price' }, 0.01] }, { $toInt: '$discounted_price' }] },
                //         //  TotalPrice:{ $sum: [{ $toInt: '$discounted_price' },0.01,{$toInt: '$discounted_price'}]},
                //     }
                // }
            ]).toArray()
            console.log(invoice[0]);
            resolve(invoice[0])
        })

    },

    checkWallet: () => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).findOne().then((response) => {
                console.log(response);
                resolve(response)
            })
        })

    },
    changeWalletAmount: (id, wamount) => {

        console.log(wamount);
        console.log("wallet");
        console.log(id);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(id) },
                {
                    $set: { amount: wamount }
                }
            ).then(() => {
                resolve()
            })
        })
    },

    checkCoupen: (data, userId) => {

        console.log(data.coupon_code);
        console.log(data);
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon_name: data.coupon_code })
            let response = {};
            if (coupon) {
                let usercheck = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon_name: data.coupon_code, User: { $in: [ObjectId(userId)] } })
                if (usercheck) {
                    response.used = true;
                    resolve(response)
                } else {
                    date = new Date()
                    expdate = new Date(coupon.Date)
                    console.log(expdate);
                    console.log(date);
                    if (date <= expdate) {
                        db.get().collection(collection.COUPON_COLLECTION).updateOne({ coupon_name: data.coupon_code }
                            , {
                                $push: { User: ObjectId(userId) }
                            }
                        ).then((response) => {
                            db.get().collection(collection.CART_COLLECTON).updateOne({ user: ObjectId(userId) },
                                { $set: { coupon: data.coupon_code } })
                            response.a = coupon
                            resolve(response)
                        })
                    } else {
                        console.log("cn");
                        response.dateErr = true;
                        resolve(response)
                    }
                }

            } else {
                console.log("no");
                response.invalid = true;
                resolve(response)
            }
        })
    },

    clearwallet: (id) => {
        console.log(id);
        db.get().collection(collection.WALLET_COLLECTION).updateOne({ user: ObjectId(id) },

            {
                $set: { amount: 0 }
            }
        )
    },
    check_Coupen: (data) => {
        return new Promise(async (resolve, reject) => {
            let coupon_dt = await db.get().collection(collection.COUPON_COLLECTION).findOne({ coupon_name: data })
            resolve(coupon_dt)
        })
    },
    // walletorder:(total,orderId)=>{
    //     db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:ObjectId(orderId)},
    //     {
    //         $set:{wallet:total}
    //     }
    //     )
    // }

    checkmobile: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ mobileNumber: data.mob })

            if (user) {
                console.log("respo");
                data.status = true;
                response = data
                console.log(response);
                console.log('start');
                console.log(otpp.serviceSID);
                client.verify.services(otpp.serviceSID).verifications
                    .create({
                        to: `+91${data.mob}`,
                        channel: 'sms',
                    })
                    .then((data) => {
                        // console.log(data);
                        // console.log('datahhhh');
                        // response = userData
                        // response.status = true;
                        //resolve(response)
                        //res.status(200).send(data)

                    })
                console.log('resolve check');
                console.log(resolve);
                resolve(response)

            } else {
                console.log("a");
                console.log("ert");
                response.err = true;
                resolve(response)
            }
        })
    },
    PW_otp: (otp, userData) => {
        console.log(userData);
        return new Promise((resolve, reject) => {
            console.log("inside promise");
            //      client.verify.services('VA2c479d26d085dcc4ab1c78220effb4bc')
            //   .verificationChecks
            //   .create({to: '+919778013518', code: '123456'})
            //   .then((verification_check )=>{
            //     console.log("test");
            //     console.log(verification_check);
            //   });

            //console.log(userData.mob);
            console.log(otp.otp);
            console.log(otpp.serviceSID);

            client.verify.services(otpp.serviceSID).verificationChecks
                .create({
                    to: `+91${userData.mob}`,
                    code: otp.otp
                }).then((data) => {

                    console.log('data');
                    console.log(data);
                    if (data.status == 'approved') {
                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
        })
    },
    updatepassword: (mob, pw) => {
        console.log("helper");
        console.log(mob);
        console.log(pw);
        return new Promise(async (resolve, reject) => {
            pw.newpassword = await bcrypt.hash(pw.newpassword, 10)
            db.get().collection(collection.USER_COLLECTION).updateOne({ mobileNumber: mob },
                {
                    $set: { Password: pw.newpassword }
                }
            ).then(() => {
                resolve()
            })
        })
    }
}