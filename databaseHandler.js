const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://datltgch190214a:dat190214@cluster0.4qmj7.mongodb.net/test";
const dbName = "ATNDB";

async function getDbo() {
    const client = await MongoClient.connect(url);
    const dbo = client.db(dbName);
    return dbo;
}

const client = new MongoClient(
    url,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
client.connect().then((client) => {
    var db = client.db('db_name')
    db.collection('collection_name').find().toArray(function (err, result) {
        if (err) throw err
        console.log(result);
    })
})

async function searchProduct(condition,collectionName){
    const dbo = await getDbo();
    const searchCondition = new RegExp(condition,'i')
    var results = await dbo.collection(collectionName).
                                        find({name:searchCondition}).toArray();
    return results;
}

async function insertOneIntoCollection(documentToInsert,collectionName){
    const dbo = await getDbo();
    await dbo.collection(collectionName).insertOne(documentToInsert);
}

async function checkUser(nameIn,passwordIn){
    const dbo = await getDbo();
    const results = await dbo.collection("users").
         findOne({$and:[{username:nameIn},{password:passwordIn}]});
    if(results != null)
        return true;
    else
        return false;
}

function checkName(value)
{
    for(var i = 0; i < value.length; i++)
    {
        if(value[i] < 'a' || value[i] > 'z')
        {
            return false;
        }   
    }
    return true;
}

function checkLength(value)
{
    if(value.length < 10){
        return false;
    }
    return true;
}

function checkEmpty(value)
{
    if(value.length != 0){
        return false;
    }
    return true;
}
function checkPrice(value)
{
   if(isNaN(value))
   {
       return true;
   }
    return false;
}
function checkLimit(value)
{
   if(isNaN(value))
   {
       return true;
   }
    return false;
}


module.exports = {searchProduct, insertOneIntoCollection, checkUser, checkName, checkPrice, checkLength, checkEmpty}