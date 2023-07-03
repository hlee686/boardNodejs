const express = require('express')
const app = express()
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.set('view engine', 'ejs')
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

var db;

const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb+srv://slee0628:K9TdYmPICdTCdGMU@cluster0.uepwwoa.mongodb.net/?retryWrites=true&w=majority',function(error, client){
  if (error) return console.log(error)
  db = client.db('BoardApp');
  
  app.listen(8080, function () {
    console.log('listening on 8080')
  });
});

app.get('/', function(req, res){
  res.render('index.ejs')
})

app.get('/input', function(req, res){
  res.render('input.ejs')
})

app.get('/list', function(req, res){
  db.collection('board').find().toArray(function(error, result){
    res.render('list.ejs', {post: result})
  })
})

app.post('/list', function (요청, 응답) {
  db.collection('count').findOne({name : '게시물갯수'}, function(에러, 결과){
    var 총게시물갯수 = 결과.totalPost

    db.collection('board').insertOne({ _id : 총게시물갯수 + 1, title : 요청.body.title, date : 요청.body.date }, function (에러, 결과) {
      db.collection('count').updateOne({name:'게시물갯수'},{ $inc: {totalPost:1} },function(에러, 결과){
	if(에러){return console.log(에러)}
        응답.redirect('/list')
      })
    })
  })
})

app.delete('/delete', function(요청, 응답){
  요청.body._id = parseInt(요청.body._id)
  db.collection('board').deleteOne(요청.body, function(에러, 결과){
    console.log('삭제완료')
  })
  응답.send('삭제완료')
});

app.get('/edit/:id', function(요청, 응답){
  db.collection('board').findOne({ _id : parseInt(요청.params.id)}, function(에러, 결과){
    응답.render('edit.ejs', { post : 결과 })
  })
});

app.put('/edit', function(요청, 응답){ 
  db.collection('board').updateOne( {_id : parseInt(요청.body.id) }, {$set : { title : 요청.body.title , date : 요청.body.date }}, 
    function(){ 
    console.log('수정완료') 
    응답.redirect('/list') 
  }); 
}); 

app.get('/search', function(req, res){
  db.collection('board').find({title: { $regex: req.query.value}}).toArray(function(error, result){
    res.render('search.ejs', {post: result})
  })
})

