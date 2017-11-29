package utils;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;

public class BufferedImageUtils {
    public static BufferedImage resize(BufferedImage img, int scaledWidth, int scaledHeight, boolean preserveRatio) {
        if (preserveRatio) { 
            double imageHeight = img.getHeight();
            double imageWidth = img.getWidth();

            if (imageHeight/scaledHeight > imageWidth/scaledWidth) {
                scaledWidth = (int) (scaledHeight * imageWidth / imageHeight);
            } else {
                scaledHeight = (int) (scaledWidth * imageHeight / imageWidth);
            }        
        }

        Image tmp = img.getScaledInstance(scaledWidth, scaledHeight, Image.SCALE_SMOOTH);
        BufferedImage resizedImg = new BufferedImage(scaledWidth, scaledHeight, img.getType());

        Graphics2D g2d = resizedImg.createGraphics();
        g2d.drawImage(tmp, 0, 0, null);
        g2d.dispose();

        return resizedImg;
    } 
}
