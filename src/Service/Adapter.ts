import { Request} from 'express';
import { Filters } from './Filters';

class Adapter {

    private static argumentsAdapter = (separator: string,wordSeparator:string, args:string[]): string => {
        
        const formattedArgs = args.map(arg => arg.replace(/\s+/g, wordSeparator));
        return formattedArgs.join(separator);
      }

    public static argenprop(req: Request): Filters{
        const filters: Filters = req.body;
        req.body.tipos_de_propiedades   = this.argumentsAdapter("-o-","-",filters.tipos_de_propiedad)
        req.body.tipos_de_transaccion   = this.argumentsAdapter("-o-","-",filters.tipos_de_transaccion)
        req.body.lista_de_barrios       = this.argumentsAdapter("-o-","-",filters.lista_de_barrios)
        if(req.body.m2_minimos && req.body.m2_maximos){
            req.body.m2 = `${req.body.m2_minimos}-${req.body.m2_maximos}-m2`
        }
        if(req.body.m2_maximos){
            req.body.m2 = `hasta-${req.body.m2_maximos}-m2`
        }else{
            req.body.m2 = `desde-${req.body.m2_minimos}-m2`
        }
        return filters

    }
    public zonaprop (req: Request){
        const filters: Filters = req.body;
        req.body.tipos_de_propiedades = this.argumentsAdapter("-o-","-",filters.tipos_de_propiedad)
        req.body.tipos_de_transaccion = this.argumentsAdapter("-o-","-",filters.tipos_de_transaccion)


    }
    public meli     (req: Request){
        const filters: Filters = req.body;
        req.body.tipos_de_propiedades = this.argumentsAdapter("-o-","-",filters.tipos_de_propiedad)
        req.body.tipos_de_transaccion = this.argumentsAdapter("-o-","-",filters.tipos_de_transaccion)

    }
}
export {Adapter}