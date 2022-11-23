const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('CARBS SERVER IS RUNNING');
})

app.listen(port, () => console.log(`CARBS SERVER RUNNING ON ${port}}`));