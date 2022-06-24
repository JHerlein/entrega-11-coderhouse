const {fork} = require('child_process')


const random = (req,res) => {
    const forked = fork('./controllers/randomChild.js')
    if (req.query.cant){
        forked.send(req.query.cant)
    }
    else{
        forked.send(100_000_000)
    }       
    
    forked.on('message',msg =>{
        res.json(msg)
    })
    
       
}

module.exports = {random}