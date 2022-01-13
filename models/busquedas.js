const fs = require('fs');

const axios = require('axios');


class Busquedas {
    historial = [];
    dbPath = './db/database.json';


    constructor() {

        this.leerDB();


    }

    get historialCapitalizado() {

        return this.historial.map( lugar => {

            let palabras = lugar.split(' ');
            palabras = palabras.map ( palabra => palabra[0].toUpperCase() + palabra.substring(1));
            return palabras.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'limit' : 5,
            'access_token' : process.env.MAPBOX_KEY
        }
    }

    get paramsWeather() {
        return {
            appid : process.env.OPENWEATHER_KEY,
            units : 'metric',
            lang : 'es',



           // ?lat=18.50361&lon=-88.30528&appid=ebc2145fbbc87f75affcf157e800b3f4&units=metric&lang=es
        }
    }
    async ciudad( lugar = ''){
        //petición http
        //console.log('ciudad : ',lugar);
        try {
            const instance = axios.create({
                baseURL : `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params : this.paramsMapbox
            });
            
            const resp = await instance.get();            
            return resp.data.features.map ( lugar => ({
                id : lugar.id,
                nombre : lugar.place_name,
                lng : lugar.center[0],
                lat : lugar.center[1],
            }))
            
        
        } catch (error) {
            return [];
        }
        
        
    }

    async climaLugar( lat, lon ) {
       // console.log("valen ",lat, lon);
        try {
            //instance axios.create
            const instance = axios.create({
                baseURL : `https://api.openweathermap.org/data/2.5/weather`,
                params : { ...this.paramsWeather, lat, lon }
            })

            //respuesta.data
            const resp = await instance.get();
            const { weather, main } = resp.data;
            //console.log("tiene datos ", weather, main);
            return {
                desc : weather[0].description,
                min : main.temp_min,
                max : main.temp_max,
                temp : main.temp,                
            }



            
        } catch (error) {
            console.log(error)
        }

    }

    agregarHistorial ( lugar = ''){

        ///prevenir duplicados
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }

        this.historial = this.historial.splice(0,5);

        this.historial.unshift( lugar.toLocaleLowerCase() );

        //grabar en DB
        this.guardarDB();


    }

    guardarDB() {
        const payload = {
            historial : this.historial
        };

        
        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB() {

        console.log("ya entró a leer db");
        //debe de existir...
        if (!fs.existsSync(this.dbPath)){
            return null;
        }

        const info = fs.readFileSync(this.dbPath, { encoding : 'utf-8'});
        const data = JSON.parse(info);
        
        console.log(data);

        this.historial = data.historial;
    
    }


}

module.exports = Busquedas;