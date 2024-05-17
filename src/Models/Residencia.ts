class Residencia {
    private titulo?                : string    | null = null;
    private precio?                : number    | null = null;
    private moneda?                : string    | null = null;
    private ubicacion?             : string    | null = null;
    private caracteristicas?       : string    | null = null;
    private tipo_ambientes?        : string    | null = null;
    private instalaciones?         : string    | null = null;
    private servicios?             : string    | null = null;
    private caracteristicas_depto? : string    | null = null;
    private servicios_depto?       : string    | null = null;
    private instalaciones_edificio?: string    | null = null;
    private descripcion?           : string    | null = null;
    private m2?                    : number    | null = null;
    private dormitorio?            : number    | null = null;
    private banos?                 : number    | null = null;
    private ambientes?             : number    | null = null;
    private resumen?               : string    | null = null;

    constructor() {}

    // Getters
    getTitulo() {
        return this.titulo;
    }

    getPrecio() {
        return this.precio;
    }

    getMoneda() {
        return this.moneda;
    }

    getUbicacion() {
        return this.ubicacion;
    }

    getCaracteristicas() {
        return this.caracteristicas;
    }

    getTipoAmbientes() {
        return this.tipo_ambientes;
    }

    getInstalaciones() {
        return this.instalaciones;
    }

    getServicios() {
        return this.servicios;
    }

    getCaracteristicasDepto() {
        return this.caracteristicas_depto;
    }

    getServiciosDepto() {
        return this.servicios_depto;
    }

    getInstalacionesEdificio() {
        return this.instalaciones_edificio;
    }

    getDescripcion() {
        return this.descripcion;
    }

    getM2() {
        return this.m2;
    }

    getDormitorio() {
        return this.dormitorio;
    }

    getBanos() {
        return this.banos;
    }

    getAmbientes() {
        return this.ambientes;
    }

    getResumen() {
        return this.resumen;
    }

    // Setters
    setTitulo(titulo: string | null) {
        this.titulo = titulo;
    }

    setPrecio(precio: number | null) {
        this.precio = precio;
    }

    setMoneda(moneda: string | null) {
        this.moneda = moneda;
    }

    setUbicacion(ubicacion: string | null) {
        this.ubicacion = ubicacion;
    }

    setCaracteristicas(caracteristicas: string | null) {
        this.caracteristicas = caracteristicas;
    }

    setTipoAmbientes(tipo_ambientes: string | null) {
        this.tipo_ambientes = tipo_ambientes;
    }

    setInstalaciones(instalaciones: string | null) {
        this.instalaciones = instalaciones;
    }

    setServicios(servicios: string | null) {
        this.servicios = servicios;
    }

    setCaracteristicasDepto(caracteristicas_depto: string | null) {
        this.caracteristicas_depto = caracteristicas_depto;
    }

    setServiciosDepto(servicios_depto: string | null) {
        this.servicios_depto = servicios_depto;
    }

    setInstalacionesEdificio(instalaciones_edificio: string | null) {
        this.instalaciones_edificio = instalaciones_edificio;
    }

    setDescripcion(descripcion: string | null) {
        this.descripcion = descripcion;
    }

    setM2(m2: number | null) {
        this.m2 = m2;
    }

    setDormitorio(dormitorio: number | null) {
        this.dormitorio = dormitorio;
    }

    setBanos(banos: number | null) {
        this.banos = banos;
    }

    setAmbientes(ambientes: number | null) {
        this.ambientes = ambientes;
    }

    setResumen(resumen: string | null) {
        this.resumen = resumen;
    }
}

export { Residencia };
