const {createLogger, transports, format} = require('winston')

//-----Logging functions---------

const customlogger = createLogger({
    format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.prettyPrint()
      ),
    transports:[
        new transports.File({
            filename:'./logs/csye6225.log',
            format: format.combine(format.timestamp(),format.json())
        })
    ]
})

module.exports = {customlogger};