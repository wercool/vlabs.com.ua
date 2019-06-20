package vlabs.rest.model.interfaces;

public interface ISSEMessage {
    public long getSseId();
    public void setSseId(long sseId);
    public boolean getLastMessage();
    public void setLastMessage(boolean flag);
    public boolean getFirstMessage();
    public void setFirstMessage(boolean flag);
    public long getQueueLength();
    public void setQueueLength(long queueLength);
}
