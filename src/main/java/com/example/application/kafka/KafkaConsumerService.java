package com.example.application.kafka;

import org.jspecify.annotations.NonNull;
import org.springframework.kafka.annotation.KafkaListener;

import com.example.application.reservation.Reservation;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.publisher.Sinks.EmitResult;
import reactor.core.publisher.Sinks.Many;

@BrowserCallable
@AnonymousAllowed
public class KafkaConsumerService {

    private final Many<Reservation> reservationSink;

    public KafkaConsumerService() {
        this.reservationSink = Sinks.many().replay().all();
    }

    @KafkaListener(topics = "reservations", groupId = "reservation-consumer-group")
    private void consume(Reservation reservation) {
        reservationSink.emitNext(reservation, (signalType, emitResult) -> emitResult == EmitResult.FAIL_NON_SERIALIZED);
    }

    public Flux<@NonNull Reservation> getLatestReservation() {
        return reservationSink.asFlux();
    }

}
