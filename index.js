// Fonction pour créer un avatar avec une lettre
async function createAvatar(letter, size = 200) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const avatarSize = size; // Taille par défaut si aucune taille n'est spécifiée
        canvas.width = avatarSize;
        canvas.height = avatarSize;

        // Couleur de fond aléatoire
        const backgroundColor = getRandomColor();

        // Dessiner un carré avec l'arrière-plan aléatoire
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, avatarSize, avatarSize);

        // Choisir la couleur du texte en fonction du contraste avec l'arrière-plan
        const textColor = getContrastColor(backgroundColor);

        // Dessiner la lettre au centre
        context.font = `${avatarSize / 2}px Arial`;
        context.fillStyle = textColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(letter.toUpperCase(), avatarSize / 2, avatarSize / 2);


        canvas.toBlob(blob_object => {
            // Convertir le canvas en objet blob et dataURL
            const dataUrl = canvas.toDataURL();
            const blob = new Blob([blob_object], { type: 'image/webp' });
            const blobUrl = URL.createObjectURL(blob);

            const data = { blob, dataUrl, blobUrl };
            resolve(data);
        })
    }); // Renvoie l'avatar sous forme de data URL
}
// createAvatar('a', 200)
//     .then(avatar => {
//         console.log(avatar.dataUrl); // Affiche l'URL de l'image redimensionnée et recadrée
//     })
//     .catch(error => {
//         console.error('Une erreur s\'est produite :', error);
//     });
function resizeAndCropImage(imageSource, targetSize) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Calculer la taille initiale de l'image
            let width = img.width;
            let height = img.height;

            // Calculer le nombre de pixels de l'image
            const currentPixels = width * height;

            // Calculer le nombre de pixels cible
            const targetPixels = targetSize * targetSize;

            // Calculer le ratio pour ajuster la taille de l'image
            const ratio = Math.sqrt(targetPixels / currentPixels);

            // Redimensionner l'image
            width *= ratio;
            height *= ratio;

            // Créer un canvas pour redimensionner et rogner l'image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            // Ajuster la taille du canvas en fonction de l'image
            canvas.width = width;
            canvas.height = height;

            // Redimensionner l'image sur le canvas
            context.drawImage(img, 0, 0, width, height);

            // Calculer les dimensions de rognage pour centrer l'image
            let offsetX = 0;
            let offsetY = 0;
            if (width > height) {
                offsetX = (width - height) / 2;
            } else {
                offsetY = (height - width) / 2;
            }

            // Créer un nouveau canvas pour rogner l'image à la taille cible
            const finalCanvas = document.createElement('canvas');
            const finalContext = finalCanvas.getContext('2d');
            finalCanvas.width = targetSize;
            finalCanvas.height = targetSize;

            // Rogner l'image au centre sur le nouveau canvas
            finalContext.drawImage(canvas, offsetX, offsetY, Math.min(width, height), Math.min(width, height), 0, 0, targetSize, targetSize);

            // Récupérer l'image rognée sous forme de data URL
            const dataUrl = finalCanvas.toDataURL();

            // Convertir le canvas en Blob
            finalCanvas.toBlob(blob => {
                const blobUrl = URL.createObjectURL(blob);
                const data = { blob, dataUrl, blobUrl };
                resolve(data);
            }, 'image/jpeg');
        };

        img.onerror = () => {
            reject(new Error('Failed to load image.'));
        };

        // Charger l'image à partir de l'URL ou des données Blob
        if (typeof imageSource === 'string') {
            img.src = imageSource;
        } else if (imageSource instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                img.src = reader.result;
            };
            reader.onerror = () => {
                reject(new Error('Failed to read Blob data.'));
            };
            reader.readAsDataURL(imageSource);
        } else {
            reject(new Error('Invalid image source.'));
        }
    });
}


// // Exemple d'utilisation :
// const imageUrlOrBlob = "./assets/img1.webp"; // URL ou Blob de l'image à redimensionner et recadrager

// const newSize = 200; // Taille souhaitée pour le côté du carré
// resizeAndCropImage(imageUrlOrBlob, newSize)
//     .then(croppedImage => {
//         console.log(croppedImage.dataUrl); // Affiche l'URL de l'image redimensionnée et recadrée
//     })
//     .catch(error => {
//         console.error('Une erreur s\'est produite :', error);
//     });

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getContrastColor(hexColor) {
    // Convertir le code hexadécimal en RGB
    let r = parseInt(hexColor.substr(1, 2), 16);
    let g = parseInt(hexColor.substr(3, 2), 16);
    let b = parseInt(hexColor.substr(5, 2), 16);

    // Calculer la luminance
    let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Choisir la couleur du texte en fonction de la luminance
    return luminance > 0.5 ? '#000' : '#fff';
}