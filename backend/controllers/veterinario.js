import { emailOlvidePassword } from "../helpers/emailOlvidePassword.js";
import { emailRegistro } from "../helpers/emailRegistro.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Veterinario from "../models/veterinario.js";



const registrar = async (req, res) => {
    //Prevenir usuarios duplicados
    const { email, nombre } = req.body;

    try {
        const existeUsuario = await Veterinario.findOne({ email });

        if (existeUsuario) {
            const error = new Error('Usuario ya registrado');
            return res.status(400).json({ msg: error.message });
        }

        // Crear una nueva instancia del modelo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();


        //Despues de almacenar usuario, enviar email
        emailRegistro({
            email,
            nombre,
            token: veterinarioGuardado.token
        });


        res.status(200).json({
            status: 'success',
            veterinarioGuardado,
            message: 'Usuario registrado exitosamente',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: 'Hubo un error al registrar el usuario',
        });
    }
};



const perfil = (req, res) => {
    const { veterinario } = req;
    if (!veterinario) {
        return res.status(404).json({ msg: 'No se encontró el perfil del usuario' });
    }
    res.json(veterinario);
};



//Confirmar por token personalizado 
const confirmar = async (req, res) => {

    // Recoger token de la url 
    const { token } = req.params;
    const usuario = await Veterinario.findOne({ token });

    if (!usuario) {
        const error = new Error('Token confirmado, ya es valido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        usuario.token = false;
        usuario.confirmado = true;
        await usuario.save();



        res.status(200).json({
            status: 'success',
            msg: 'Usuario confirmado exitosamente',
        });

    } catch (error) {
        console.log(error);
    }
};


//autenticar 
const autenticar = async (req, res) => {

    const { email, password } = req.body;

    const usuario = await Veterinario.findOne({ email });


    if (!usuario) {
        const error = new Error('El Usuario no existe');
        return res.status(404).json({ msg: error.message });
    }


    // Comprobar el password
    const passwordCorrecto = await usuario.comprobarPassword(password);

    if (!passwordCorrecto) {

        const error = new Error('El Email o el Contraseña es incorrecto');
        return res.status(401).json({ msg: error.message });
    }


    // Comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        const error = new Error('Tu Cuenta no ha sido confirmada');
        return res.status(403).json({ msg: error.message });
    }

    // Autenticar y generar el token
    res.json({ token: generarJWT(usuario.id) });


}


//Olvidar password
const olvidoPassword = async (req, res) => {

    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({ email });
    if (!existeVeterinario) {
        const error = new Error('El usuario no se encuentra');
        return res.status(400).json({ msg: error.message });
    }


    try {
        existeVeterinario.token = generarId();
        await existeVeterinario.save();

        //Enviar Email con intrucciones
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        });


        res.status(200).json({ msg: 'Hemos enviado un email con las instrucciones' });
    } catch (error) {
        console.log(error);
    }

}

//comprobarToken 
const comprobarToken = async (req, res) => {

    const { token } = req.params;

    const existeToken = await Veterinario.findOne({ token });

    if (existeToken) {
        res.status(200).json({
            message: 'Token Valido usuario existe'
        })

    } else {
        const error = new Error('El token no existe');
        return res.status(400).json({ msg: error.message });
    }
}


//nuevoPassword 
const nuevoPassword = async (req, res) => {

    const { token } = req.params;
    const { password } = req.body;

    // modificar el objeto 
    const veterinario = await Veterinario.findOne({ token });

    if (!veterinario) {
        const error = new Error('Ha ocurrido un error');
        return res.status(400).json({ msg: error.message });
    }


    try {
        veterinario.token = null;
        //modificar objeto
        veterinario.password = password;
        await veterinario.save();
        return res.status(200).json({ msg: 'Contraseña modificado correctamente' })
        console.log(veterinario);
    } catch (error) {
        console.log(error);
    }


    res.status(200).json({
        message: 'Ruta nuevoPassword'
    })

}


export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidoPassword,
    comprobarToken,
    nuevoPassword
};
