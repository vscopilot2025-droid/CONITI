const express = require('express'); 
const cors = require('cors'); 
const axios = require('axios'); 
const app = express(); 

app.use(cors()); 
app.use(express.json()); 
  
const USER_SERVICE_URL = 'http://localhost:3001'; 
const NOTIFICATION_SERVICE_URL = 'http://localhost:3002'; 

  

app.get('/api/users', async (req, res) => { 
  try { 
    const response = await axios.get(`${USER_SERVICE_URL}/users`); 
    res.json(response.data); 
  } catch (error) { 
    res.status(500).json({ error: 'Error consultando user-service' }); 
  } 
}); 

  

app.post('/api/users', async (req, res) => { 
  try { 
    const response = await axios.post(`${USER_SERVICE_URL}/users`, req.body); 
    await axios.post(`${NOTIFICATION_SERVICE_URL}/notify`, { 
      message: `Usuario creado: ${response.data.name}` 
    }); 
  
    res.status(201).json(response.data); 
  } catch (error) { 
    res.status(500).json({ error: 'Error creando usuario' }); 
  } 

}); 

  

app.listen(3000, () => { 
  console.log('gateway corriendo en http://localhost:3000'); 
}); 