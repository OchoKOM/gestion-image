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
            const maxPixels = targetSize * targetSize;

            let width = img.width;
            let height = img.height;
            const currentPixels = width * height;
            const ratio = Math.sqrt(maxPixels / currentPixels);
            width *= ratio;
            height *= ratio;

            // Créer un canvas pour redimensionner et rogner l'image
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = targetSize;
            canvas.height = targetSize;

            // Redimensionner l'image
            context.drawImage(img, 0, 0, width, height);

            // Rogner l'image au centre
            const offsetX = (width - targetSize) / 2;
            const offsetY = (height - targetSize) / 2;
            context.drawImage(canvas, offsetX, offsetY, targetSize, targetSize, 0, 0, targetSize, targetSize);

            // Récupérer l'image rognée sous forme de data URL
            const dataUrl = canvas.toDataURL();
            canvas.toBlob(blob_object => {
                const blob = new Blob([blob_object], { type: 'image/webp' });
                const blobUrl = URL.createObjectURL(blob);

                const data = { blob, dataUrl, blobUrl }
                resolve(data);

            })
        };

        img.onerror = () => {
            reject(new Error('Failed to load image.'));
        };

        // Vérifier si l'entrée est un URL ou un objet Blob
        if (typeof imageSource === 'string') {
            img.src = imageSource; // Si c'est une URL, charger l'image à partir de l'URL
        } else if (imageSource instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
                img.src = reader.result; // Si c'est un objet Blob, charger l'image à partir des données Blob
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


function inputsCheck(stp = null) {
    if(!stp){
        return;
    }
    const step = stp;
    const all_inputs = step.querySelectorAll('input');
    return new Promise(async (resolve) => {
        let result = false;
        const requiredInputs = [];
        all_inputs.forEach(async (input)=>{
            const isRequired = Boolean(input.required);
            const  emptyRequired = await checkEmptyFields(input);
            if (isRequired && emptyRequired) {
                requiredInputs.push(input);
                InvalidInput(requiredInputs[0]);
            }
        });
         
        if (requiredInputs.length) {
            result = false;
            return;
        }
        if (step.querySelector("input[name='username']")) {
            const usernameInput = step.querySelector("input[name='username']");
            const emptyUsername = await checkEmptyFields(usernameInput);
            const usrn = emptyUsername && (await checkUserName(usernameInput));
            result = (!emptyUsername && usrn);
        }
        
        const passwordInputs = step.querySelectorAll('input[type="password"');

        if (passwordInputs.length === 2) {
            const  emptyPass = await checkEmptyFields(passwordInputs[0]);
            const pass = emptyPass && checkPasswordMatch({ input1: passwordInputs[0], input2: passwordInputs[1] });
            result = pass;
        }
        resolve(result);
    })
}