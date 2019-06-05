package vlabs.rest.utils.ann;

public class ANNUtils {
    /**
     * Normalizes value to -1...1
     * 
     * @param value
     * @param min
     * @param max
     * @return
     */
    public static double normalizeNegPos(double value, double min, double max) {
        return ( (value - min) / (max - min) - 0.5 ) * 2;
    }
}
