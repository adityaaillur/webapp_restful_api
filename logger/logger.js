const {createLogger, transports, format} = require('winston')

const customerLogger = createLogger({
    transports:[
        new transports.File({
            filename : 'csye6225.log',
            format:format.combine(format.timestamp(),format.json())

        })
    ]
})

module.exports = {customerLogger}
