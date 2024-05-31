class Residencia {
    private titulo:                     string | null = "No indica";
    private precio:                     number | null = 0;
    private moneda:                     string | null = "No indica";
    private ubicacion:                  string | null = "No indica";
    private descripcion:                string | null = "No indica";
    private cantDormitorios:            number | null = 0;
    private cantBanos:                  number | null = 0;
    private cantAmbientes:              number | null = 0;
    private cantPlantas:                number | null = 0;
    private orientacion:                string | null = "No indica";
    private servicios:                  string | null = "No indica";
    private m2Totales:                  number | null = 0;
    private m2Cubiertos:                number | null = 0;
    private tipoAmbientes:              string | null = "No indica";
    private transaccion:                string | null = "No indica";
    private url:                        string | null = "No indica";
    private caracteristicas:            string | null = "No indica";
    private instalaciones:              string | null = "No indica";
    private publicador:                 string | null = "No indica";
    private fechaPublicacion:           string | null = "No indica";
    private serviciosDepto:             string | null = "No indica";
    private instalacionesEdificio:      string | null = "No indica";

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

    getDescripcion() {
        return this.descripcion;
    }

    getCantDormitorios() {
        return this.cantDormitorios;
    }

    getCantBanos() {
        return this.cantBanos;
    }

    getCantAmbientes() {
        return this.cantAmbientes;
    }

    getCantPlantas() {
        return this.cantPlantas;
    }

    getOrientacion() {
        return this.orientacion;
    }

    getServicios() {
        return this.servicios;
    }

    getM2Totales() {
        return this.m2Totales;
    }

    getM2Cubiertos() {
        return this.m2Cubiertos;
    }

    getTipoAmbientes() {
        return this.tipoAmbientes;
    }

    getTransaccion() {
        return this.transaccion;
    }

    getUrl() {
        return this.url;
    }

    getCaracteristicas() {
        return this.caracteristicas;
    }

    getInstalaciones() {
        return this.instalaciones;
    }

    getPublicador() {
        return this.publicador;
    }

    getFechaPublicacion() {
        return this.fechaPublicacion;
    }

    // Calculo de precio por metro cuadrado cubierto
    getPrecioPorM2Cubiertos() {
        if (this.precio && this.m2Cubiertos) {
            return this.precio / this.m2Cubiertos;
        }
        return null;
    }

    // Calculo de precio por metro cuadrado total
    getPrecioPorM2() {
        if (this.precio && this.m2Totales) {
            return this.precio / this.m2Totales;
        }
        return null;
    }

    getserviciosDepto() {
        return this.serviciosDepto;
    }

    getinstalacionesEdificio() {
        return this.instalacionesEdificio;
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

    setDescripcion(descripcion: string | null) {
        this.descripcion = descripcion;
    }

    setCantDormitorios(cantDormitorios: number | null) {
        this.cantDormitorios = cantDormitorios;
    }

    setCantBanos(cantBanos: number | null) {
        this.cantBanos = cantBanos;
    }

    setCantAmbientes(cantAmbientes: number | null) {
        this.cantAmbientes = cantAmbientes;
    }

    setCantPlantas(cantPlantas: number | null) {
        this.cantPlantas = cantPlantas;
    }

    setOrientacion(orientacion: string | null) {
        this.orientacion = orientacion;
    }

    setServicios(servicios: string | null) {
        this.servicios = servicios;
    }

    setM2Totales(m2Totales: number | null) {
        this.m2Totales = m2Totales;
    }

    setM2Cubiertos(m2Cubiertos: number | null) {
        this.m2Cubiertos = m2Cubiertos;
    }

    setTipoAmbientes(tipoAmbientes: string | null) {
        this.tipoAmbientes = tipoAmbientes;
    }

    setTransaccion(transaccion: string | null) {
        this.transaccion = transaccion;
    }

    setUrl(url: string | null) {
        this.url = url;
    }

    setCaracteristicas(caracteristicas: string | null) {
        this.caracteristicas = caracteristicas;
    }

    setInstalaciones(instalaciones: string | null) {
        this.instalaciones = instalaciones;
    }

    setPublicador(publicador: string | null) {
        this.publicador = publicador;
    }

    setFechaPublicacion(fechaPublicacion: string | null) {
        this.fechaPublicacion = fechaPublicacion;
    }

    setserviciosDepto(serviciosDepto: string | null) {
        this.serviciosDepto = serviciosDepto;
    }

    setinstalacionesEdificio(instalacionesEdificio: string | null) {
        this.instalacionesEdificio = instalacionesEdificio;
    }
}

export { Residencia };
