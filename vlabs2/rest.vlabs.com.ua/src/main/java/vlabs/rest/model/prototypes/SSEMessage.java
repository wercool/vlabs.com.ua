package vlabs.rest.model.prototypes;

import vlabs.rest.model.interfaces.ISSEMessage;

public class SSEMessage implements ISSEMessage{
    long sseId = 0;
    boolean lastMessage = false;

    @Override
    public long getSseId() {
        return this.sseId;
    }
    @Override
    public void setSseId(long sseId) {
        this.sseId = sseId;
    }
    @Override
    public boolean getLastMessage() {
        return this.lastMessage;
    }
    @Override
    public void setLastMessage(boolean flag) {
        this.lastMessage = flag;
    }
}
