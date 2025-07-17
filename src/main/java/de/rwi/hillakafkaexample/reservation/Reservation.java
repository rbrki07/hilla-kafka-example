package de.rwi.hillakafkaexample.reservation;

import java.time.LocalDate;

import org.jspecify.annotations.NonNull;

public record Reservation(@NonNull String id, @NonNull LocalDate date, @NonNull String customer) {
}
