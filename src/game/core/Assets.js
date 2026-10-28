// Carga de atlas (imagen + JSON de frames) a partir del manifiesto.
export class Assets {
  constructor() {
    this.sheets = {};
  }

  async load(manifest) {
    const entries = await Promise.all(
      Object.entries(manifest).map(async ([name, def]) => {
        const [image, frames] = await Promise.all([loadImage(def.image), loadJson(def.frames)]);
        return [name, { image, frames }];
      }),
    );
    this.sheets = Object.fromEntries(entries);
    return this;
  }

  sheet(name) {
    return this.sheets[name];
  }

  frame(sheetName, frameName) {
    return this.sheets[sheetName]?.frames[frameName];
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo cargar la imagen: ' + src));
    img.src = src;
  });
}

async function loadJson(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error('No se pudo cargar ' + src);
  return res.json();
}
