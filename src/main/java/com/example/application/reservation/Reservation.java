package com.example.application.reservation;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record Reservation(@NotBlank String id, @NotNull LocalDate date, @NotBlank String customer) {
}
