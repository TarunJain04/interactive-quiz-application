package com.example.quiz.util;

import java.util.Locale;

public final class Slugifier {
    private Slugifier() {
    }

    public static String slugify(String category) {
        if (category == null) return null;
        return category.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
    }
}
