package vlabs.rest.config.websocket;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.http.server.PathContainer;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.handler.AbstractHandlerMapping;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.util.pattern.PathPattern;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.UnicastProcessor;
import vlabs.rest.api.ws.BasicWebSocketHandler;
import vlabs.rest.api.ws.BasicWebSocketMessage;

@Component
public class VLabWebSocketHandlerMapping extends AbstractHandlerMapping {

    private static final Logger log = LoggerFactory.getLogger(VLabWebSocketHandlerMapping.class);

    private boolean lazyInitHandlers = false;

    private Map<PathPattern, Object> handlerMap = new LinkedHashMap<>();

    public VLabWebSocketHandlerMapping() {
        initApplicationContext();
        setOrder(-1);
    }

    public Mono<Boolean> addMapping(String url) {
        try {
            UnicastProcessor<BasicWebSocketMessage> messagePublisher = UnicastProcessor.create();
            Flux<BasicWebSocketMessage> messages = messagePublisher.replay(0).autoConnect();

            registerHandler(url, new BasicWebSocketHandler(messagePublisher, messages));

            return Mono.just(true);
        } catch (IllegalStateException ex) {
            log.warn("VLabWebSocketHandlerMapping already exists for URL: " + url);
            return Mono.just(false);
        }
    }

    public Mono<Boolean> removeMapping(String url) {
        PathPattern pattern = getPathPatternParser().parse(url);
        if (this.handlerMap.containsKey(pattern)) {
            BasicWebSocketHandler handler = (BasicWebSocketHandler) this.handlerMap.get(pattern);
            handler.terminate();
            this.handlerMap.remove(pattern);
            log.warn("VLabWebSocketHandlerMapping for the URL [" + url + "] removed");
            return Mono.just(true);
        } else {
            return Mono.just(false);
        }
    }



    /**
     * Set whether to lazily initialize handlers. Only applicable to
     * singleton handlers, as prototypes are always lazily initialized.
     * Default is "false", as eager initialization allows for more efficiency
     * through referencing the controller objects directly.
     * <p>If you want to allow your controllers to be lazily initialized,
     * make them "lazy-init" and set this flag to true. Just making them
     * "lazy-init" will not work, as they are initialized through the
     * references from the handler mapping in this case.
     */
    public void setLazyInitHandlers(boolean lazyInitHandlers) {
        this.lazyInitHandlers = lazyInitHandlers;
    }

    /**
     * Return a read-only view of registered path patterns and handlers which may
     * may be an actual handler instance or the bean name of lazily initialized
     * handler.
     */
    public final Map<PathPattern, Object> getHandlerMap() {
        return Collections.unmodifiableMap(this.handlerMap);
    }


    @Override
    public Mono<Object> getHandlerInternal(ServerWebExchange exchange) {
        PathContainer lookupPath = exchange.getRequest().getPath().pathWithinApplication();
        Object handler;
        try {
            handler = lookupHandler(lookupPath, exchange);
        }
        catch (Exception ex) {
            return Mono.error(ex);
        }

        if (handler != null && logger.isDebugEnabled()) {
            logger.debug("Mapping [" + lookupPath + "] to " + handler);
        }
        else if (handler == null && logger.isTraceEnabled()) {
            logger.trace("No handler mapping found for [" + lookupPath + "]");
        }

        return Mono.justOrEmpty(handler);
    }

    /**
     * Look up a handler instance for the given URL lookup path.
     * <p>Supports direct matches, e.g. a registered "/test" matches "/test",
     * and various path pattern matches, e.g. a registered "/t*" matches
     * both "/test" and "/team". For details, see the PathPattern class.
     * @param lookupPath URL the handler is mapped to
     * @param exchange the current exchange
     * @return the associated handler instance, or {@code null} if not found
     * @see org.springframework.web.util.pattern.PathPattern
     */
    @Nullable
    protected Object lookupHandler(PathContainer lookupPath, ServerWebExchange exchange)
            throws Exception {

        return this.handlerMap.entrySet().stream()
                .filter(entry -> entry.getKey().matches(lookupPath))
                .sorted((entry1, entry2) ->
                        PathPattern.SPECIFICITY_COMPARATOR.compare(entry1.getKey(), entry2.getKey()))
                .findFirst()
                .map(entry -> {
                    PathPattern pattern = entry.getKey();
                    if (logger.isDebugEnabled()) {
                        logger.debug("Matching pattern for request [" + lookupPath + "] is " + pattern);
                    }
                    PathContainer pathWithinMapping = pattern.extractPathWithinPattern(lookupPath);
                    return handleMatch(entry.getValue(), pattern, pathWithinMapping, exchange);
                })
                .orElse(null);
    }

