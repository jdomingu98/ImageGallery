const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const secretKey = import.meta.env.VITE_UNSPLASH_SECRET;
const redirectURI = import.meta.env.VITE_UNSPLASH_REDIRECT_URI;
const unsplashUrl = "https://api.unsplash.com";
let page = 1;
const columnCount = 3;
const gallery: HTMLElement = document.getElementById('gallery')!;
let columnHeights: number[] = Array(columnCount).fill(0);

function fetchAccessToken(code: string) : void {
    fetch('https://unsplash.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: accessKey,
            client_secret: secretKey,
            redirect_uri: redirectURI,  
            code: code,
            grant_type: 'authorization_code',
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token)
            localStorage.setItem('unsplash_access_token', data.access_token);
        else
            console.error('Error al obtener el token de acceso:', data);
    })
    .catch(error => console.error('Error:', error));
}

function loadPhotos() : void {
    const url = `${unsplashUrl}/photos?client_id=${accessKey}&page=${page}&per_page=10`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayPhotos(data);
            page++;
        })
        .catch(e => console.error(e));
}

function displayPhotos(photos: Array<{ urls: { small: string }; description: string }>): void {
    const imagePromises = photos.map((photo) => {
        return new Promise<HTMLImageElement>((resolve) => {
            const img = document.createElement("img");
            img.src = photo.urls.small;
            img.alt = photo.description || "Unsplash picture";
            img.classList.add("masonry-item");
            img.onload = () => {
                const minColIndex = columnHeights.indexOf(Math.min(...columnHeights));
                const columnWidth = gallery.clientWidth / columnCount;

                img.style.width = `${columnWidth - 10}px`;
                img.style.top = `${columnHeights[minColIndex]}px`;
                img.style.left = `${minColIndex * columnWidth}px`;

                columnHeights[minColIndex] += img.height + 10;
                resolve(img);
            };
            gallery.appendChild(img);
        });
    });

    Promise.all(imagePromises).then(() => {
        gallery.style.height = `${Math.max(...columnHeights)}px`;
    });
}

function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    
    return function (this: any, ...args: Parameters<T>): void {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code)
        fetchAccessToken(code);

    
    if (localStorage.getItem('unsplash_access_token') !== undefined)
        loadPhotos();

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            loadPhotos();
        }
    });
});

function updateLayout() {
    const columnCount = window.innerWidth > 1200 ? 4 : window.innerWidth > 768 ? 3 : 2;
    const columnWidth = gallery.clientWidth / columnCount;

    columnHeights = new Array(columnCount).fill(0);

    const images : NodeListOf<HTMLImageElement> = document.querySelectorAll(".masonry-item");

    images.forEach(img => {
        const minColIndex = columnHeights.indexOf(Math.min(...columnHeights));

        img.style.width = `${columnWidth - 10}px`;
        img.style.top = `${columnHeights[minColIndex]}px`;
        img.style.left = `${minColIndex * columnWidth}px`;

        columnHeights[minColIndex] += img.height + 10;
    });

    gallery.style.height = `${Math.max(...columnHeights)}px`;
}

window.addEventListener('resize', debounce(updateLayout, 300));


const LogoutButton : HTMLElement = document.getElementById('logout')!;

LogoutButton.addEventListener('click', () => {
    localStorage.removeItem('unsplash_access_token');
    window.location.href = '/';
});

const searchInput = document.getElementById('search-input') as HTMLInputElement;
const searchIcon = document.getElementById('search-icon') as HTMLElement;

searchIcon.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query)
        fetchSearchImages(query);
});

searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query)
            fetchSearchImages(query);
    }
});

function fetchSearchImages(query: string): void {
    const url = `${unsplashUrl}/search/photos?page=1&query=${query}`;
    const accessToken = localStorage.getItem('unsplash_access_token');

    fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(data => {
            gallery.innerHTML = '';
            columnHeights = Array(columnCount).fill(0);
            displayPhotos(data.results);
        })
        .catch(e => console.error(e));

    page = 2;
}