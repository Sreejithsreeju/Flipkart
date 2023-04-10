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
  console.log(products)
  res.render('user/cart',{products,user:req.session.user})
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log("aaaaaaapppi calll");
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    console.log("added");
    res.json({status:true})
    
  })
})


module.exports = router;
