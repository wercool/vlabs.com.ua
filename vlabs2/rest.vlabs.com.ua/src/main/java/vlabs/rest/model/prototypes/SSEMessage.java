package vlabs.rest.model.prototypes;

import vlabs.rest.model.interfaces.ISSEMessage;

public class SSEMessage implements ISSEMessage{
    long sseId = 0;
    long queueLength = 0;
    boolean firstMessage = false;
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
    @Override
    public boolean getFirstMessage() {
        return this.firstMessage;
    }
    @Override
    public void setFirstMessage(boolean flag) {
        this.firstMessage = flag;
    }
    @Override
    public long getQueueLength() {
        return this.queueLength;
    }
    @Override
    public void setQueueLength(long queueLength) {
        this.queueLength = queueLength;
    }
}
