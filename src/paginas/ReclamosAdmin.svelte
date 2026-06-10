<script lang="ts">
    let reclamosPendientes = [
    {
        id: 1,
        objeto: "Calculadora Casio",
        solicitante: "Carlos Gómez",
        correo: "cgomez@ues.edu.sv",
        descripcion:
            "La calculadora tiene una pegatina azul con mis iniciales.",
        fecha: "2026-06-12"
    },
    {
        id: 2,
        objeto: "USB Kingston",
        solicitante: "María Pérez",
        correo: "mperez@ues.edu.sv",
        descripcion:
            "Tiene una cinta roja en el extremo.",
        fecha: "2026-06-13"
    }];

    let reclamosAprobados: any[] = [];

    function aprobarReclamo(id: number) {

    const reclamo =
        reclamosPendientes.find(
            r => r.id === id
        );

    if (reclamo) {

        reclamosAprobados = [
            ...reclamosAprobados,
            reclamo
        ];

        reclamosPendientes =
            reclamosPendientes.filter(
                r => r.id !== id
            );
    }
}
</script>