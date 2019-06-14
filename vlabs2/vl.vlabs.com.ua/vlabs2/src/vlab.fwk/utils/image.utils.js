export function blackToTransparent(imageData) {
    var data = imageData.data;
    // Get the pixel data from the source.
    // Iterate through all the pixels.
    for (var i = 0; i < data.length; i += 4) {
        if(data[i + 0] + data[i + 1] + data[i + 2] < 50) {
            data[i + 3] = 0;
        }
    }
    return imageData;
};