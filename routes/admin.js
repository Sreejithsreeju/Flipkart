var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  
 productHelper.getAllProducts().then((products)=>{
  console.log(products)
  res.render('admin/view-products',{admin:true,products})
 })

});

router.get('/add-product',(req,res)=>{
  res.render('admin/add-product')
})
router.post('/add-product',(req,res)=>{
  // console.log(req.body)
  // console.log(req.files.Image);
  productHelper.addProduct(req.body,(id)=>{
    //storing image
    let image=req.files.Image
    //moving to a folder
    console.log(id)
    image.mv('./public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.render('admin/add-product')
      }else{
        console.log(err);
      }
    })

    
  })
})
router.get('/delete-product',(req,res)=>{
  let proId=req.query.id
  console.log(req.query.id)
  productHelper.deleteProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
  
  // console.log(proId)
  
})
router.get('/edit-product/:id',async (req,res)=>{
  let product=await productHelper.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
  console.log(req.params.id);
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin')
    if(req.files.Image){
      let image=req.files.Image
      image.mv('./public/product-images/'+req.params.id+'.jpg')
    }
    
  })
})


module.exports = router;
