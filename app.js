const express = require('express')
const hbs = require('hbs')
const session = require('express-session');
const dbHandler = require('./databaseHandler');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://datltgch190214a:dat190214@cluster0.4qmj7.mongodb.net/test";
const client = new MongoClient(
    url, { useUnifiedTopology: true }
)
client.connect().then((client) => {
    var db = client.db('db_name')
    db.collection('collection_name').find().toArray(function (err, result) {
        if (err) throw err
        console.log(result);
    })
})

var app = express();

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'somethingwrong',
    cookie: { maxAge: 60000 }
}));

app.set('view engine', 'hbs')


var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))

//search accurate 
app.post('/search', async (req, res) => {
    const searchText = req.body.txtName;
    const results = await dbHandler.searchProduct(searchText, "Product");
    res.render('allProduct', { model: results })
})

app.post('/update', async (req, res) => {
    const id = req.body.id;
    let flag = true;
    const nameInput = req.body.txtName;
    const priceInput = req.body.txtPrice;
    const newValues = { $set: { name: nameInput, price: priceInput } };
    const ObjectID = require('mongodb').ObjectID;
    const condition = { "_id": ObjectID(id) };
    const client = await MongoClient.connect(url);
    const dbo = client.db("ATNDB");
    let error = [];
    // if (!dbHandler.checkName(nameInput)) {
    //     error["name"] = 'Please Enter Name Again!'
    //     flag = false;
    // } 
    if (dbHandler.checkEmpty(nameInput)) {
        error["name"] = 'Enter character >0!'
        flag = false;
    }

    if (dbHandler.checkPrice(priceInput)) {
        error["price"] = 'Please Enter price Again!'
        flag = false;
    } if (dbHandler.checkEmpty(priceInput)) {
        error["price"] = 'Enter price again!'
        flag = false;
    }
    if (dbHandler.checkLength(nameInput)) {
        error["name"] = 'Please Enter Name <10 Again!'
        flag = false;
    }
    if (flag == true) {
        await dbo.collection("Product").updateOne(condition, newValues);
        res.redirect('/view');
    }

    else {
        const productToEdit = await dbo.collection("Product").findOne(condition);
        res.render('edit', { product: productToEdit, error: error })
    }
})

app.get('/edit', async (req, res) => {
    const id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    const condition = { "_id": ObjectID(id) };
    const client = await MongoClient.connect(url);
    const dbo = client.db("ATNDB");
    const productToEdit = await dbo.collection("Product").findOne(condition);
    res.render('edit', { product: productToEdit })
})


app.get('/delete', async (req, res) => {
    const id = req.query.id;
    var ObjectID = require('mongodb').ObjectID;
    const condition = { "_id": ObjectID(id) };

    const client = await MongoClient.connect(url);
    const dbo = client.db("ATNDB");
    const productToDelete = await dbo.collection("Product").findOne(condition);

    await dbo.collection("Product").deleteOne(condition);
    res.redirect('/view');
})

app.get('/view', async (req, res) => {
    const results = await dbHandler.searchProduct('', "Product");
    var userName = 'Not logged In'
    if (req.session.username) {
        userName = req.session.username;
    }
    res.render('allProduct', { model: results, username: userName })
})

app.post('/doInsert', async (req, res) => {
    let error = [];
    let flag = true;
    const nameInput = req.body.txtName;
    const imgURLInput = req.body.imgURL;
    const priceInput = req.body.txtPrice;
    var newProduct = { name: nameInput, price: priceInput, imgUrl: imgURLInput, size: { dai: 20, rong: 40 } }
    // if (!dbHandler.checkName(nameInput)) {
    //     error["name"] = 'Please Enter Name Again!'
    //     flag = false;
    // }
    if (dbHandler.checkEmpty(nameInput)) {
        error["name"] = 'Enter characters >0!'
        flag = false;
    }
    if (dbHandler.checkLength(nameInput)) {
        error["name"] = 'Please Enter Name <10 Again!'
        flag = false;
    }
    // if (!imgURLInput.endsWith('JPEG')) {
    //     error["img"] = 'only file jpn!'
    //     flag = false;
    // }
    if (dbHandler.checkPrice(priceInput)) {
        error["price"] = 'Please Enter price Again!'
        flag = false;
    } if (dbHandler.checkEmpty(priceInput)) {
        error["price"] = 'Enter price again!'
        flag = false;
    }
    if (flag == true) {
        await dbHandler.insertOneIntoCollection(newProduct, "Product");
        res.render('logined')
    }

    else {
        res.render('insert', { error: error })
    }
})

app.get('/insert', (req, res) => {
    res.render('insert')
})

app.post('/login', async (req, res) => {
    const nameInput = req.body.txtName;
    const passInput = req.body.txtPassword;
    const found = await dbHandler.checkUser(nameInput, passInput);
    if (found) {
        req.session.username = nameInput;
        res.render('logined', { loginName: nameInput })
    } else {
        res.render('index', { errorMsg: "Login failed!" })
    }
})

app.get('/', (req, res) => {
    res.render('logined')
})

var PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server is running at: " + PORT);