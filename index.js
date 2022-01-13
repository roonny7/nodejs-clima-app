require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

console.log(process.env.MAPBOX_KEY);
const main = async() => {
    
    const busquedas = new Busquedas();
    let opt;

    
    do{
        opt = await inquirerMenu();
        console.log(({opt}))

        switch (opt) {
            case 1:
                //mostrar mensaje
                const termino = await leerInput('Ciudad : ');
                
                //buscar los lugares
                const lugares = await busquedas.ciudad(termino);
                
                
                //seleccionar lugar
                const id = await listarLugares(lugares);

                if (id === '0') continue;

                

                const lugarSel = lugares.find(l => l.id === id);
                //console.log({id});

                //guadar en db
                busquedas.agregarHistorial(lugarSel.nombre);

                //clima
                const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
                console.log(clima);

                //mostrar resultados
                console.log('\nInformación de la ciudad\n');
                console.log('Ciudad : ', lugarSel.nombre.green);
                console.log('Latitud :', lugarSel.lat);
                console.log('Longitud :', lugarSel.lng);
                console.log('Temperadura : ', clima.temp);
                console.log('Mínima : ', clima.min);
                console.log('Máxima : ', clima.max );
                console.log('Cómo está el clima : ', clima.desc);

            break;

            case 2: 
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log( `${ idx } ${ lugar }`);
                })
            break;
           
        }

        if (opt !==0) await pausa();


    } while (opt !== 0)

}


main();