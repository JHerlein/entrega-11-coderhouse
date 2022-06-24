const fs = require('fs')
const { faker } = require('@faker-js/faker');

const getAllProducts = async (req,res) => {
    try {
        const numberProducts = 5
        const arrayProducts = []
        for(i = 0; i<5;i++){
            const newProduct = {
                title:faker.commerce.product(),
                price:faker.commerce.price(),
                thumbnail:faker.image.food(30,30,randomize=true)
            }
            arrayProducts.push(newProduct)
        }        
        res.status(200).json(arrayProducts)
    } catch (error) {
        res.send(error)
    }    
}

const getProduct = async (req,res) => {
    try {
        const {id:productID} = req.params
        let file = await fs.promises.readFile('./files/products.txt')
        file = JSON.parse(new Array(file))               
        let idFiltered = file.filter(function(entry){   
            return entry.id==productID            
        })        
        if (idFiltered.length != 0){
            // res.status(200).json(idFiltered)
            res.status(200).send(idFiltered)
        }
        else{
            res.json({error:"producto no encontrado"})
        }
        

    } catch (error) {
        res.send(error)
    }   
}

const createProduct = async (req,res) => {   
    
    try {
        let file = await fs.promises.readFile('./files/products.txt','utf-8')
        file = JSON.parse(file)
        newId = file.length + 1
        const newProduct = req.body
        newProduct.id = newId
        file.push(newProduct)
        await fs.promises.writeFile('./files/products.txt',JSON.stringify(file,null,2))
        res.redirect('/')
              
    } catch (error) {
        res.send(error)
    } 

    
}

const editProduct = async (req,res) => {

   try {
        const {id:productID} = req.params
        const {title,price,thumbnail} = req.body
        let file = await fs.promises.readFile('./files/products.txt')
        file = JSON.parse(new Array(file))

        for (i = 0; i < file.length; i++){            
            if (file[i].id == productID){
                file[i].title = title               
                file[i].price = price
                file[i].thumbnail = thumbnail
            }
        }

        let idFiltered = file.filter(function(entry){   
            return entry.id==productID            
        })

        await fs.promises.writeFile('./files/products.txt',JSON.stringify(file,null,2))

        res.status(200).json(idFiltered)        
    } catch (error) {
        res.send(error)
    }   
    
}

const deleteProduct = async(req,res) => {
    try {
        const {id:productID} = req.params
        let jsonArray = await fs.promises.readFile('./files/products.txt','utf-8')
        jsonArray = JSON.parse(jsonArray);        
        jsonArray = jsonArray.filter(function(entry){   
            return entry.id!=productID            
        })             
        fs.promises.writeFile('./files/products.txt',JSON.stringify(jsonArray,null,2))
        res.json(jsonArray)   
    
    } catch (error) {
        res.send(error)
    }    
    
}


module.exports = {getAllProducts,
                getProduct,
                createProduct,
                editProduct,
                deleteProduct}