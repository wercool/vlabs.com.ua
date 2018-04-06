package vlabs.model.generic;

public class VLabsFileItem {

    String name;
    Boolean isDirectory = false;
    Long lastModified;

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Boolean getIsDirectory() {
        return isDirectory;
    }
    public void setIsDirectory(Boolean isDirectory) {
        this.isDirectory = isDirectory;
    }
    public Long getLastModified() {
        return lastModified;
    }
    public void setLastModified(Long lastModified) {
        this.lastModified = lastModified;
    }

}
