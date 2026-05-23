//Conectar al front-end
const express = require('express');
const cors = require('cors'); 


const app = express(); 

app.use(cors()); 
app.use(express.json()); 

//Users - Name

let users = [ 
    { id: 1, name: 'Ana' }, 
    { id: 2, name: 'Luis' } 
]; 

app.get('/users', (req, res) => { 
  res.json(users); 
}); 
app.post('/users', (req, res) => { 

  const { name } = req.body; 
  if (!name) { 
    return res.status(400).json({ error: 'El nombre es obligatorio' }); 
  } 

  const newUser = { 
    id: users.length + 1, 
    name 
  }; 


  users.push(newUser); 
  res.status(201).json(newUser); 

}); 

//Email
let Email = [ 
    { id: 1, mail: 'Ana@gmail.com' }, 
    { id: 2, mail: 'Luis@gmail.com' } 
]; 

app.get('/Email', (req, res) => { 
    res.json(Email); 
  }); 
  app.post('/Email', (req, res) => { 
  
    const { mail } = req.body; 
    if (!mail) { 
      return res.status(400).json({ error: 'La contraseña es obligatoria' }); 
    } 
  
    const newMail = { 
      id: Email.length + 1, 
      mail 
    }; 
  
  
    Email.push(newMail); 
    res.status(201).json(newMail); 
  
  }); 


//Password

let passwordsExapmle =[
    { id: 1, password: 'Ana' }, 
    { id: 2, password: 'Luis' } 
]

app.get('/passwordsExapmle', (req, res) => { 
    res.json(passwordsExapmle); 
  }); 
  app.post('/passwordsExapmle', (req, res) => { 
  
    const { password } = req.body; 
    if (!password) { 
      return res.status(400).json({ error: 'La contraseña es obligatoria' }); 
    } 
  
    const newPassword = { 
      id: passwordsExapmle.length + 1, 
      password 
    }; 
  
  
    passwordsExapmle.push(newPassword); 
    res.status(201).json(newPassword); 
  
  }); 


//ConfirmPassword

let confirmPasswordsExapmle =[
    { id: 1, confirmPassword: 'Ana' }, 
    { id: 2, confirmPassword: 'Luis' } 
]

app.get('/confirmPasswordsExapmle', (req, res) => { 
    res.json(confirmPasswordsExapmle); 
}); 


  app.post('/confirmPasswordsExapmle', (req, res) => { 
  
    const { confirmPassword } = req.body; 
    if (!confirmPassword) { 
      return res.status(400).json({ error: 'La contraseña es obligatoria' }); 
    } 
  
    const newConfirmPassword = { 
      id: confirmPasswordsExapmle.length + 1, 
      confirmPassword 
    }; 
  
  
    confirmPasswordsExapmle.push(newConfirmPassword); 
    res.status(201).json(newConfirmPassword); 
  
}); 


app.listen(3001, () => { 

  console.log('user-service corriendo en http://localhost:3001'); 

}); 