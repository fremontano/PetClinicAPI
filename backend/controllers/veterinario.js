import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import Veterinario from "../models/veterinario.js";



const registrar = async (req, res) => {
    //Prevenir usuarios duplicados
    const { email } = req.body;

    try {
        const existeUsuario = await Veterinario.findOne({ email });

        if (existeUsuario) {
            const error = new Error('Usuario ya registrado');
            return res.status(400).json({ msg: error.message });
        }

        // Crear una nueva instancia del modelo Veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save();

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
    res.status(200).json({
        status: 'success',
        message: 'Ruta para obtener el perfil del perfil',
    });
};



//Confirmar por token personalizado 
const confirmar = async (req, res) => {

    // Recoger token de la url 
    const { token } = req.params;
    const usuario = await Veterinario.findOne({ token });

    if (!usuario) {
        const error = new Error('Token no valido');
        return res.status(404).json({ msg: error.message });
    }

    try {
        usuario.token = false;
        usuario.confirmado = true;
        await usuario.save();

        res.status(200).json({
            status: 'success',
            message: 'Usuario confirmado exitosamente',
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

    // Comprobar si el usuario esta confirmado 
    if (!usuario.confirmado) {
        const error = new Error('Tu Cuenta no ha sido confoirmada');
        return res.status(404).json({ msg: error.message });
    }

    //Comprobar el password
    if (await usuario.comprobarPassword(password)) {

        //Autenticar llamar el metodo jwt
        res.json({ token: generarJWT(usuario.id) });


    } else {
        const error = new Error('El Password es incorrecto');
        return res.status(404).json({ msg: error.message });
    }

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
        res.status(200).json({ msg: 'Hemos enviado un email con las instrucciones' });
    } catch (error) {
        console.log(error);
    }

}

//Olvidar password
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


//Olvidar password
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
        return res.status(200).json({ msg: 'Password modificado correctamente' })
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
