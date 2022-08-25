
var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt');
const { response } = require('../app');
const { ObjectId } = require('mongodb');

module.exports = {
    addCategory: (catData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catData).then((response) => {
                resolve(response)
            })
        })

    },
    getCategory: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(data)
        })
    },

    getCategorybyid: (catid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(catid) }).then((category) => {
                resolve(category)
            })
        })
    },

    editCategory: (id, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { Categoryname: data.Categoryname, status: data.status, image: data.image } }).then((response) => {
                resolve(response)
            })
        })
    },

    addSubCategory: (data) => {
        console.log(data);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTON).insertOne(data).then((response) => {
                resolve()
            }).catch((e)=>{
                reject(e)
            })
        })

    },

    getSubCategory: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.SUBCATEGORY_COLLECTON).find().toArray()
            resolve(data)
        })

    },

    getSubCategoryItem: (subId, catId) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { category: ObjectId(catId) }
                },
                {
                    $match: { subcategory: ObjectId(subId) }
                },
            ]).toArray()
            console.log(data);
            resolve(data)
        })

    },

    addcolor: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COLOR_COLLECTON).insertOne(data).then(() => {
                resolve()
            })
        })

    },

    getcolor: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.COLOR_COLLECTON).find().toArray()
            resolve(data)
        })

    },

    addsize: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SIZE_COLLECTON).insertOne(data).then((response) => {
                resolve(response)
            })
        })

    },

    getsize: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.SIZE_COLLECTON).find().toArray()
            resolve(data)
        })

    },

    addbrand: (data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTON).insertOne(data).then((response) => {
                resolve(response)
            })
        })

    },

    getbrand: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collection.BRAND_COLLECTON).find().toArray()
            resolve(data)
            console.log(data);
        })

    },


}