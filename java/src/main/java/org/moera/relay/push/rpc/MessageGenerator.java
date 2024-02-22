package org.moera.relay.push.rpc;

import java.text.Format;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.MissingResourceException;
import java.util.ResourceBundle;
import java.util.Set;

import com.ibm.icu.text.MessageFormat;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;

@Component
public class MessageGenerator {

    private static final Set<String> AVAILABLE_LOCALES = Set.of("en", "pl", "ru", "uk");

    private final Map<Locale, Map<String, Format>> formats = new HashMap<>();

    public String format(String lang, String key, Object params) {
        lang = lang.toLowerCase();
        Locale locale = !ObjectUtils.isEmpty(lang) && AVAILABLE_LOCALES.contains(lang)
                ? Locale.forLanguageTag(lang)
                : Locale.ENGLISH;
        return format(locale, key, params);
    }

    public String format(Locale locale, String key, Object params) {
        Format format = getFormat(locale, key);
        return format != null ? format.format(params) : key;
    }

    private Format getFormat(Locale locale, String key) {
        return formats
                .computeIfAbsent(locale, l -> new HashMap<>())
                .computeIfAbsent(key, k -> {
                    ResourceBundle bundle = ResourceBundle.getBundle("messages", locale);
                    try {
                        String format = bundle.getString(key);
                        return new MessageFormat(format, locale);
                    } catch (MissingResourceException e) {
                        return null;
                    }
                });
    }

}
