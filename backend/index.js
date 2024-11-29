import express from 'express';
import dotenv from 'dotenv';
import connection from './config/database.js';
//routers
import veterinario from './routes/veterinario.js';
import paciente from './routes/paciente.js';


const app = express();
dotenv.config();
// Recibir datos del body 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexion a mi base de datos 
connection();




app.use('/api/veterinarios', veterinario);
app.use('/api/pacientes', paciente);






const PORT = process.env.PORT || 4000;


app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`);
});
