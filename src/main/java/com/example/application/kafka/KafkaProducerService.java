package com.example.application.kafka;

import org.springframework.kafka.core.KafkaTemplate;

import com.example.application.reservation.Reservation;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;

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
