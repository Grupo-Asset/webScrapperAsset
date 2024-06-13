import { Request } from 'express';
import { Filters } from './Filters';

const argumentsAdapter = (separator: string, wordSeparator: string, args: string[]): string => {
    console.log("args in argumentsAdapter:", args);
    const formattedArgs = args.map(arg => arg.replace(/\s+/g, wordSeparator));
    console.log("argsPost:", formattedArgs.join(separator));
    return formattedArgs.join(separator);
};

const adaptArgenprop = (req: Request): Filters => {
    const filters: Filters = { ...req.body };
    console.log("Received filters in adaptArgenprop:", filters);

    filters.tipos_de_propiedad = [argumentsAdapter("-o-", "-", filters.tipos_de_propiedad)];
    filters.tipos_de_transaccion = [argumentsAdapter("-o-", "-", filters.tipos_de_transaccion)];
    filters.lista_de_barrios = [argumentsAdapter("-o-", "-", filters.lista_de_barrios)];

    if (filters.m2_minimos && filters.m2_maximos) {
        filters.m2 = `${filters.m2_minimos}-${filters.m2_maximos}-m2`;
    } else if (filters.m2_maximos) {
        filters.m2 = `hasta-${filters.m2_maximos}-m2`;
    } else {
        filters.m2 = `desde-${filters.m2_minimos}-m2`;
    }

    console.log("filtersPost", filters);
    return filters;
};

const adaptZonaprop = (req: Request): Filters => {
    const filters: Filters = { ...req.body };
    console.log("Received filters in adaptZonaprop:", filters);

    filters.tipos_de_propiedad = [argumentsAdapter("-o-", "-", filters.tipos_de_propiedad)];
    filters.tipos_de_transaccion = [argumentsAdapter("-o-", "-", filters.tipos_de_transaccion)];
    filters.lista_de_barrios = [argumentsAdapter("-o-", "-", filters.lista_de_barrios)];

    if (filters.m2_minimos && filters.m2_maximos) {
        filters.m2 = `${filters.m2_minimos}-${filters.m2_maximos}-m2-cubiertos`;
    } else if (filters.m2_maximos) {
        filters.m2 = `hasta-${filters.m2_maximos}-m2-cubiertos`;
    } else {
        filters.m2 = `desde-${filters.m2_minimos}-m2-cubiertos`;
    }

    console.log("filtersPost", filters);
    return filters;
};

const adaptMeli = (req: Request): Filters => {
    const filters: Filters = { ...req.body };
    console.log("Received filters in adaptMeli:", filters);

    filters.tipos_de_propiedad = [argumentsAdapter("-", "-", filters.tipos_de_propiedad)];
    filters.tipos_de_transaccion = [argumentsAdapter("-", "-", filters.tipos_de_transaccion)];
    filters.lista_de_barrios = [argumentsAdapter("-", "-", filters.lista_de_barrios)];

    return filters;
};

export { adaptArgenprop, adaptZonaprop, adaptMeli };
