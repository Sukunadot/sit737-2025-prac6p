const express = require('express');
const winston = require('winston');

const app = express();
const port = 3000;

// Winston Logger Setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'calculator-microservice' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

// Calculator API Endpoints
app.get('/:operation', (req, res) => {
    const { operation } = req.params;
    const { num1, num2 } = req.query;

    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
        logger.error('Invalid input: Not a number');
        return res.status(400).json({ error: 'Invalid input, please provide numbers.' });
    }

    let result;
    switch (operation) {
        case 'add':
            result = n1 + n2;
            break;
        case 'subtract':
            result = n1 - n2;
            break;
        case 'multiply':
            result = n1 * n2;
            break;
        case 'divide':
            if (n2 === 0) {
                logger.error('Division by zero error');
                return res.status(400).json({ error: 'Cannot divide by zero.' });
            }
            result = n1 / n2;
            break;
        default:
            logger.error('Invalid operation');
            return res.status(400).json({ error: 'Invalid operation. Use add, subtract, multiply, or divide.' });
    }

    logger.info(`New ${operation} operation requested: ${n1} ${operation} ${n2} = ${result}`);

    res.json({ operation, num1: n1, num2: n2, result });
});

// Start server
app.listen(port, () => {
    console.log(`Calculator microservice running at http://localhost:${port}`);
    logger.info(`Calculator microservice started on port ${port}`);
});
