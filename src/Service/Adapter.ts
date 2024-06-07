import { Request} from 'express';
import { Filters } from './Filters';

class Adapter {

    private static argumentsAdapter = (separator: string,wordSeparator:string, args:string[]): string => {
        console.log("args:",args)
        const formattedArgs = args.map(arg => arg.replace(/\s+/g, wordSeparator));
        console.log("argsPost:",formattedArgs.join(separator))


        return formattedArgs.join(separator);
      }

    public static argenprop(req: Request): Filters{
        const filters: Filters = req.body;
        req.body.tipos_de_propiedad   = this.argumentsAdapter("-o-","-",filters.tipos_de_propiedad)
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
        console.log("filtersPost",filters)
        return filters

    }
    public static zonaprop (req: Request){
        const filters: Filters = req.body;
        req.body.tipos_de_propiedades = this.argumentsAdapter("-o-","-",filters.tipos_de_propiedad)
        req.body.tipos_de_transaccion = this.argumentsAdapter("-o-","-",filters.tipos_de_transaccion)
        if(req.body.m2_minimos && req.body.m2_maximos){
            req.body.m2 = `${req.body.m2_minimos}-${req.body.m2_maximos}-m2-cubiertos`
        }
        if(req.body.m2_maximos){
            req.body.m2 = `hasta-${req.body.m2_maximos}-m2-cubiertos`
        }else{
            req.body.m2 = `desde-${req.body.m2_minimos}-m2-cubiertos`
        }
        console.log("filtersPost",filters)
        return filters

    }
    public static meli     (req: Request){
        const filters: Filters = req.body;
        req.body.tipos_de_propiedades = this.argumentsAdapter("-","-",filters.tipos_de_propiedad)
        req.body.tipos_de_transaccion = this.argumentsAdapter("-","-",filters.tipos_de_transaccion)
        req.body.lista_de_barrios       = this.argumentsAdapter("-","-",filters.lista_de_barrios)
        return filters
    }
}
export {Adapter}