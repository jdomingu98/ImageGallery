const button : HTMLButtonElement = document.querySelector("button")!;

const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const redirectURI = import.meta.env.VITE_UNSPLASH_REDIRECT_URI;

button.addEventListener("click", () => window.location.href = `https://unsplash.com/oauth/authorize?client_id=${accessKey}&redirect_uri=${redirectURI}&response_type=code&scope=public`);