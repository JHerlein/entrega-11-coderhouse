
process.on('message',msg =>{
    let randomArray = []
    let randomObject = {}
    for(let i = 0; i<=1000;i++){
        randomObject[i] = 0
    }
    
    console.log('Mensaje enviado por el padre ',msg)    
    for(let i = 0;i<msg;i++){
        randomObject[Math.round(Math.random() * 1000)] = randomObject[Math.round(Math.random() * 1000)]++
    }    
    process.send(randomObject)
})