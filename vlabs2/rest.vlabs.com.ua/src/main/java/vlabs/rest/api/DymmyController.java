package vlabs.rest.api;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/dummy")
public class DymmyController {
    @GetMapping
    public Mono<ResponseEntity<Object>> dummy() throws InterruptedException, ExecutionException {
        ExecutorService service = Executors.newSingleThreadExecutor();
        Future<JSONObject> retobj = service.submit(new FutureJSONObject());
        return Mono.just(new ResponseEntity<Object>(retobj.get().toString(), HttpStatus.OK));
    }
    private class FutureJSONObject implements Callable<JSONObject> {
        FutureJSONObject() {
        }
        @Override
        public JSONObject call() throws InterruptedException, JSONException {
            Thread.sleep(50);
            JSONObject responseObject = new JSONObject();
            responseObject.put("dummyData", "50 ms delayed response");
            return responseObject;
        }
    }
}
