;
window.adm_texture_status = window.adm_texture_status || 0;
if (window.adm_texture_status < 10) {
    const width = i;
    const height = r;
    const length = width * height * 4;
    const row = width * 4;
    const end = (height - 1) * row;

    let temp = new Uint8Array(length);
    let data = new Uint8Array(length);

    t.readPixels(0, 0, width, height, t.RGBA, t.UNSIGNED_BYTE, temp);

    for (let j = 0; j < length; j += row) {
        data.set(temp.subarray(j, j + row), end - j);
    }

    let canvas = document.createElement("canvas");
    let context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;

    var idata = context.createImageData(i, r);
    idata.data.set(data);
    context.putImageData(idata, 0, 0);
    canvas.remove();
    
    window.adm_download(`texture(${window.adm_texture_status})_(${i}x${r}).png`, canvas.toDataURL('image/png'));
    window.adm_texture_status++;
}
;