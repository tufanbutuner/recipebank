module.exports = function(app)
{
    const { check, validationResult } = require('express-validator');
	const redirectLogin = (req, res, next) => {

   if (!req.session.userId ) 
   {
     res.redirect('./login')
   } 

   else 
   { next (); }
}

//homepage
app.get('/',function(req,res)
{
    res.render('index.html')
});

//search page
app.get('/search',redirectLogin, function(req,res)
{
    res.render("search.html");
});


//search result page
app.post('/search-result', function(req, res)
{
   var MongoClient = require('mongodb').MongoClient;
   var url = 'mongodb://localhost';

   MongoClient.connect(url, function (err, client)
   {
                                                                                                                                                            
        if (err) throw err;
        var db = client.db('recipedbs');
                                                                                                                                                            
        db.collection('recipes').find({name: req.body.keyword}).toArray((findErr, results) =>
        {
                if (findErr) throw findErr;
                else

                client.close();
                res.render('search-result.ejs', {availablerecipes:results});
        });
   });
                                                                                                                                                            
});
                                                                                                                                                            
//register page
app.get('/register', function (req,res)
{
    res.render('register.html');
});
                                                                                                                                                            
//registered page
app.post('/registered',[check('email').isEmail()],[check ('password').isLength({min:6})], function (req,res)
{
const errors = validationResult(req);
                                                                                                                                                            
    if (!errors.isEmpty())
    {
        res.redirect('./register');
    }
    
    else
    {
        // saving data in database
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.sanitize(req.body.password);
        
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword)
        {
            // Store hashed password in your database
            var MongoClient = require('mongodb').MongoClient;
            var url = 'mongodb://localhost';
            
            MongoClient.connect(url, function(err, client)
            {
                if (err) throw err;
                var db = client.db ('recipedbs');
                
                db.collection('user').insertOne(
                    {
                        firstname: req.body.firstname,
                        password: hashedPassword,
                        email: req.body.email
                    });
                    
                    client.close();
            });
            
            res.send('You have been registered. Your user name is: '+ req.body.firstname + '<br />'+'<a href='+'./'+'>Home</a>');

        });
    }
});
                                                                                                                                                            
//login page
app.get('/login', function (req,res)
{
        res.render('login.html');
});
                                                                                                                                                            
//loggedin page
app.post('/loggedin', function (req,res)
{
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const plainPassword = req.body.password;
    
    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword)
    {
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        
        MongoClient.connect(url, function (Merr, client)
        {
            if (Merr) throw err;
            var db = client.db('recipedbs');
            db.collection('user').findOne({firstname: req.body.firstname}, function(findErr, user)
            {
                if (findErr) throw err;
                if(user)
                {
                    var hashedPassword = user.password;
                    bcrypt.compare(plainPassword, hashedPassword, function(err, result)
                    {
                        if (err) throw err;
                        if (result == true)
                        {
                            req.session.userId = req.body.firstname;
                            res.render('loggedin.ejs',{user:req.body.firstname});
                        }
                        else
                        {
                            res.render('loginfailed.html');
                        }
                    });
                }
                else
                    {
                        res.render('usernameFailed.html');
                    }
                client.close();
            });
        });
    });
});
                                                                                                                                                            
//logout page
app.get('/logout', redirectLogin, (req,res) =>
{
  req.session.destroy(err => {
    if (err)
    {
      return res.redirect('./');
    }
    res.render('loggedout.html');
  });
});
                                                                                                                                                            
//add recipe page
app.get('/addrecipe', redirectLogin, function(req,res)
{
    res.render('addRecipe.html');
});
                                                                                                                                                            
//recipe added page
app.post('/recipeadded', function (req,res)
{
    // saving data in database
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost';
    
    MongoClient.connect(url, function(err, client)
    {
        if (err) throw err;
        var db = client.db ('recipedbs');
        db.collection('recipes').insertOne(
            {
                name: req.body.name,
                ingredients: req.body.ingredients,
                author: req.body.author
            });
            client.close();
                res.render('addedRecipe.ejs',{recipes:req.body.name});
    });
});
                                                                                                                                                            
//recipe list page
app.get('/recipelist', function(req, res)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost';
    MongoClient.connect(url, function (err, client)
    {
        if (err) throw err;
        var db = client.db('recipedbs');
        db.collection('recipes').find().toArray((findErr, results) =>
        {
            if (findErr) throw findErr;
            else
            res.render('recipeList.ejs', {availablerecipes:results});
            client.close();
        });
    });
});
                                                                                                                                                            
//delete page
app.get('/deleterecipe',redirectLogin,function(req,res)
{
    res.render("deleteRecipe.html");
});
                                                                                                                                                            
                                                                                                                                                            
//delete recipe
app.post('/deletedrecipe', function (req,res)
{
    // saving data in database
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost';
    MongoClient.connect(url, function(err, client)
    {
        if (err) throw err;
        var db = client.db ('recipedbs');
        db.collection('recipes').deleteOne({
            name: req.body.keyword
        });
            client.close();
            res.render('deletedRecipe.ejs', {recipes: req.body.keyword});
    });
});
                                                                                                                                                            
//update recipe
app.get('/edit-recipe', redirectLogin, function(req,res)
{
    res.render('editRecipe.html');
});

//updating recipe from db
app.post('/updated', function (req,res)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost';
    const recipeName = req.body.name;
    MongoClient.connect(url, function(err, client)
    {
        if (err) throw err;
        var db = client.db ('recipedbs');
        db.collection('recipes').findOne({name: req.body.name}, function(err,result)
        {
             console.log(result);
             if(err) throw err;
             else
             {
                res.render('updateRecipe.html', {recipes:result});
            };
                client.close();
        });
    });
 });
 
 //saves updated changes on db
app.post('/save-changes', function(req,res)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost';
    MongoClient.connect(url, function(err,client)
    {
        if(err) throw err;
        var db= client.db('recipedbs');
        db.collection('recipes').updateOne(
            {
            name : req.body.prevname},
            {$set:  {name: req.body.name,
                    ingredients: req.body.ingredients,
                    author: req.body.author}
            });
            res.send('Recipe has been updated'+'<br />'+'<a href='+'./'+'>Home</a>');
    });
});
                                                                                                                                                            
//API
app.get('/api', function (req,res)
{
    var MongoClient = require('mongodb').MongoClient;
    var url = 'mongodb://localhost';
    MongoClient.connect(url, function (err, client)
    {
        if (err) throw err
        var db = client.db('recipedbs');
        
        //saving "Recipes" in results
        db.collection('recipes').find().toArray((findErr, results) =>
        {
            if (findErr) throw findErr;
            else
            res.json(results);
            client.close();
        });
    });
});                                                                                                                                                           
}
