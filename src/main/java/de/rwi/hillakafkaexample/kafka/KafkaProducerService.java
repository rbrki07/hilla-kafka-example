package de.rwi.hillakafkaexample.kafka;

import org.springframework.kafka.core.KafkaTemplate;

import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

import de.rwi.hillakafkaexample.reservation.Reservation;

@BrowserCallable
@AnonymousAllowed
public class KafkaProducerService {

    private final KafkaTemplate<String, Reservation> kafkaTemplate;

    public KafkaProducerService(KafkaTemplate<String, Reservation> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void produce(Reservation reservation) {
        kafkaTemplate.send("reservations", reservation);
    }
}