    private Object handleMatch(Object handler, PathPattern bestMatch, PathContainer pathWithinMapping,
            ServerWebExchange exchange) {

        // Bean name or resolved handler?
        if (handler instanceof String) {
            String handlerName = (String) handler;
            handler = obtainApplicationContext().getBean(handlerName);
        }

        validateHandler(handler, exchange);

        exchange.getAttributes().put(BEST_MATCHING_HANDLER_ATTRIBUTE, handler);
        exchange.getAttributes().put(BEST_MATCHING_PATTERN_ATTRIBUTE, bestMatch);
        exchange.getAttributes().put(PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, pathWithinMapping);

        return handler;
    }

    /**
     * Validate the given handler against the current request.
     * <p>The default implementation is empty. Can be overridden in subclasses,
     * for example to enforce specific preconditions expressed in URL mappings.
     * @param handler the handler object to validate
     * @param exchange current exchange
     */
    @SuppressWarnings("UnusedParameters")
    protected void validateHandler(Object handler, ServerWebExchange exchange) {
    }

    /**
     * Register the specified handler for the given URL paths.
     * @param urlPaths the URLs that the bean should be mapped to
     * @param beanName the name of the handler bean
     * @throws BeansException if the handler couldn't be registered
     * @throws IllegalStateException if there is a conflicting handler registered
     */
    protected void registerHandler(String[] urlPaths, String beanName)
            throws BeansException, IllegalStateException {

        Assert.notNull(urlPaths, "URL path array must not be null");
        for (String urlPath : urlPaths) {
            registerHandler(urlPath, beanName);
        }
    }

    /**
     * Register the specified handler for the given URL path.
     * @param urlPath the URL the bean should be mapped to
     * @param handler the handler instance or handler bean name String
     * (a bean name will automatically be resolved into the corresponding handler bean)
     * @throws BeansException if the handler couldn't be registered
     * @throws IllegalStateException if there is a conflicting handler registered
     */
    protected void registerHandler(String urlPath, Object handler)
            throws BeansException, IllegalStateException {

        Assert.notNull(urlPath, "URL path must not be null");
        Assert.notNull(handler, "Handler object must not be null");
        Object resolvedHandler = handler;

        // Parse path pattern
        urlPath = prependLeadingSlash(urlPath);
        PathPattern pattern = getPathPatternParser().parse(urlPath);
        if (this.handlerMap.containsKey(pattern)) {
            Object existingHandler = this.handlerMap.get(pattern);
            if (existingHandler != null) {
                if (existingHandler != resolvedHandler) {
                    throw new IllegalStateException(
                            "Cannot map " + getHandlerDescription(handler) + " to [" + urlPath + "]: " +
                            "there is already " + getHandlerDescription(existingHandler) + " mapped.");
                }
            }
        }

        // Eagerly resolve handler if referencing singleton via name.
        if (!this.lazyInitHandlers && handler instanceof String) {
            String handlerName = (String) handler;
            if (obtainApplicationContext().isSingleton(handlerName)) {
                resolvedHandler = obtainApplicationContext().getBean(handlerName);
            }
        }

        // Register resolved handler
        this.handlerMap.put(pattern, resolvedHandler);
        if (logger.isInfoEnabled()) {
            logger.info("Mapped URL path [" + urlPath + "] onto " + getHandlerDescription(handler));
        }
    }

    private static String prependLeadingSlash(String pattern) {
        if (StringUtils.hasLength(pattern) && !pattern.startsWith("/")) {
            return "/" + pattern;
        }
        else {
            return pattern;
        }
    }

    private String getHandlerDescription(Object handler) {
        return "handler " + (handler instanceof String ?
                "'" + handler + "'" : "of type [" + handler.getClass() + "]");
    }
}
