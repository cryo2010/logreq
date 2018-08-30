# OVERVIEW
Logger-agnostic logging middleware for Node.js.  Inspired by the "morgan" package.

# API

### logreq({logger, level, format})

Create a new logreq logging middleware function.  The "logger" is the only
required parameter.  The "level" parameter is a string that provides a means 
by which to set the log level (defaults to 'info').  The "format" parameter is
a function for customizing the log message.  

### Default Message Format

```
${ip} ${method} ${url} ${statusCode} ${length} - ${ms} ms ${id}
```

# EXAMPLE

### Sample App
```javascript
const express = require('express')
const winston = require('winston')
const app = express()

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

const logreq = require('logreq')({logger})
app.use(logreq)

app.get('/download', (req, res) => {
  res.sendFile(`${__dirname}/test.txt`)
})
app.listen(3000, () => console.log('Listening on port 3000!'))
```

### Log Output

The below log output is from the above example app.

```shell
info: ::ffff:192.168.1.158 GET /download 200 3507 bytes - 14 ms
info: ::ffff:192.168.1.123 GET /download 200 3507 bytes - 19 ms
info: ::ffff:192.168.1.101 GET /download 200 3507 bytes - 33 ms
info: ::ffff:192.168.1.155 GET /download 200 3507 bytes - 26 ms
```

# LICENSE
ISC

