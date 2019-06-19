package vlabs.rest.common;

import javax.xml.bind.DatatypeConverter;

public class ImageUtils {
    public static byte[] convertDataURLToImageBytes(String dataURL) {
        return DatatypeConverter.parseBase64Binary(dataURL.substring(dataURL.indexOf(",") + 1));
    }
}
