const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const unsplashUrl = "https://api.unsplash.com/photos";
let page = 1;
const columnCount = 3; // Número de columnas para el masonry layout
const columnHeights: number[] = Array(columnCount).fill(0); // Alturas de cada columna

document.addEventListener("DOMContentLoaded", () => {
    const gallery: HTMLElement = document.getElementById('gallery')!;
    loadPhotos(); // Cargar las primeras fotos

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadPhotos();
        }
    });

    function loadPhotos() {
        const url = `${unsplashUrl}?client_id=${accessKey}&page=${page}&per_page=10`;

        fetch(url)
            .then(response => response.json())
            .then(data => displayPhotos(data))
            .catch(e => console.error(e));

        page++; // Incrementamos el número de página
    }

    function displayPhotos(photos: Array<{ urls: { small: string }; description: string }>): void {
        photos.forEach((photo) => {
            const img = document.createElement("img");
            img.src = photo.urls.small;
            img.alt = photo.description || "Unsplash photo";
            img.classList.add("masonry-item");
            console.log(img);
            img.onload = () => {
                // Posicionar las imágenes en la columna con menor altura
                const minColIndex = columnHeights.indexOf(Math.min(...columnHeights));
                const columnWidth = gallery.clientWidth / columnCount;

                img.style.width = `${columnWidth - 10}px`; // Ancho de la imagen menos los márgenes
                img.style.top = `${columnHeights[minColIndex]}px`; // Posición superior en la columna
                img.style.left = `${minColIndex * columnWidth}px`; // Posición a la izquierda

                // Actualizamos la altura de la columna seleccionada
                columnHeights[minColIndex] += img.height + 10; // Altura de la imagen más los márgenes
            };
            gallery.appendChild(img);
        });

        // Ajustamos la altura del contenedor para que envuelva las imágenes
        gallery.style.height = `${Math.max(...columnHeights)}px`;
    }
});
