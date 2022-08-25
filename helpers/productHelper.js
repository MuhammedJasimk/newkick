var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { ObjectId } = require('mongodb');

module.exports = {
    addProduct: (productData) => {
        console.log(productData);
        return new Promise(async (resolve, reject) => {

            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ Categoryname: productData.category })
            let subcategory = await db.get().collection(collection.SUBCATEGORY_COLLECTON).findOne({ SubCategoryname: productData.subcategory })
            let brand = await db.get().collection(collection.BRAND_COLLECTON).findOne({ brand: productData.brand })
            //let size = await db.get().collection(collection.SIZE_COLLECTON).findOne({ size: productData.size })
            //let color = await db.get().collection(collection.COLOR_COLLECTON).findOne({ color: productData.color })
            console.log(brand);
            let productObj = {
                category: ObjectId(category._id),
                subcategory: ObjectId(subcategory._id),
                Name: productData.Name,
                brand: ObjectId(brand._id),
                color: productData.color,
                size: productData.size,
                status: true,
                offer:true,
                date: new Date(),
                brand: ObjectId(brand._id),
                status: productData.status,
                stock: productData.stock,
                price: productData.price,
                discounted_price: productData.discounted_price,
                description: productData.description,
                image: productData.image,
            }
            console.log("check");
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(productObj).then((data) => {
                resolve(data)
            })
        })
    },

    // getproducts:()=>{
    //     return new Promise (async(resolve,reject)=>{
    //        let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    //        resolve(product)
    //     })
    // },

    productCat: (id) => {
        return new Promise(async (resolve, reject) => {
            console.log(id);
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: ObjectId(id) }).toArray()
            resolve(product)
        })
    },

    getproducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({ status: true }).toArray()
            resolve(product)
        })
    },

    getAllproducts: () => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTON,
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brand'
                    }
                }, {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                }, {
                    $project: {
                        brand: "$brand.brand", category: "$category.Categoryname", Name: 1, price: 1, stock: 1, image: 1, status: 1, offer: 1, OfferName: 1
                    }
                }
            ]).toArray()
            console.log(product);
            resolve(product)
        })
    },

    getFeaturproducts: () => {
        
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().limit(4).sort({ date: -1 }).toArray()
            console.log(product);
            if(product.length != 0){
            if (product[0].offer) {
                console.log(product);
                console.log("End");
            } else {
                console.log(product);
            }
            
            resolve(product);
        }
        else{
            console.log("else case");
            reject() 
        }
        })
    },


    // getproductDetail:(id,data)=>{
    //    return new Promise ((resolve, response)=>{
    //     db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: ObjectId(id)}).then((response)=>{
    //         resolve(response)
    //     })
    //    })
    // },

    getproductDetail: (id, data) => {
        console.log(id);
        return new Promise(async (resolve, response) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(id) }
                },
                {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $lookup: {
                        from: collection.SUBCATEGORY_COLLECTON,
                        localField: 'subcategory',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTON,
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brand'
                    }
                },
                {
                    $lookup: {
                        from: collection.COLOR_COLLECTON,
                        localField: 'color',
                        foreignField: '_id',
                        as: 'color'
                    }
                },
                {
                    $lookup: {
                        from: collection.SIZE_COLLECTON,
                        localField: 'size',
                        foreignField: '_id',
                        as: 'size'
                    }
                },
                {
                    $project: {
                        category: '$category.Categoryname', subcategory: '$subcategory.SubCategoryname',
                        brand: '$brand.brand', color: '$color.color', size: '$size.size', Name: 1, stock: 1,
                        description: 1, status: 1, image: 1, price: 1, discounted_price: 1,
                    }

                },
            ]).toArray()
            console.log("helper");
            resolve(product[0])
            //  console.log(product);

        })
    },

    blockProduct: (id) => {
        return new Promise((resolve, reject) => {
            console.log("response");
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { status: false } }).then((response) => {
                resolve()
            })
        })
    },

    unblockProduct: (id) => {
        return new Promise((resolve, reject) => {
            console.log("response");
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { status: true } }).then((response) => {
                resolve()
            })
        })
    },


    editProduct: (productData, proId) => {
        console.log(productData);
        return new Promise(async (resolve, reject) => {
            let image = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ Name: productData.Name })
            var category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ Categoryname: productData.category })
            var subcategory = await db.get().collection(collection.SUBCATEGORY_COLLECTON).findOne({ SubCategoryname: productData.subcategory })
            var brand = await db.get().collection(collection.BRAND_COLLECTON).findOne({ brand: productData.brand })
            //var size = await db.get().collection(collection.SIZE_COLLECTON).findOne({ size: productData.size })
            //var color = await db.get().collection(collection.COLOR_COLLECTON).findOne({ color: productData.color })

            if (productData.image.length == 0) {
                productData.image = image.image
            }
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(proId) },
                {
                    $set: {
                        category: ObjectId(category._id),
                        subcategory: ObjectId(subcategory._id),
                        Name: productData.Name,
                        brand: ObjectId(brand._id),
                        color: productData.color,
                        size: productData.size,
                        offer:true,
                        date: new Date(),
                        status: true,
                        brand: ObjectId(brand._id),
                        status: true,
                        stock: productData.stock,
                        price: productData.price,
                        discounted_price: productData.discounted_price,
                        description: productData.description,
                        image: productData.image,
                    }
                }
            ).then((data) => {
                resolve(data)
            })
        })
        // })
    },

    getproductsByid: (id) => {
        return new Promise(async (resolve, reject) => {
            //    db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: ObjectId(id)}).then((product)=>{
            //        resolve(product)
            //    })

            let product = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { _id: ObjectId(id) }
                },
                {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $lookup: {
                        from: collection.SUBCATEGORY_COLLECTON,
                        localField: 'subcategory',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTON,
                        localField: 'brand',
                        foreignField: '_id',
                        as: 'brand'
                    }
                },
                
                
                {
                    $project: {
                        category: '$category.Categoryname', subcategory: '$subcategory.SubCategoryname',
                        brand: '$brand.brand', Name: 1, stock: 1,
                        description: 1, status: 1, image: 1, price: 1, discounted_price: 1,color:1,size:1
                    }

                },
            ]).toArray()
            console.log(product[0]);
            resolve(product[0])

        })
    },
}