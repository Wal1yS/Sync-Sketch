package com.example.canvas.util;

import java.util.Random;

public class NameGenerator {
    private static final String[] ADJECTIVES = {
        "Red", "Blue", "Swift", "Lazy", "Brave", "Calm", "Dark", "Epic", "Fast", "Gold",
        "Wild", "Cool", "Wise", "Bold", "Keen", "Pale", "Soft", "Tame", "Warm", "Zany"
    };
    private static final String[] NOUNS = {
        "Fox", "Bear", "Wolf", "Hawk", "Lion", "Duck", "Frog", "Crab", "Lynx", "Mole",
        "Deer", "Crow", "Newt", "Puma", "Ibis", "Toad", "Vole", "Wren", "Yak", "Zebu"
    };
    private static final Random RANDOM = new Random();

    public static String generate() {
        return ADJECTIVES[RANDOM.nextInt(ADJECTIVES.length)]
             + NOUNS[RANDOM.nextInt(NOUNS.length)];
    }
}