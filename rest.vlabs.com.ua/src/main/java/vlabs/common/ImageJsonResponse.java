package vlabs.common;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
public class ImageJsonResponse { 
    String imageData;

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = "data:image/jpg;base64," + imageData;
    }
    
}
