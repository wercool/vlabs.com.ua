package vlabs.rest.service.valter.slam;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.opencv.core.Mat;
import org.opencv.core.MatOfByte;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.UnicastProcessor;
import vlabs.rest.api.ws.BasicWebSocketMessage;
import vlabs.rest.common.ImageUtils;
import vlabs.rest.model.valter.slam.SLAMRGBDBytesCmdVelOrientationTuple;
import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTuple;
import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTupleNormalized;
import vlabs.rest.repository.mongo.valter.slam.SLAMRGBDCmdVelOrientationTupleRepository;

@Service
public class ValterSLAMService {
    private static final Logger log = LoggerFactory.getLogger(ValterSLAMService.class);

    long numOfTuples;
    long processedTuplesCnt;

    @Autowired
    SLAMRGBDCmdVelOrientationTupleRepository slamRGBDCmdVelOrientationTupleRepository;

    @Autowired
    UnicastProcessor<BasicWebSocketMessage> basicWebSocketMessagePublisher;

    public Mono<SLAMRGBDCmdVelOrientationTuple> saveSLAMRGBDCmdVelOrientationTuple(SLAMRGBDCmdVelOrientationTuple slamRGBDCmdVelOrientationTuple) {
        return slamRGBDCmdVelOrientationTupleRepository.save(slamRGBDCmdVelOrientationTuple);
    }

    public Flux<SLAMRGBDCmdVelOrientationTuple> getSLAMRGBDCmdVelOrientationTuples() {
        return slamRGBDCmdVelOrientationTupleRepository.findAll();
    }

    public Flux<SLAMRGBDBytesCmdVelOrientationTuple> getSLAMRGBDBytesCmdVelOrientationTuples() {
        return slamRGBDCmdVelOrientationTupleRepository.findAll().map(slamRGBDCmdVelOrientationTuple -> {
            SLAMRGBDBytesCmdVelOrientationTuple slamRGBDBytesCmdVelOrientationTuple = new SLAMRGBDBytesCmdVelOrientationTuple(slamRGBDCmdVelOrientationTuple);

            byte[] rgbImageRGBABytes = ImageUtils.convertDataURLToImageBytes(slamRGBDCmdVelOrientationTuple.getRgbImageData());
            Mat rgbaImageMat = Imgcodecs.imdecode(new MatOfByte(rgbImageRGBABytes), Imgcodecs.CV_LOAD_IMAGE_UNCHANGED);
            Mat rgbImageMat = new Mat();
            Imgproc.cvtColor(rgbaImageMat, rgbImageMat, Imgproc.COLOR_RGBA2RGB);
            int rgbImageMatBytesLength = (int) (rgbImageMat.total() * rgbImageMat.elemSize());
            byte[] rgbImageMatBytes = new byte[rgbImageMatBytesLength];
            rgbImageMat.get(0, 0, rgbImageMatBytes);
            slamRGBDBytesCmdVelOrientationTuple.setRgbImageData(rgbImageMatBytes);

            return slamRGBDBytesCmdVelOrientationTuple;
        });
    }

    public Flux<SLAMRGBDCmdVelOrientationTupleNormalized> getSLAMRGBDCmdVelOrientationTuplesNormalized() {
        this.numOfTuples = 0;
        this.processedTuplesCnt = 0;
        return 
            slamRGBDCmdVelOrientationTupleRepository
            .count()
            .doOnSuccess(tuplesNum -> {
                this.numOfTuples = tuplesNum;
            })
            .thenMany(
                this.getSLAMRGBDBytesCmdVelOrientationTuples().map(slamRGBDBytesCmdVelOrientationTuple -> {
                    SLAMRGBDCmdVelOrientationTupleNormalized slamRGBDCmdVelOrientationTupleNormalized = new SLAMRGBDCmdVelOrientationTupleNormalized(slamRGBDBytesCmdVelOrientationTuple);

                    byte[] rgbImageMatBytes = slamRGBDBytesCmdVelOrientationTuple.getRgbImageData();
                    double[] rgbImageDataNorm = new double[rgbImageMatBytes.length]; 
                    for (int i = 0; i < rgbImageMatBytes.length; i++) {
                        double value = (Byte.toUnsignedInt(rgbImageMatBytes[i]) / 127.5 - 1.0);
                        Double truncatedDouble = 
                                BigDecimal.valueOf(value)
                                .setScale(4, RoundingMode.HALF_UP)
                                .doubleValue();
                        rgbImageDataNorm[i] = truncatedDouble;
                    }
                    slamRGBDCmdVelOrientationTupleNormalized.setRgbImageData(rgbImageDataNorm);

                    this.processedTuplesCnt++;

                    slamRGBDCmdVelOrientationTupleNormalized.setSseId(this.processedTuplesCnt);
//                    BasicWebSocketMessage progressMessage = new BasicWebSocketMessage("progress", String.format("%d of %d tuples processed", this.processedTuplesCnt, this.numOfTuples));
//                    basicWebSocketMessagePublisher.onNext(progressMessage);
//                    basicWebSocketMessagePublisher.publish();

                    if (this.processedTuplesCnt == this.numOfTuples) {
                        slamRGBDCmdVelOrientationTupleNormalized.setLastMessage(true);
                    }

                    return slamRGBDCmdVelOrientationTupleNormalized;
                })
            );
    }
}
