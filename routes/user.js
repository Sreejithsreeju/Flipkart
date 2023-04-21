var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers');
const { USER_COLLECTION } = require('../config/collections');

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', async function(req, res, next) {
let user=req.session.user
console.log(user)
let cartCount=null
if(req.session.user){
 cartCount=await userHelpers.getCartCount(req.session.user._id)
}
productHelpers.getAllProducts().then((products)=>{
  res.render('user/view-products',{admin:false,products,user,cartCount})
})

  
  //passing to index.hbs file,passing the array product 
  //padding admin=true or false to show corresponding page
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{

  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    res.redirect('/login')
    req.session.loggedIn=true
    req.session.user=response
    res.redirect('/')
  })
})
router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      //setting a var true
      req.session.loggedIn=true
      req.session.user=response.user//user fetched from db
      //already created the root(render is calling for load a new hbs file)
      res.redirect('/')
    }else{
      req.session.loginErr="invalid username or password"
      res.redirect('/login')
    }

  })
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalValue=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products)
  res.render('user/cart',{products,'user':req.session.user,totalValue})
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log("api call");
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    console.log("added");
    res.json({status:true})
    
  })
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
    
  })
})
router.post('/remove-product',(req,res)=>{
  userHelpers.removeProd(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place-order',verifyLogin, async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
    res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
  })
  console.log(req.body)
})
router.get('/order-success',verifyLogin,(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  let orders=await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('verify-payment',(req,res)=>{
  console.log(req.body)
})


module.exports = router;
